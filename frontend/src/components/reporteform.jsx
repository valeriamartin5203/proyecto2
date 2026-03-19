import React, { useState } from 'react';
import axios from 'axios';

const MODULOS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z",
  "Z1", "Z2", "V2", "ALPHA", "BETA", "L2", "JOBS", "santander", "lona",
  "zona de alimentos del p",
  "zona de alimentos del x",
  "zona de alimentos del t", 
  "zona de alimentos del j",
  "baños del e,i,alpha,beta,p,q,r,t,v,x,z1,z,y",
  "laboratorio de ingenieria"
].sort();

function ReporteForm({ API_URL, usuario, onReporteCreado, mostrarAlerta }) {
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
      const response = await axios.post(`${API_URL}/reportes`, formData);

      if (response.data.success) {
        mostrarAlerta('✅ Reporte creado', 'success');
        setModulo('');
        setImagen(null);
        setPreview(null);
        onReporteCreado();
      } else {
        mostrarAlerta(response.data.mensaje, 'error');
      }
    } catch (error) {
      mostrarAlerta('Error al crear reporte', 'error');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>📍 Módulo:</label>
        <select
          value={modulo}
          onChange={(e) => setModulo(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Selecciona --</option>
          {MODULOS.map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>📸 Imagen:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImagenChange}
          disabled={loading}
        />
      </div>

      {preview && (
        <div className="preview-container">
          <img src={preview} alt="Vista previa" />
        </div>
      )}
      
      <button type="submit" disabled={loading || !modulo}>
        {loading ? 'Enviando...' : '📤 Enviar Reporte'}
      </button>
    </form>
  );
}

export default ReporteForm;