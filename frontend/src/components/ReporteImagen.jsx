import React, { useState } from 'react';
import { Eye } from 'react-bootstrap-icons';

function ReporteImagen({ imagen, problema, onClick }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const imageUrl = `${API_URL}/uploads/${imagen}`;

  return (
    <div className="mt-3 position-relative">
      <div 
        className="reporte-imagen-container rounded-3 overflow-hidden"
        style={{ 
          cursor: 'pointer',
          maxHeight: '400px',
          backgroundColor: '#f0f2f5',
          minHeight: '200px'
        }}
        onClick={onClick}
      >
        {cargando && (
          <div className="d-flex align-items-center justify-content-center h-100" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando imagen...</span>
            </div>
          </div>
        )}
        
        {!error && (
          <img 
            src={imageUrl}
            alt={problema || "Evidencia del reporte"}
            className="img-fluid w-100"
            loading="lazy"
            style={{ 
              objectFit: 'cover',
              maxHeight: '350px',
              transition: 'transform 0.3s ease',
              display: cargando ? 'none' : 'block'
            }}
            onLoad={() => setCargando(false)}
            onError={() => {
              setCargando(false);
              setError(true);
            }}
          />
        )}
        
        {error && (
          <div className="d-flex flex-column align-items-center justify-content-center p-4" style={{ minHeight: '200px' }}>
            <img 
              src="https://via.placeholder.com/400x200?text=Imagen+no+disponible"
              alt="Imagen no disponible"
              className="img-fluid"
              style={{ maxHeight: '150px' }}
            />
            <p className="text-muted mt-2 small">No se pudo cargar la imagen</p>
          </div>
        )}
        
        <div className="imagen-overlay">
          <Eye size={24} className="text-white" />
          <span className="text-white ms-2">Ver imagen completa</span>
        </div>
      </div>
    </div>
  );
}

export default ReporteImagen;