import {useState} from "react"

const modulos=[
"A","B","C","D","E","F","G","H","I","J",
"K","L","M","N","O","P","Q","R","S","T",
"U","V","W","X","Y","Z",
"Z1","Z2","V2","ALPHA","BETA","L2","JOBS"
]

function Reporte({usuario}){

const[imagen,setImagen]=useState(null)
const[modulo,setModulo]=useState("A")

async function enviar(){

const form=new FormData()

form.append("imagen",imagen)
form.append("usuario",usuario)
form.append("modulo",modulo)

const res=await fetch("http://localhost:3000/reportes",{

method:"POST",
body:form

})

const data=await res.json()

alert("Problema detectado: "+data.problema)

}

return(

<div>

<h3>Enviar reporte</h3>

<select onChange={e=>setModulo(e.target.value)}>

{modulos.map(m=>(

<option key={m}>{m}</option>

))}

</select>

<input
type="file"
onChange={e=>setImagen(e.target.files[0])}
/>

<button onClick={enviar}>
Enviar reporte
</button>

</div>

)

}

export default Reporte