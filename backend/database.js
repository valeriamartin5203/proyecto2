import sqlite3 from "sqlite3"

const db = new sqlite3.Database("./database.db")

db.serialize(()=>{

db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
usuario TEXT UNIQUE,
password TEXT
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS reportes(
id INTEGER PRIMARY KEY AUTOINCREMENT,
usuario TEXT,
modulo TEXT,
problema TEXT,
categoria TEXT,
urgencia TEXT,
imagen TEXT
)
`)

})

export default db