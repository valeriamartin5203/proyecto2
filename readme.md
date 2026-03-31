# 📸 Sistema de Reportes con IA

## 📖 ¿Qué es este proyecto?

Este proyecto es un **sistema completo de gestión de reportes de mantenimiento e incidencias** que utiliza **Inteligencia Artificial** para analizar imágenes automáticamente.

Cuando un usuario detecta un problema (como una pared rota, basura acumulada, un cable suelto o una computadora dañada), puede tomar una foto, subirla al sistema, y la IA de **Gemini** analizará la imagen para determinar:
- **Problema**: Descripción clara de lo que ocurre
- **Categoría**: Infraestructura, Limpieza, Seguridad, Tecnología o Servicios
- **Urgencia**: Baja, Media o Alta

El sistema guarda todos los reportes y permite ver un historial de los problemas reportados.

---

## 🎯 ¿Por qué se creó?

Este proyecto nació de la necesidad de **automatizar y agilizar** el proceso de reporte de incidencias en entornos como:
- Instituciones educativas (escuelas, universidades)
- Edificios corporativos
- Centros comerciales
- Espacios públicos

**Beneficios:**
- ✅ **Ahorro de tiempo**: No hay que escribir manualmente el problema
- ✅ **Mayor precisión**: La IA detecta y clasifica automáticamente
- ✅ **Priorización clara**: Clasificación por urgencia para atender primero lo crítico
- ✅ **Historial completo**: Todos los reportes quedan registrados
- ✅ **Accesible desde cualquier lugar**: Desplegado en la nube

---

## 💻 ¿Cómo desplegar en local?

### Requisitos previos

| Requisito | Descripción | Dónde descargar |
|-----------|-------------|-----------------|
| **Node.js** | Entorno para ejecutar JavaScript en el servidor | [https://nodejs.org](https://nodejs.org) (versión LTS) |
| **Git** | Para clonar el repositorio (opcional) | [https://git-scm.com](https://git-scm.com) |
| **API Key de Gemini** | Clave para usar la IA de Google | [https://aistudio.google.com](https://aistudio.google.com) |

---

### Paso 1: Descargar el proyecto

**Opción A - Clonar con Git:**
```bash
git clone https://github.com/valeriamartin5203/proyecto2
cd proyecto2

**Opción B - Descargar ZIP:**

Ve a https://github.com/valeriamartin5203/proyecto2

Haz clic en "Code" → "Download ZIP"

Extrae el archivo y entra a la carpeta proyecto2
```

### Paso 2: Configurar el Backend

```bash
# Entrar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
# (En Windows PowerShell):
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env
echo "FRONTEND_URL=http://localhost:5173" >> .env
echo "PORT=3000" >> .env

# Iniciar el servidor
npm run dev

Verás: 🚀 Backend en puerto 3000

El backend queda en: http://localhost:3000
```

### Paso 3: Configurar el Frontend

Abre una nueva terminal (mantén el backend corriendo)

```bash
# Entrar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
# (En Windows PowerShell):
echo "VITE_API_URL=http://localhost:3000" > .env

# Iniciar la aplicación
npm run dev


Verás: Local: http://localhost:5173/

El frontend queda en: http://localhost:5173
```
### Paso 4: Usar la aplicación

Abre tu navegador en http://localhost:5173

Regístrate con un usuario y contraseña

Inicia sesión

Crea un reporte:

Selecciona un módulo (ubicación)

Sube una imagen (cualquier foto)

Haz clic en "Enviar Reporte"

La IA analizará la imagen y mostrará el resultado

---

##  ¿Qué se necesita descargar para usarlo?

### Para desarrollo local:

| Software | ¿Para qué? | Link |
| :--- | :--- | :--- |
| **Node.js** | Ejecutar el backend y frontend | [nodejs.org](https://nodejs.org/) |
| **Navegador** | Ver la aplicación | Chrome, Edge, Firefox |
| **Editor de código** | Modificar el proyecto (opcional) | [VS Code](https://code.visualstudio.com/), [Sublime Text](https://www.sublimetext.com/) |


### Para usar en producción (sin descargar nada):

Solo necesitas un navegador y acceso a internet para visitar:

Frontend: https://frontend-reportes.onrender.com

Backend: https://backend-reportes.onrender.com

---

## 🚀 Estructura del proyecto

proyecto2/
├── backend/               # Servidor con Node.js
│   ├── server.js         # Código principal del backend
│   ├── package.json      # Dependencias del backend
│   └── database.db       # Base de datos SQLite
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes de React
│   │   ├── services/     # Configuración de API
│   │   ├── App.jsx       # Componente principal
│   │   └── App.css       # Estilos
│   └── package.json      # Dependencias del frontend
├── render.yaml           # Configuración para despliegue
└── README.md             # Este archivo

---

## 🤖 Tecnologías utilizadas

|Tecnología||¿Qué hace?|
|:---||:---|
|Node.js + Express| |Servidor backend|
|React + Vite| |Interfaz de usuario|
|Google Gemini AI| |Análisis de imágenes con IA|
|SQLite| |Base de datos ligera|
|Axios| |Peticiones HTTP|
|Render| |Plataforma de despliegue|

---

## 🙏 Agradecimientos especiales a Gemini

Este proyecto no sería posible sin Google Gemini AI, la inteligencia artificial que permite analizar imágenes de forma automática y precisa.

### ¿Qué hace Gemini en este proyecto?

Reconoce el problema: La IA examina la imagen y describe qué está ocurriendo

Clasifica automáticamente: Determina si es un problema de infraestructura, limpieza, seguridad, tecnología o servicios

Evalúa la urgencia: Decide si es baja, media o alta prioridad

### Modelo utilizado

Gemini 2.5 Flash: Modelo rápido y eficiente, disponible en la capa gratuita

Análisis multimodal: Procesa imágenes y texto en conjunto

### ¿Por qué Gemini?

Gratuito: Tiene una capa gratuita generosa (hasta 1,500 peticiones/día)

Preciso: Entiende contextos complejos en imágenes

Rápido: Responde en segundos

Fácil de integrar: API sencilla y bien documentada


---

## Módulos disponibles (ubicaciones)
El sistema incluye múltiples módulos para reportar incidencias:

A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z

Zonas especiales: Z1, Z2, V2, ALPHA, BETA, L2, JOBS, santander, lona

Zonas de alimentos: zona de alimentos del p, x, t, j

Baños: baños del e,i,alpha,beta,p,q,r,t,v,x,z1,z,y

Laboratorios: laboratorio de ingenieria

---

## Enlaces del proyecto
Frontend en producción   https://frontend-reportes.onrender.com
Backend en producción    https://backend-reportes.onrender.com
Repositorio GitHub       https://github.com/valeriamartin5203/proyecto2


---

## ✨ Ejemplo de uso

Un usuario ve basura acumulada en el módulo "BETA"

Toma una foto con su celular

Sube la imagen al sistema

Gemini analiza y determina:

Problema: "Basura acumulada en el área"

Categoría: "Limpieza"

Urgencia: "Alta"

El reporte queda registrado y visible para quienes deban resolverlo

---

## Estado del proyecto

✅ Backend: Funcionando en producción
✅ Frontend: Funcionando en producción
✅ IA Gemini: Integrada y funcionando
✅ Base de datos: SQLite activa
✅ Autenticación: Registro y login funcional
✅ Subida de imágenes: Funcional con análisis IA

---

## Autor
Valeria Martin Llamas

