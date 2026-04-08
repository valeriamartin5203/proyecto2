import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Camera } from 'react-bootstrap-icons';
import api from '../services/api';
import MapaImagenSelector from './MapaImagenSelector';

function ReporteForm({ usuario, onReporteCreado, mostrarAlerta }) {
  const [modulo, setModulo] = useState('');
  const [ubicacion, setUbicacion] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
    console.log('📍 Ubicación seleccionada:', ubicacionData);
    setUbicacion(ubicacionData);
    setModulo(ubicacionData.direccion);
    console.log('📛 Módulo actualizado a:', ubicacionData.direccion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Validando formulario...');
    console.log('- Módulo:', modulo);
    console.log('- Usuario:', usuario);
    console.log('- Imagen:', imagen?.name || 'No seleccionada');
    
    if (!modulo) {
      console.error('❌ Error: No hay módulo seleccionado');
      mostrarAlerta('Selecciona una ubicación en el mapa', 'error');
      return;
    }

    if (!imagen) {
      console.error('❌ Error: No hay imagen seleccionada');
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
    
    // Debug: Ver qué se está enviando
    console.log('📤 Enviando datos:');
    for (let pair of formData.entries()) {
      console.log(`   ${pair[0]}: ${pair[0] === 'imagen' ? pair[1].name : pair[1]}`);
    }

    try {
      const response = await api.post('/reportes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('✅ Respuesta del servidor:', response.data);

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
      console.error('❌ Error completo:', error);
      console.error('❌ Response error:', error.response);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      
      const mensajeError = error.response?.data?.mensaje || error.response?.data?.error || 'Error al crear reporte';
      mostrarAlerta(mensajeError, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-bold">🗺️ Selecciona una ubicación en el mapa:</label>
        <MapaImagenSelector 
          ubicacionSeleccionada={ubicacion}
          onUbicacionChange={handleUbicacionChange}
          moduloSeleccionado={modulo}
          onModuloChange={setModulo}
        />
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