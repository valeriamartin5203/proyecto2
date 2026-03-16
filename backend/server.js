import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Verificar API key
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY no está definida");
    process.exit(1);
}

// Inicializar Gemini - MODELO CORRECTO
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Usar gemini-1.5-flash (sin el -latest)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configurar uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `reporte-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ========== RUTAS ==========

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ mensaje: "API funcionando" });
});

// Registro de usuarios
app.post("/registro", async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ mensaje: "Usuario y contraseña requeridos" });
        }

        // Verificar si existe
        db.get("SELECT * FROM users WHERE usuario = ?", [usuario], async (err, row) => {
            if (err) {
                return res.status(500).json({ mensaje: "Error en BD" });
            }

            if (row) {
                return res.json({ mensaje: "Usuario ya existe", success: false });
            }

            const hash = await bcrypt.hash(password, 10);
            db.run("INSERT INTO users (usuario, password) VALUES (?, ?)", 
                [usuario, hash], 
                function(err) {
                    if (err) {
                        return res.status(500).json({ mensaje: "Error al registrar" });
                    }
                    res.json({ mensaje: "Usuario registrado", success: true });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno" });
    }
});

// Login
app.post("/login", (req, res) => {
    const { usuario, password } = req.body;

    db.get("SELECT * FROM users WHERE usuario = ?", [usuario], async (err, row) => {
        if (err) {
            return res.status(500).json({ mensaje: "Error en BD" });
        }

        if (!row) {
            return res.json({ mensaje: "Usuario o contraseña incorrectos", success: false });
        }

        const valido = await bcrypt.compare(password, row.password);
        if (!valido) {
            return res.json({ mensaje: "Usuario o contraseña incorrectos", success: false });
        }

        res.json({ mensaje: "Login correcto", success: true, usuario: row.usuario });
    });
});

// Crear reporte con IA
app.post("/reportes", upload.single("imagen"), async (req, res) => {
    try {
        console.log("📸 Procesando reporte...");

        if (!req.file) {
            return res.status(400).json({ mensaje: "No se recibió imagen" });
        }

        const { usuario, modulo } = req.body;

        if (!usuario || !modulo) {
            // Limpiar archivo
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ mensaje: "Faltan datos" });
        }

        // Leer imagen
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString("base64");

        // Prompt para Gemini
        const prompt = `Analiza esta imagen y responde SOLO con un JSON con esta estructura:
        {
            "problema": "descripción del problema",
            "categoria": "Infraestructura/Limpieza/Seguridad/Tecnología/Servicios",
            "urgencia": "Baja/Media/Alta"
        }`;

        console.log("🤖 Enviando a Gemini...");
        
        // Llamar a Gemini
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
        ]);

        const responseText = result.response.text();
        console.log("Respuesta Gemini:", responseText);

        // Procesar respuesta
        let cleanJson = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const jsonMatch = cleanJson.match(/\{.*\}/s);
        if (jsonMatch) {
            cleanJson = jsonMatch[0];
        }

        let datos;
        try {
            datos = JSON.parse(cleanJson);
        } catch (e) {
            // Datos por defecto si falla
            datos = {
                problema: "Problema detectado en imagen",
                categoria: "Infraestructura",
                urgencia: "Media"
            };
        }

        // Guardar en BD
        db.run(
            `INSERT INTO reportes (usuario, modulo, problema, categoria, urgencia, imagen) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario, modulo, datos.problema, datos.categoria, datos.urgencia, req.file.filename],
            function(err) {
                if (err) {
                    console.error("Error BD:", err);
                    return res.status(500).json({ mensaje: "Error guardando reporte" });
                }

                console.log(`✅ Reporte guardado ID: ${this.lastID}`);
                res.json({
                    mensaje: "Reporte creado",
                    success: true,
                    id: this.lastID,
                    ...datos
                });
            }
        );

    } catch (error) {
        console.error("❌ Error:", error);
        
        // Limpiar archivo si existe
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            mensaje: "Error procesando reporte", 
            error: error.message 
        });
    }
});

// Obtener todos los reportes
app.get("/reportes", (req, res) => {
    db.all("SELECT * FROM reportes ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ mensaje: "Error obteniendo reportes" });
        }
        res.json(rows || []);
    });
});

// Servir imágenes
app.use("/uploads", express.static(uploadDir));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log("🚀 SERVIDOR INICIADO");
    console.log("=".repeat(50));
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`📁 Uploads: ${uploadDir}`);
    console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY ? "✓" : "✗"}`);
    console.log("=".repeat(50) + "\n");
});