import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from 'cloudinary';

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
        imagen TEXT,  -- Aquí se guardará la URL de Cloudinary
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

// ========== CLOUDINARY ==========
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("✅ Cloudinary configurado");

// ========== MULTER CON MEMORY STORAGE ==========
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

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

// ========== CREAR REPORTE CON GEMINI + CLOUDINARY ==========
app.post("/reportes", upload.single("imagen"), async (req, res) => {
    try {
        // 1. Validar que llegue la imagen
        if (!req.file) {
            return res.status(400).json({ mensaje: "No se recibió imagen", success: false });
        }

        const { usuario, modulo } = req.body;
        if (!usuario || !modulo) {
            return res.status(400).json({ mensaje: "Faltan datos", success: false });
        }

        // 2. Verificar usuario
        const userExists = await new Promise((resolve) => {
            db.get("SELECT id FROM users WHERE usuario = ?", [usuario], (err, row) => resolve(!!row));
        });
        if (!userExists) {
            return res.status(400).json({ mensaje: "Usuario no existe", success: false });
        }

        // 3. Obtener buffer de la imagen
        const imageBuffer = req.file.buffer;
        const base64Image = imageBuffer.toString("base64");

        // 4. Analizar imagen con Gemini
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

        // 5. Subir imagen a Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'reportes' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(imageBuffer);
        });

        const imagenUrl = uploadResult.secure_url;  // URL pública de Cloudinary

        // 6. Guardar reporte en base de datos (guardamos la URL)
        db.run(
            `INSERT INTO reportes (usuario, modulo, problema, categoria, urgencia, imagen) VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario, modulo, datos.problema, datos.categoria, datos.urgencia, imagenUrl],
            function(err) {
                if (err) {
                    console.error("Error BD:", err);
                    return res.status(500).json({ mensaje: "Error guardando", success: false });
                }
                res.json({
                    mensaje: "Reporte guardado",
                    success: true,
                    reporte: {
                        id: this.lastID,
                        usuario,
                        modulo,
                        problema: datos.problema,
                        categoria: datos.categoria,
                        urgencia: datos.urgencia,
                        imagen: imagenUrl
                    }
                });
            }
        );

    } catch (error) {
        console.error("Error en /reportes:", error);
        res.status(500).json({ mensaje: "Error procesando reporte", success: false, error: error.message });
    }
});

// ========== OBTENER REPORTES ==========
app.get("/reportes", (req, res) => {
    db.all("SELECT * FROM reportes ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ mensaje: "Error" });
        res.json(rows || []);
    });
});

// ========== COMENTARIOS ==========
db.run(`
    CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporte_id INTEGER NOT NULL,
        usuario TEXT NOT NULL,
        texto TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        likes INTEGER DEFAULT 0,
        FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) console.error("Error creando tabla comentarios:", err);
    else console.log("✅ Tabla 'comentarios' lista");
});

app.get("/api/comentarios/:reporteId", (req, res) => {
    const { reporteId } = req.params;
    db.all(
        "SELECT * FROM comentarios WHERE reporte_id = ? ORDER BY fecha DESC",
        [reporteId],
        (err, rows) => {
            if (err) return res.status(500).json({ mensaje: "Error al obtener comentarios", success: false });
            res.json(rows || []);
        }
    );
});

app.post("/api/comentarios", (req, res) => {
    const { reporteId, usuario, texto } = req.body;
    if (!reporteId || !usuario || !texto) {
        return res.status(400).json({ mensaje: "Faltan datos", success: false });
    }
    db.run(
        "INSERT INTO comentarios (reporte_id, usuario, texto) VALUES (?, ?, ?)",
        [reporteId, usuario, texto],
        function(err) {
            if (err) return res.status(500).json({ mensaje: "Error al guardar comentario", success: false });
            res.json({
                mensaje: "Comentario agregado",
                success: true,
                comentario: {
                    id: this.lastID,
                    reporte_id: reporteId,
                    usuario,
                    texto,
                    fecha: new Date().toISOString(),
                    likes: 0
                }
            });
        }
    );
});

app.post("/api/comentarios/:id/like", (req, res) => {
    const { id } = req.params;
    db.run("UPDATE comentarios SET likes = likes + 1 WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ mensaje: "Error al dar like", success: false });
        res.json({ mensaje: "Like agregado", success: true });
    });
});

