import express from "express"
import cors from "cors"
import multer from "multer"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import fs from "fs"

import db from "./database.js"

import { GoogleGenerativeAI } from "@google/generative-ai"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

if(!fs.existsSync("uploads")){
fs.mkdirSync("uploads")
}

const upload = multer({dest:"uploads/"})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
model:"gemini-1.5-flash"
})


// REGISTRO
app.post("/registro",(req,res)=>{

const {usuario,password}=req.body

db.get(
"SELECT * FROM users WHERE usuario=?",
[usuario],
async(err,row)=>{

if(row){
return res.json({mensaje:"Usuario ya existe"})
}

const hash = await bcrypt.hash(password,10)

db.run(
"INSERT INTO users(usuario,password) VALUES(?,?)",
[usuario,hash],
()=>{

res.json({mensaje:"Usuario registrado",login:true})

})

})

})


// LOGIN
app.post("/login",(req,res)=>{

const {usuario,password}=req.body

db.get(
"SELECT * FROM users WHERE usuario=?",
[usuario],
async(err,row)=>{

if(!row){
return res.json({mensaje:"Usuario incorrecto"})
}

const valido = await bcrypt.compare(password,row.password)

if(!valido){
return res.json({mensaje:"Contraseña incorrecta"})
}

res.json({mensaje:"Login correcto",login:true})

})

})


// REPORTES
app.post("/reportes",upload.single("imagen"),async(req,res)=>{

try{

const {usuario,modulo}=req.body

const imageBuffer = fs.readFileSync(req.file.path)

const prompt=`
Analiza la imagen del campus universitario.

Detecta el problema.

Responde SOLO en JSON:

{
"problema":"",
"categoria":"",
"urgencia":""
}

categoria:
Infraestructura
Limpieza
Seguridad
Tecnología
Servicios

urgencia:
Baja
Media
Alta
`

const result = await model.generateContent([
prompt,
{
inlineData:{
data:imageBuffer.toString("base64"),
mimeType:req.file.mimetype
}
}
])

const texto=result.response.text()

const datos=JSON.parse(texto)

db.run(
`INSERT INTO reportes(usuario,modulo,problema,categoria,urgencia,imagen)
VALUES(?,?,?,?,?,?)`,
[
usuario,
modulo,
datos.problema,
datos.categoria,
datos.urgencia,
req.file.filename
]
)

res.json(datos)

}catch(error){

res.json({mensaje:"Error analizando imagen"})

}

})


// LISTAR REPORTES
app.get("/reportes",(req,res)=>{

db.all(
"SELECT * FROM reportes",
[],
(err,rows)=>{

res.json(rows)

})

})


app.listen(3000,()=>{

console.log("Servidor corriendo en puerto 3000")

})