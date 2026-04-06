import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Camera } from 'react-bootstrap-icons';
import api from '../services/api';
import MapaImagenSelector from './MapaImagenSelector';

// Lista de módulos respaldo (por si no se usa el mapa)
const MODULOS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z",
  "Z1", "Z2", "V2", "ALPHA", "BETA", "L2", "JOBS", "santander", "lona",
  "zona de alimentos del p", "zona de alimentos del x", "zona de alimentos del t", 
  "zona de alimentos del j", "baños del e,i,alpha,beta,p,q,r,t,v,x,z1,z,y",
  "laboratorio de ingenieria"
].sort();

function ReporteForm({ usuario, onReporteCreado, mostrarAlerta }) {
  const [modulo, setModulo] = useState('');
  const [ubicacion, setUbicacion] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usarMapa, setUsarMapa] = useState(true); // Por defecto usar mapa

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        mostrarAlerta('La imagen no debe superar los 10MB', 'error');
        return;
      }
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUbicacionChange = (ubicacionData) => {
    setUbicacion(ubicacionData);
    setModulo(ubicacionData.direccion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!modulo) {
      mostrarAlerta('Selecciona una ubicación', 'error');
      return;
    }

    if (!imagen) {
      mostrarAlerta('Selecciona una imagen', 'error');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('usuario', usuario);
    formData.append('modulo', modulo);
    formData.append('imagen', imagen);
    
    if (ubicacion) {
      formData.append('x', ubicacion.x);
      formData.append('y', ubicacion.y);
    }

    try {
      const response = await api.post('/reportes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        mostrarAlerta('✅ Reporte creado con éxito', 'success');
        setModulo('');
        setUbicacion(null);
        setImagen(null);
        setPreview(null);
        onReporteCreado();
        document.getElementById('imagenInput').value = '';
      } else {
        mostrarAlerta(response.data.mensaje, 'error');
      }
    } catch (error) {
      mostrarAlerta('Error al crear reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-3">
        <div className="d-flex gap-3 mb-3">
          <Button 
            variant={usarMapa ? 'primary' : 'outline-secondary'} 
            size="sm"
            onClick={() => setUsarMapa(true)}
          >
            🗺️ Mapa interactivo del CUCEI
          </Button>
          <Button 
            variant={!usarMapa ? 'primary' : 'outline-secondary'} 
            size="sm"
            onClick={() => setUsarMapa(false)}
          >
            📋 Lista de módulos
          </Button>
        </div>

        {usarMapa ? (
          <MapaImagenSelector 
            ubicacionSeleccionada={ubicacion}
            onUbicacionChange={handleUbicacionChange}
            moduloSeleccionado={modulo}
            onModuloChange={setModulo}
          />
        ) : (
          <div className="form-group">
            <label className="form-label">📍 Módulo / Ubicación:</label>
            <select
              className="form-select"
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              disabled={loading}
              size="8"
            >
              <option value="">-- Selecciona un módulo --</option>
              {MODULOS.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
            <small className="text-muted">
              Total: {MODULOS.length} módulos disponibles
            </small>
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label className="form-label">📸 Imagen del problema:</label>
        <input
          type="file"
          id="imagenInput"
          accept="image/*"
          onChange={handleImagenChange}
          disabled={loading}
          className="form-input"
        />
        <small className="text-muted">
          Formatos: PNG, JPG, JPEG, GIF, WEBP (Máx: 10MB)
        </small>
      </div>

      {preview && (
        <div className="preview-container mt-3">
          <img src={preview} alt="Vista previa" className="preview-image" />
        </div>
      )}
      
      <Button 
        type="submit" 
        variant="primary" 
        size="lg"
        disabled={loading || !modulo}
        className="w-100 mt-3"
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
            Enviando...
          </>
        ) : (
          <>
            <Camera className="me-2" /> Enviar Reporte
          </>
        )}
      </Button>
    </Form>
  );
}

export default ReporteForm;