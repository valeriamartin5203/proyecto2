import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear base de datos
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

console.log(`🗄️  Base de datos: ${dbPath}`);

// Crear tablas si no existen - SIN columna fecha_reporte
db.serialize(() => {
    // Tabla de usuarios
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error("Error creando tabla users:", err);
        } else {
            console.log("✅ Tabla 'users' lista");
        }
    });

    // Tabla de reportes - SIN fecha_reporte
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
    `, (err) => {
        if (err) {
            console.error("Error creando tabla reportes:", err);
        } else {
            console.log("✅ Tabla 'reportes' lista");
        }
    });
});

export default db;