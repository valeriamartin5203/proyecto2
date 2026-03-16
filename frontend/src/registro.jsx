import {useState} from "react"

function Registro(){

const[usuario,setU]=useState("")
const[password,setP]=useState("")

async function registro(){

const res=await fetch("http://localhost:3000/registro",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({usuario,password})

})

const data=await res.json()

alert(data.mensaje)

}

return(

<div>

<h3>Registro</h3>

<input placeholder="usuario"
onChange={e=>setU(e.target.value)}/>

<input type="password"
placeholder="password"
onChange={e=>setP(e.target.value)}/>

<button onClick={registro}>
Registrarse
</button>

</div>

)

}

export default Registro