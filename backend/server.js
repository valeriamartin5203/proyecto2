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

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración CORS para producción
app.use(cors({
    origin: '*',
}));
app.use(express.json());

// ========== BASE DE DATOS (SQLite) ==========
import sqlite3 from "sqlite3";
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS reportes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL,
            modulo TEXT NOT NULL,
            problema TEXT NOT NULL,
            categoria TEXT NOT NULL,
            urgencia TEXT NOT NULL,
            imagen TEXT
        )
    `);
});

console.log("✅ Base de datos conectada");

// ========== CONFIGURACIÓN GEMINI GRATUITA ==========
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY no está definida");
    console.error("📝 En Render, agrega la variable de entorno GEMINI_API_KEY");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODELO_GEMINI = "gemini-2.5-flash"; // Modelo gratuito

const model = genAI.getGenerativeModel({ 
    model: MODELO_GEMINI
});

console.log(`🤖 Gemini configurado con modelo: ${MODELO_GEMINI}`);

// ========== CONFIGURACIÓN UPLOADS ==========
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, `reporte-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

// ========== RUTAS DE PRUEBA PARA PRODUCCIÓN ==========
app.get("/", (req, res) => {
    res.json({ 
        mensaje: "🚀 API de Reportes funcionando en Render",
        status: "online",
        entorno: process.env.NODE_ENV || "development",
        modelo: MODELO_GEMINI
    });
});

app.get("/api/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ========== RUTAS DE USUARIOS ==========
app.post("/registro", async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ 
                mensaje: "Usuario y contraseña requeridos",
                success: false 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                mensaje: "La contraseña debe tener al menos 6 caracteres",
                success: false 
            });
        }

        db.get("SELECT * FROM users WHERE usuario = ?", [usuario], async (err, row) => {
            if (err) {
                return res.status(500).json({ 
                    mensaje: "Error en BD",
                    success: false 
                });
            }

            if (row) {
                return res.json({ 
                    mensaje: "Usuario ya existe", 
                    success: false 
                });
            }

            const hash = await bcrypt.hash(password, 10);
            db.run("INSERT INTO users (usuario, password) VALUES (?, ?)", 
                [usuario, hash], 
                function(err) {
                    if (err) {
                        return res.status(500).json({ 
                            mensaje: "Error al registrar",
                            success: false 
                        });
                    }
                    res.json({ 
                        mensaje: "Usuario registrado correctamente", 
                        success: true,
                        usuario: {
                            id: this.lastID,
                            nombre: usuario
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ 
            mensaje: "Error interno",
            success: false 
        });
    }
});

app.post("/login", (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ 
                mensaje: "Usuario y contraseña requeridos",
                success: false 
            });
        }

        db.get("SELECT * FROM users WHERE usuario = ?", [usuario], async (err, row) => {
            if (err) {
                return res.status(500).json({ 
                    mensaje: "Error en BD",
                    success: false 
                });
            }

            if (!row) {
                return res.json({ 
                    mensaje: "Usuario o contraseña incorrectos", 
                    success: false 
                });
            }

            const valido = await bcrypt.compare(password, row.password);
            if (!valido) {
                return res.json({ 
                    mensaje: "Usuario o contraseña incorrectos", 
                    success: false 
                });
            }

            res.json({ 
                mensaje: "Login correcto", 
                success: true, 
                usuario: {
                    id: row.id,
                    nombre: row.usuario
                }
            });
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ 
            mensaje: "Error interno",
            success: false 
        });
    }
});

