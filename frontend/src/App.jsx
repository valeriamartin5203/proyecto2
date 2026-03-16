import {useState} from "react"
import Login from "./login"
import Registro from "./registro"
import Reporte from "./reporte"
import ListaReportes from "./listareportes"

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