// ========== LIKES EN REPORTES ==========
db.run(`
    CREATE TABLE IF NOT EXISTS reportes_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporte_id INTEGER NOT NULL,
        usuario TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reporte_id, usuario),
        FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) console.error("Error creando tabla likes:", err);
    else console.log("✅ Tabla 'reportes_likes' lista");
});

app.get("/api/likes/:reporteId", (req, res) => {
    const { reporteId } = req.params;
    db.get("SELECT COUNT(*) as total FROM reportes_likes WHERE reporte_id = ?", [reporteId], (err, row) => {
        if (err) return res.status(500).json({ mensaje: "Error al obtener likes", success: false });
        res.json({ total: row?.total || 0 });
    });
});

app.get("/api/likes/:reporteId/:usuario", (req, res) => {
    const { reporteId, usuario } = req.params;
    db.get("SELECT * FROM reportes_likes WHERE reporte_id = ? AND usuario = ?", [reporteId, usuario], (err, row) => {
        if (err) return res.status(500).json({ mensaje: "Error al verificar like", success: false });
        res.json({ liked: !!row });
    });
});

app.post("/api/likes/toggle", (req, res) => {
    const { reporteId, usuario } = req.body;
    if (!reporteId || !usuario) return res.status(400).json({ mensaje: "Faltan datos", success: false });

    db.get("SELECT * FROM reportes_likes WHERE reporte_id = ? AND usuario = ?", [reporteId, usuario], (err, row) => {
        if (err) return res.status(500).json({ mensaje: "Error al verificar like", success: false });

        if (row) {
            db.run("DELETE FROM reportes_likes WHERE reporte_id = ? AND usuario = ?", [reporteId, usuario], function(err) {
                if (err) return res.status(500).json({ mensaje: "Error al quitar like", success: false });
                db.get("SELECT COUNT(*) as total FROM reportes_likes WHERE reporte_id = ?", [reporteId], (err, countRow) => {
                    res.json({ mensaje: "Like eliminado", success: true, liked: false, total: countRow?.total || 0 });
                });
            });
        } else {
            db.run("INSERT INTO reportes_likes (reporte_id, usuario) VALUES (?, ?)", [reporteId, usuario], function(err) {
                if (err) return res.status(500).json({ mensaje: "Error al dar like", success: false });
                db.get("SELECT COUNT(*) as total FROM reportes_likes WHERE reporte_id = ?", [reporteId], (err, countRow) => {
                    res.json({ mensaje: "Like agregado", success: true, liked: true, total: countRow?.total || 0 });
                });
            });
        }
    });
});

app.get("/api/likes/usuario/:usuario", (req, res) => {
    const { usuario } = req.params;
    db.all("SELECT reporte_id FROM reportes_likes WHERE usuario = ?", [usuario], (err, rows) => {
        if (err) return res.status(500).json({ mensaje: "Error al obtener likes del usuario", success: false });
        const likedReportes = rows.map(row => row.reporte_id);
        res.json({ likedReportes });
    });
});

// Endpoint para debuggear (temporal)
app.get("/api/debug/ultimo-reporte", (req, res) => {
    db.get("SELECT * FROM reportes ORDER BY id DESC LIMIT 1", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// ========== RESPUESTAS A COMENTARIOS ==========
// Tabla de respuestas
db.run(`
    CREATE TABLE IF NOT EXISTS respuestas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comentario_id INTEGER NOT NULL,
        usuario TEXT NOT NULL,
        texto TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        likes INTEGER DEFAULT 0,
        FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) console.error("Error creando tabla respuestas:", err);
    else console.log("✅ Tabla 'respuestas' lista");
});

// Obtener respuestas de un comentario
app.get("/api/respuestas/:comentarioId", (req, res) => {
    const { comentarioId } = req.params;
    db.all(
        "SELECT * FROM respuestas WHERE comentario_id = ? ORDER BY fecha ASC",
        [comentarioId],
        (err, rows) => {
            if (err) return res.status(500).json({ mensaje: "Error al obtener respuestas", success: false });
            res.json(rows || []);
        }
    );
});

// Agregar respuesta a un comentario
app.post("/api/respuestas", (req, res) => {
    const { comentarioId, usuario, texto } = req.body;

    if (!comentarioId || !usuario || !texto) {
        return res.status(400).json({ mensaje: "Faltan datos", success: false });
    }

    db.run(
        "INSERT INTO respuestas (comentario_id, usuario, texto) VALUES (?, ?, ?)",
        [comentarioId, usuario, texto],
        function(err) {
            if (err) return res.status(500).json({ mensaje: "Error al guardar respuesta", success: false });
            res.json({
                mensaje: "Respuesta agregada",
                success: true,
                respuesta: {
                    id: this.lastID,
                    comentario_id: comentarioId,
                    usuario,
                    texto,
                    fecha: new Date().toISOString(),
                    likes: 0
                }
            });
        }
    );
});

// Dar like a una respuesta
app.post("/api/respuestas/:id/like", (req, res) => {
    const { id } = req.params;
    db.run("UPDATE respuestas SET likes = likes + 1 WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ mensaje: "Error al dar like", success: false });
        res.json({ mensaje: "Like agregado", success: true });
    });
});



const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend en puerto ${PORT}`);
    console.log(`🔗 Frontend permitido: ${FRONTEND_URL}`);
});