// ========== RUTA DE REPORTES ==========
app.post("/reportes", upload.single("imagen"), async (req, res) => {
    let imagePath = null;

    try {
        console.log("\n" + "=".repeat(50));
        console.log(`📸 PROCESANDO REPORTE EN PRODUCCIÓN`);
        console.log("=".repeat(50));

        if (!req.file) {
            return res.status(400).json({ 
                mensaje: "No se recibió ninguna imagen",
                success: false 
            });
        }
        imagePath = req.file.path;
        console.log("📁 Imagen guardada:", req.file.filename);

        const { usuario, modulo } = req.body;
        if (!usuario || !modulo) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ 
                mensaje: "Faltan datos: usuario y módulo son obligatorios",
                success: false 
            });
        }

        // Verificar usuario
        const userExists = await new Promise((resolve) => {
            db.get("SELECT id FROM users WHERE usuario = ?", [usuario], (err, row) => {
                resolve(!!row);
            });
        });

        if (!userExists) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ 
                mensaje: "El usuario no existe",
                success: false 
            });
        }

        // Analizar con Gemini
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");

        const prompt = `Analiza esta imagen y responde SOLO con un JSON válido con esta estructura:
{
    "problema": "Describe el problema en máximo 100 caracteres",
    "categoria": "Infraestructura, Limpieza, Seguridad, Tecnología o Servicios",
    "urgencia": "Baja, Media o Alta"
}`;

        console.log(`🤖 Enviando a ${MODELO_GEMINI}...`);
        
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
        ]);

        const responseText = result.response.text();
        console.log("📥 Respuesta:", responseText);

        // Procesar respuesta
        let cleanJson = responseText.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanJson.match(/\{.*\}/s);
        if (jsonMatch) cleanJson = jsonMatch[0];

        let datos;
        try {
            datos = JSON.parse(cleanJson);
        } catch (e) {
            datos = {
                problema: "Problema detectado en la imagen",
                categoria: "Infraestructura",
                urgencia: "Media"
            };
        }

        // Validar categorías
        const categoriasValidas = ["Infraestructura", "Limpieza", "Seguridad", "Tecnología", "Servicios"];
        if (!categoriasValidas.includes(datos.categoria)) {
            datos.categoria = "Infraestructura";
        }

        const urgenciasValidas = ["Baja", "Media", "Alta"];
        if (!urgenciasValidas.includes(datos.urgencia)) {
            datos.urgencia = "Media";
        }

        // Guardar en BD
        db.run(
            `INSERT INTO reportes (usuario, modulo, problema, categoria, urgencia, imagen) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario, modulo, datos.problema, datos.categoria, datos.urgencia, req.file.filename],
            function(err) {
                if (err) {
                    console.error("❌ Error BD:", err);
                    return res.status(500).json({ 
                        mensaje: "Error al guardar",
                        success: false 
                    });
                }

                console.log("✅ Reporte guardado ID:", this.lastID);
                
                res.json({
                    mensaje: "Reporte guardado con éxito",
                    success: true,
                    reporte: {
                        id: this.lastID,
                        usuario,
                        modulo,
                        problema: datos.problema,
                        categoria: datos.categoria,
                        urgencia: datos.urgencia,
                        imagen: req.file.filename
                    }
                });
            }
        );

    } catch (error) {
        console.error("❌ Error:", error);
        
        if (imagePath && fs.existsSync(imagePath)) {
            try { fs.unlinkSync(imagePath); } catch (e) {}
        }

        res.status(500).json({ 
            mensaje: "Error procesando reporte",
            error: error.message,
            success: false 
        });
    }
});

// OBTENER REPORTES
app.get("/reportes", (req, res) => {
    db.all("SELECT * FROM reportes ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ 
                mensaje: "Error obteniendo reportes",
                success: false 
            });
        }
        res.json(rows || []);
    });
});

// SERVIR IMÁGENES
app.use("/uploads", express.static(uploadDir));

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 10000; // Render usa puertos dinámicos

app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log("🚀 SERVIDOR LISTO PARA RENDER");
    console.log("=".repeat(50));
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`📁 Uploads: ${uploadDir}`);
    console.log(`🗄️  BD: ${dbPath}`);
    console.log(`🤖 Gemini: ${MODELO_GEMINI}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
    console.log("=".repeat(50) + "\n");
});