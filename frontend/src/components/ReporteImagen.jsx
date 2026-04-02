import React, { useState, useEffect } from 'react';
import { Eye } from 'react-bootstrap-icons';

function ReporteImagen({ imagen, problema, onClick }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (imagen) {
      setCargando(true);
      setError(false);
      // Construir URL de la imagen
      const url = `${API_URL}/uploads/${imagen}`;
      setImageUrl(url);
    }
  }, [imagen, API_URL]);

  if (!imagen) return null;

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
        {/* Mostrar spinner mientras carga */}
        {cargando && (
          <div className="d-flex align-items-center justify-content-center h-100" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando imagen...</span>
            </div>
            <span className="ms-2 text-muted">Cargando imagen...</span>
          </div>
        )}
        
        {/* Mostrar imagen cuando está cargada */}
        {!error && (
          <img 
            src={imageUrl}
            alt={problema || "Evidencia del reporte"}
            className="img-fluid w-100"
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
        
        {/* Mostrar error si no carga la imagen */}
        {error && (
          <div className="d-flex flex-column align-items-center justify-content-center p-4" style={{ minHeight: '200px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="8.82" y1="8.82" x2="15.18" y2="15.18"></line>
              <line x1="15.18" y1="8.82" x2="8.82" y2="15.18"></line>
            </svg>
            <p className="text-danger mt-2 small">No se pudo cargar la imagen</p>
          </div>
        )}
        
        {/* Overlay para ver imagen completa */}
        <div className="imagen-overlay">
          <Eye size={24} className="text-white" />
          <span className="text-white ms-2">Ver imagen completa</span>
        </div>
      </div>
    </div>
  );
}

export default ReporteImagen;