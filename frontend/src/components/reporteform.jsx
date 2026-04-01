import React, { useState } from 'react';
import { Form, Button, Spinner, Image } from 'react-bootstrap';
import { Camera } from 'react-bootstrap-icons';
import api from '../services/api';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!modulo) {
      mostrarAlerta('Selecciona un módulo', 'error');
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

    try {
      const response = await api.post('/reportes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        mostrarAlerta('✅ Reporte creado con éxito', 'success');
        setModulo('');
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
      <Form.Group className="mb-3">
        <Form.Label>📍 Módulo / Ubicación</Form.Label>
        <Form.Select
          value={modulo}
          onChange={(e) => setModulo(e.target.value)}
          disabled={loading}
          size="lg"
        >
          <option value="">-- Selecciona un módulo --</option>
          {MODULOS.map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </Form.Select>
        <Form.Text className="text-muted">
          Total: {MODULOS.length} módulos disponibles
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>📸 Imagen del problema</Form.Label>
        <Form.Control
          type="file"
          id="imagenInput"
          accept="image/*"
          onChange={handleImagenChange}
          disabled={loading}
        />
        <Form.Text className="text-muted">
          Formatos: PNG, JPG, JPEG, GIF, WEBP (Máx: 10MB)
        </Form.Text>
      </Form.Group>

      {preview && (
        <div className="mb-3 text-center">
          <Image 
            src={preview} 
            alt="Vista previa" 
            fluid 
            rounded 
            style={{ maxHeight: '200px', objectFit: 'contain' }}
          />
        </div>
      )}
      
      <Button 
        type="submit" 
        variant="primary" 
        size="lg"
        disabled={loading || !modulo}
        className="w-100"
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