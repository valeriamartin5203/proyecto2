import {useEffect,useState} from "react"

function ListaReportes(){

const[reportes,setReportes]=useState([])

useEffect(()=>{

fetch("http://localhost:3000/reportes")

.then(res=>res.json())
.then(data=>setReportes(data))

},[])

return(

<div>

<h3>Reportes</h3>

{reportes.map(r=>(

<div key={r.id}>

<p>Usuario: {r.usuario}</p>
<p>Módulo: {r.modulo}</p>
<p>Problema: {r.problema}</p>
<p>Categoría: {r.categoria}</p>
<p>Urgencia: {r.urgencia}</p>

<hr/>

</div>

))}

</div>

)

}

export default ListaReportes