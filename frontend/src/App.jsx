import {useState} from "react"
import Login from "./components/login"
import Registro from "./components/registro"
import Reporte from "./components/reporteform"
import ListaReportes from "./components/listareportes"

function App(){

const[usuario,setUsuario]=useState(null)

if(!usuario){

return(
<>
<h1>Reportes del Campus</h1>
<Login setUsuario={setUsuario}/>
<Registro/>
</>
)

}

return(
<>
<h2>Bienvenido {usuario}</h2>
<Reporte usuario={usuario}/>
<ListaReportes/>
</>
)

}

export default App