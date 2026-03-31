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

---

## Paso 2: Configurar el Backend