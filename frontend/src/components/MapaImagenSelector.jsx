import React, { useState, useRef } from 'react';

function MapaImagenSelector({ ubicacionSeleccionada, onUbicacionChange, moduloSeleccionado, onModuloChange }) {
  const [coordenadasImagen, setCoordenadasImagen] = useState({ x: null, y: null });
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const imagenRef = useRef(null);

  // Módulos predefinidos con coordenadas relativas a la imagen (porcentajes)
  const modulos = [
    { id: 'A', nombre: 'Módulo A', x: 10, y: 20 },
    { id: 'B', nombre: 'Módulo B', x: 15, y: 25 },
    { id: 'C', nombre: 'Módulo C', x: 20, y: 30 },
    { id: 'D', nombre: 'Módulo D', x: 25, y: 35 },
    { id: 'E', nombre: 'Módulo E', x: 30, y: 40 },
    { id: 'F', nombre: 'Módulo F', x: 35, y: 45 },
    { id: 'G', nombre: 'Módulo G', x: 40, y: 50 },
    { id: 'H', nombre: 'Módulo H', x: 45, y: 55 },
    { id: 'I', nombre: 'Módulo I', x: 50, y: 60 },
    { id: 'J', nombre: 'Módulo J', x: 55, y: 65 },
    { id: 'K', nombre: 'Módulo K', x: 60, y: 70 },
    { id: 'L', nombre: 'Módulo L', x: 65, y: 75 },
    { id: 'M', nombre: 'Módulo M', x: 70, y: 80 },
    { id: 'N', nombre: 'Módulo N', x: 75, y: 85 },
    { id: 'O', nombre: 'Módulo O', x: 80, y: 90 },
    { id: 'P', nombre: 'Módulo P', x: 85, y: 95 },
    { id: 'Q', nombre: 'Módulo Q', x: 12, y: 22 },
    { id: 'R', nombre: 'Módulo R', x: 18, y: 28 },
    { id: 'S', nombre: 'Módulo S', x: 22, y: 32 },
    { id: 'T', nombre: 'Módulo T', x: 28, y: 38 },
    { id: 'U', nombre: 'Módulo U', x: 32, y: 42 },
    { id: 'V', nombre: 'Módulo V', x: 38, y: 48 },
    { id: 'W', nombre: 'Módulo W', x: 42, y: 52 },
    { id: 'X', nombre: 'Módulo X', x: 48, y: 58 },
    { id: 'Y', nombre: 'Módulo Y', x: 52, y: 62 },
    { id: 'Z', nombre: 'Módulo Z', x: 58, y: 68 },
    { id: 'Z1', nombre: 'Zona 1', x: 62, y: 72 },
    { id: 'Z2', nombre: 'Zona 2', x: 68, y: 78 },
    { id: 'V2', nombre: 'Vestíbulo 2', x: 72, y: 82 },
    { id: 'ALPHA', nombre: 'Edificio Alpha', x: 78, y: 88 },
    { id: 'BETA', nombre: 'Edificio Beta', x: 82, y: 92 },
    { id: 'L2', nombre: 'Laboratorio 2', x: 8, y: 15 },
    { id: 'JOBS', nombre: 'Área Jobs', x: 14, y: 18 },
    { id: 'santander', nombre: 'Edificio Santander', x: 24, y: 34 },
    { id: 'lona', nombre: 'Zona de la Lona', x: 34, y: 44 },
    { id: 'zona_alimentos_p', nombre: 'Zona Alimentos P', x: 44, y: 54 },
    { id: 'zona_alimentos_x', nombre: 'Zona Alimentos X', x: 54, y: 64 },
    { id: 'zona_alimentos_t', nombre: 'Zona Alimentos T', x: 64, y: 74 },
    { id: 'zona_alimentos_j', nombre: 'Zona Alimentos J', x: 74, y: 84 },
    { id: 'banos', nombre: 'Baños', x: 84, y: 94 },
    { id: 'laboratorio_ingenieria', nombre: 'Laboratorio de Ingeniería', x: 5, y: 10 }
  ];

  const handleImagenClick = (e) => {
    if (!imagenRef.current) return;
    
    const rect = imagenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCoordenadasImagen({ x, y });
    
    // Buscar el módulo más cercano (opcional)
    let moduloCercano = null;
    let distanciaMinima = 15; // Distancia máxima para considerar "cercano"
    
    for (const modulo of modulos) {
      const distancia = Math.sqrt(Math.pow(modulo.x - x, 2) + Math.pow(modulo.y - y, 2));
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        moduloCercano = modulo;
      }
    }
    
    if (moduloCercano && distanciaMinima < 10) {
      onModuloChange(moduloCercano.nombre);
      onUbicacionChange({
        x: moduloCercano.x,
        y: moduloCercano.y,
        direccion: moduloCercano.nombre,
        lat: null,
        lng: null
      });
    } else {
      onUbicacionChange({
        x, y,
        direccion: `Ubicación seleccionada (${Math.round(x)}%, ${Math.round(y)}%)`,
        lat: null,
        lng: null
      });
    }
  };

  const handleModuloSelect = (modulo) => {
    onModuloChange(modulo.nombre);
    setCoordenadasImagen({ x: modulo.x, y: modulo.y });
    onUbicacionChange({
      x: modulo.x,
      y: modulo.y,
      direccion: modulo.nombre,
      lat: null,
      lng: null
    });
  };

  return (
    <div className="mapa-imagen-selector">
      <div className="mb-3">
        <div className="d-flex gap-2 mb-3">
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => setMostrarMapa(!mostrarMapa)}
          >
            {mostrarMapa ? '🔼 Ocultar mapa' : '🗺️ Mostrar mapa del campus'}
          </button>
        </div>

        {mostrarMapa && (
          <div className="mapa-imagen-container">
            <div className="mapa-imagen-wrapper">
              <img
                ref={imagenRef}
                src="/Fondo/mapacucei.jpg"
                alt="Mapa del campus"
                className="mapa-imagen"
                onClick={handleImagenClick}
                style={{ cursor: 'crosshair', width: '100%', borderRadius: '12px' }}
              />
              
              {/* Marcador en la posición seleccionada */}
              {coordenadasImagen.x && coordenadasImagen.y && (
                <div 
                  className="mapa-marcador"
                  style={{
                    left: `${coordenadasImagen.x}%`,
                    top: `${coordenadasImagen.y}%`
                  }}
                >
                  <div className="mapa-marcador-punto"></div>
                  <div className="mapa-marcador-etiqueta">
                    {moduloSeleccionado || '📍'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mapa-instrucciones mt-2">
              <small className="text-muted">
                💡 Haz clic en cualquier parte del mapa para seleccionar una ubicación
              </small>
            </div>
          </div>
        )}

        <div className="row mt-3">
          <div className="col-md-6">
            <label className="form-label">📍 O selecciona un módulo:</label>
            <select 
              className="form-select"
              value={moduloSeleccionado || ''}
              onChange={(e) => {
                const modulo = modulos.find(m => m.nombre === e.target.value);
                if (modulo) handleModuloSelect(modulo);
              }}
            >
              <option value="">-- Selecciona un módulo --</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.nombre}>
                  {modulo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">📍 Ubicación seleccionada:</label>
            <input 
              type="text" 
              className="form-input" 
              value={ubicacionSeleccionada?.direccion || moduloSeleccionado || ''}
              readOnly
              placeholder="Haz clic en el mapa o selecciona un módulo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaImagenSelector;