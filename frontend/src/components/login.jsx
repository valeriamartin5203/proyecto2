import {useState} from "react"

function Login({setUsuario}){

const[usuario,setU]=useState("")
const[password,setP]=useState("")

async function login(){

const res=await fetch("http://localhost:3000/login",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({usuario,password})

})

const data=await res.json()

alert(data.mensaje)

if(data.login){
setUsuario(usuario)
}

}

return(

<div>

<h3>Login</h3>

<input placeholder="usuario"
onChange={e=>setU(e.target.value)}/>

<input type="password"
placeholder="password"
onChange={e=>setP(e.target.value)}/>

<button onClick={login}>
Entrar
</button>

</div>

)

}

export default Login