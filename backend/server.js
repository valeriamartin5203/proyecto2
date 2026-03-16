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
app.use(cors());
app.use(express.json());

// ========== BASE DE DATOS ==========
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
    console.error("📝 Crea un archivo .env con: GEMINI_API_KEY=tu_api_key_aqui");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MODELO GRATUITO QUE FUNCIONA EN 2026:
// Puedes elegir entre:
// - "gemini-2.5-flash" (recomendado, 250 reportes/día)
// - "gemini-2.5-flash-lite" (1000 reportes/día, más rápido)
// - "gemini-2.0-flash" (versión anterior, 1500 reportes/día)

const MODELO_GEMINI = "gemini-2.5-flash"; // Cambia según prefieras

const model = genAI.getGenerativeModel({ 
    model: MODELO_GEMINI
});

console.log(`🤖 Gemini configurado con modelo GRATUITO: ${MODELO_GEMINI}`);

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

// ========== RUTAS ==========

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ 
        mensaje: "API de Reportes funcionando",
        status: "online",
        modelo: MODELO_GEMINI
    });
});

// REGISTRO
app.post("/registro", async (req, res) => {
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
        res.status(500).json({ 
            mensaje: "Error interno",
            success: false 
        });
    }
});

// LOGIN
app.post("/login", (req, res) => {
    try {
        const { usuario, password } = req.body;

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
        res.status(500).json({ 
            mensaje: "Error interno",
            success: false 
        });
    }
});

// CREAR REPORTE CON GEMINI GRATUITO
app.post("/reportes", upload.single("imagen"), async (req, res) => {
    let imagePath = null;

    try {
        console.log("\n" + "=".repeat(50));
        console.log(`📸 PROCESANDO CON ${MODELO_GEMINI}`);
        console.log("=".repeat(50));

        // 1. Validar archivo
        if (!req.file) {
            return res.status(400).json({ 
                mensaje: "No se recibió ninguna imagen",
                success: false 
            });
        }
        imagePath = req.file.path;
        console.log("📁 Imagen guardada:", req.file.filename);

        // 2. Validar datos
        const { usuario, modulo } = req.body;
        if (!usuario || !modulo) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ 
                mensaje: "Faltan datos: usuario y módulo son obligatorios",
                success: false 
            });
        }
        console.log("👤 Usuario:", usuario);
        console.log("📍 Módulo:", modulo);

        // 3. Verificar usuario
        const userExists = await new Promise((resolve) => {
            db.get("SELECT id FROM users WHERE usuario = ?", [usuario], (err, row) => {
                resolve(!!row);
            });
        });

        if (!userExists) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ 
                mensaje: "El usuario no existe. Regístrate primero.",
                success: false 
            });
        }

        // 4. Preparar imagen para Gemini
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");

        // 5. Prompt optimizado
        const prompt = `Eres un asistente experto en análisis de imágenes para reportes de mantenimiento.
Analiza la imagen y responde SOLO con un JSON válido con esta estructura:
{
    "problema": "Describe el problema específico en máximo 100 caracteres",
    "categoria": "Selecciona UNA: Infraestructura, Limpieza, Seguridad, Tecnología, Servicios",
    "urgencia": "Selecciona UNA: Baja, Media, Alta"
}

Ejemplos:
- Pared rota → {"problema":"Pared con grietas estructurales","categoria":"Infraestructura","urgencia":"Alta"}
- Basura en piso → {"problema":"Basura acumulada en el área","categoria":"Limpieza","urgencia":"Media"}
- Cable suelto → {"problema":"Cables eléctricos expuestos","categoria":"Seguridad","urgencia":"Alta"}
- Computadora dañada → {"problema":"Equipo de cómputo no enciende","categoria":"Tecnología","urgencia":"Media"}

IMPORTANTE: Responde SOLO con el JSON.`;

        console.log(`🤖 Enviando a ${MODELO_GEMINI}...`);
        
        // 6. Llamar a Gemini
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
        ]);

        const responseText = result.response.text();
        console.log("📥 Respuesta de Gemini:", responseText);

        // 7. Procesar respuesta
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
            console.log("⚠️ Error parseando JSON, usando valores por defecto");
            datos = {
                problema: "Problema detectado en la imagen",
                categoria: "Infraestructura",
                urgencia: "Media"
            };
        }

        // 8. Validar categoría
        const categoriasValidas = ["Infraestructura", "Limpieza", "Seguridad", "Tecnología", "Servicios"];
        if (!categoriasValidas.includes(datos.categoria)) {
            datos.categoria = "Infraestructura";
        }

        // 9. Validar urgencia
        const urgenciasValidas = ["Baja", "Media", "Alta"];
        if (!urgenciasValidas.includes(datos.urgencia)) {
            datos.urgencia = "Media";
        }

        // 10. Guardar en BD
        db.run(
            `INSERT INTO reportes (usuario, modulo, problema, categoria, urgencia, imagen) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario, modulo, datos.problema, datos.categoria, datos.urgencia, req.file.filename],
            function(err) {
                if (err) {
                    console.error("❌ Error BD:", err);
                    return res.status(500).json({ 
                        mensaje: "Error al guardar en base de datos",
                        success: false 
                    });
                }

                console.log("✅ Reporte guardado con ID:", this.lastID);
                console.log("📊 Análisis Gemini:", datos);
                
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
        console.error("❌ Error general:", error);
        
        // Limpiar archivo si existe
        if (imagePath && fs.existsSync(imagePath)) {
            try { fs.unlinkSync(imagePath); } catch (e) {}
        }

        // Mensaje de error amigable
        if (error.message.includes("API key")) {
            res.status(500).json({ 
                mensaje: "Error con la API de Gemini. Verifica tu API key en el archivo .env",
                success: false 
            });
        } else if (error.message.includes("fetch") || error.message.includes("network")) {
            res.status(500).json({ 
                mensaje: "Error de conexión. Verifica tu internet.",
                success: false 
            });
        } else {
            res.status(500).json({ 
                mensaje: "Error al procesar el reporte",
                error: error.message,
                success: false 
            });
        }
    }
});

// OBTENER TODOS LOS REPORTES
app.get("/reportes", (req, res) => {
    db.all("SELECT * FROM reportes ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ 
                mensaje: "Error obteniendo reportes",
                success: false 
            });
        }
        res.json({
            mensaje: "Reportes obtenidos correctamente",
            success: true,
            total: rows ? rows.length : 0,
            reportes: rows || []
        });
    });
});

// OBTENER UN REPORTE POR ID
app.get("/reportes/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM reportes WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ 
                mensaje: "Error",
                success: false 
            });
        }
        if (!row) {
            return res.status(404).json({ 
                mensaje: "Reporte no encontrado",
                success: false 
            });
        }
        res.json(row);
    });
});

// SERVIR IMÁGENES
app.use("/uploads", express.static(uploadDir));

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log("🚀 SERVIDOR INICIADO CON GEMINI GRATUITO");
    console.log("=".repeat(50));
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📁 Uploads: ${uploadDir}`);
    console.log(`🗄️  BD: ${dbPath}`);
    console.log(`🤖 Gemini: ${MODELO_GEMINI} (GRATUITO)`);
    console.log(`💰 Plan: 100% GRATIS - Sin tarjeta de crédito`);
    console.log("=".repeat(50) + "\n");
});