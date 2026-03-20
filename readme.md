# 🏫 Plataforma de Reportes del cucei con IA

## 📌 Descripción

Esta plataforma web permite a los estudiantes **reportar problemáticas dentro del campus universitario**, como fallas en infraestructura, problemas de limpieza o fallas tecnológicas.

El sistema integra **Inteligencia Artificial** para **analizar y clasificar automáticamente los reportes enviados por los usuarios**, facilitando su organización y seguimiento.

---

## 🎯 Objetivo del proyecto

Desarrollar una aplicación web que permita:

* Registrar problemáticas del campus.
* Clasificar automáticamente los reportes mediante IA.
* Visualizar los reportes enviados por los estudiantes.
* Facilitar la gestión y solución de problemas dentro del campus.

---

## 🛠 Tecnologías utilizadas

### Frontend

* React
* Vite
* HTML
* CSS

### Backend

* Node.js
* Express.js

### Base de datos

* MongoDB (o MySQL)

### Inteligencia Artificial

* API de IA para clasificación de texto.

---

## 📂 Estructura del proyecto

```
campus-reportes-ai
│
├── frontend
│   ├── src
│   └── public
│
├── backend
│   ├── server.js
│   └── routes
│
└── README.md
```

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```
git clone https://github.com/usuario/campus-reportes-ai.git
```

### 2. Entrar a la carpeta del proyecto

```
cd campus-reportes-ai
```

### 3. Instalar dependencias del backend

```
npm install
```

### 4. Ejecutar el servidor

```
node server.js
```

El servidor se ejecutará en:

```
http://localhost:3000
```

---

## 🚀 Funcionamiento del sistema

1. El usuario envía un reporte desde la plataforma.
2. El servidor recibe el reporte.
3. La IA analiza la descripción del problema.
4. La IA clasifica el reporte en una categoría.
5. El reporte se guarda en la base de datos.

---

## 📌 Ejemplo de reporte

Título:

```
Falla de internet en laboratorio
```

Descripción:

```
No hay conexión a internet en el laboratorio de cómputo del edificio C.
```

Clasificación automática:

```
Tecnología
```

---

## Autor

Proyecto desarrollado como práctica para la materia de **Programación para Internet**.
