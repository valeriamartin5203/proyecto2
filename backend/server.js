import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// ========== CORS CONFIGURACIÓN ==========
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-reportes.onrender.com';

app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options('*', cors());
app.use(express.json());

// ========== BASE DE DATOS ==========
import sqlite3 from "sqlite3";
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reportes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL,
        modulo TEXT NOT NULL,
        problema TEXT NOT NULL,
        categoria TEXT NOT NULL,
        urgencia TEXT NOT NULL,
        imagen TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

console.log("✅ Base de datos conectada");

// ========== GEMINI ==========
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY no definida");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODELO_GEMINI = "gemini-2.5-flash";
const model = genAI.getGenerativeModel({ model: MODELO_GEMINI });

console.log(`🤖 Gemini configurado: ${MODELO_GEMINI}`);

// ========== UPLOADS ==========
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, `reporte-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ========== RUTAS ==========
app.get("/", (req, res) => {
    res.json({ 
        mensaje: "🚀 API funcionando en Render",
        status: "online",
        modelo: MODELO_GEMINI
    });
});

app.get("/api/test", (req, res) => {
    res.json({ 
        message: "✅ Conexión exitosa", 
        frontend: req.headers.origin || 'desconocido'
    });
});

app.post("/registro", async (req, res) => {
    const { usuario, password } = req.body;
    db.get("SELECT * FROM users WHERE usuario = ?", [usuario], async (err, row) => {
        if (row) return res.json({ mensaje: "Usuario ya existe", success: false });
        const hash = await bcrypt.hash(password, 10);
        db.run("INSERT INTO users (usuario, password) VALUES (?, ?)", [usuario, hash], function(err) {
            if (err) return res.status(500).json({ mensaje: "Error", success: false });
            res.json({ mensaje: "Usuario registrado", success: true });
        });
    });
});

app.post("/login", (req, res) => {
    const { usuario, password } = req.body;
    db.get("SELECT * FROM users WHERE usuario = ?", [usuario], async (err, row) => {
        if (!row) return res.json({ mensaje: "Usuario incorrecto", success: false });
        const valido = await bcrypt.compare(password, row.password);
        if (!valido) return res.json({ mensaje: "Contraseña incorrecta", success: false });
        res.json({ mensaje: "Login correcto", success: true, usuario: row.usuario });
    });
});

app.post("/reportes", upload.single("imagen"), async (req, res) => {
    let imagePath = null;
    try {
        if (!req.file) return res.status(400).json({ mensaje: "No se recibió imagen", success: false });
        imagePath = req.file.path;

        const { usuario, modulo } = req.body;
        if (!usuario || !modulo) {
            fs.unlinkSync(imagePath);
            return res.status(400).json({ mensaje: "Faltan datos", success: false });
        }

        const userExists = await new Promise((resolve) => {
            db.get("SELECT id FROM users WHERE usuario = ?", [usuario], (err, row) => resolve(!!row));
        });

        if (!userExists) {
            fs.unlinkSync(imagePath);
            return res.status(400).json({ mensaje: "Usuario no existe", success: false });
        }

        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");

        const prompt = `Analiza esta imagen y responde SOLO con JSON:
        {"problema":"descripción","categoria":"Infraestructura/Limpieza/Seguridad/Tecnología/Servicios","urgencia":"Baja/Media/Alta"}`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
        ]);

        let responseText = result.response.text();
        let cleanJson = responseText.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanJson.match(/\{.*\}/s);
        if (jsonMatch) cleanJson = jsonMatch[0];

        let datos;
        try {
            datos = JSON.parse(cleanJson);
        } catch {
            datos = { problema: "Problema detectado", categoria: "Infraestructura", urgencia: "Media" };
        }

        db.run(
            `INSERT INTO reportes (usuario, modulo, problema, categoria, urgencia, imagen) VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario, modulo, datos.problema, datos.categoria, datos.urgencia, req.file.filename],
            function(err) {
                if (err) return res.status(500).json({ mensaje: "Error guardando", success: false });
                res.json({ mensaje: "Reporte guardado", success: true, reporte: { id: this.lastID, ...datos } });
            }
        );

    } catch (error) {
        if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        res.status(500).json({ mensaje: "Error", success: false });
    }
});

app.get("/reportes", (req, res) => {
    db.all("SELECT * FROM reportes ORDER BY id DESC", [], (err, rows) => {
        res.json(rows || []);
    });
});

app.use("/uploads", express.static(uploadDir));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend en puerto ${PORT}`);
    console.log(`🔗 Frontend permitido: ${FRONTEND_URL}`);
});