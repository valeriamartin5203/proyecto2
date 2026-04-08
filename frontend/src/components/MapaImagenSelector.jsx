import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

function MapaImagenSelector({ ubicacionSeleccionada, onUbicacionChange, moduloSeleccionado, onModuloChange }) {
  const [coordenadasImagen, setCoordenadasImagen] = useState({ x: null, y: null });
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [hoverCoords, setHoverCoords] = useState({ x: null, y: null, mostrar: false });
  const [filtroModulo, setFiltroModulo] = useState('');
  const imagenRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Módulos del CUCEI con coordenadas ajustadas al mapa
  const modulos = useMemo(() => [
    // Edificios principales
    { id: 'A', nombre: 'Módulo A', x: 56, y: 77, descripcion: 'Edificio A' },
    { id: 'B', nombre: 'Módulo B', x: 74, y: 78, descripcion: 'Edificio B' },
    { id: 'C', nombre: 'Módulo C', x: 71, y: 75, descripcion: 'Edificio C' },
    { id: 'D', nombre: 'Módulo D', x: 66, y: 72, descripcion: 'Edificio D' },
    { id: 'biblioteca', nombre: 'Biblioteca', x: 63, y: 67, descripcion: 'Biblioteca Central' },
    { id: 'E', nombre: 'Módulo E', x: 52, y: 57, descripcion: 'Edificio E' },
    { id: 'F', nombre: 'Módulo F', x: 52, y: 53, descripcion: 'Edificio F' },
    { id: 'G', nombre: 'Módulo G', x: 30, y: 53, descripcion: 'Edificio G' },
    { id: 'H', nombre: 'Módulo H', x: 42, y: 51, descripcion: 'Edificio H' },
    { id: 'I', nombre: 'Módulo I', x: 59, y: 51, descripcion: 'Edificio I' },
    { id: 'J', nombre: 'Módulo J', x: 51, y: 48, descripcion: 'Edificio J' },
    { id: 'K', nombre: 'Módulo K', x: 49, y: 46, descripcion: 'Edificio K' },
    { id: 'L', nombre: 'Módulo L', x: 67, y: 41, descripcion: 'Edificio L' },
    { id: 'M', nombre: 'Módulo M', x: 46, y: 43, descripcion: 'Edificio M' },
    { id: 'N', nombre: 'Módulo N', x: 46, y: 39, descripcion: 'Edificio N' },
    { id: 'O', nombre: 'Módulo O', x: 44, y: 34, descripcion: 'Edificio O' },
    { id: 'P', nombre: 'Módulo P', x: 63, y: 34, descripcion: 'Edificio P' },
    { id: 'Q', nombre: 'Módulo Q', x: 72, y: 30, descripcion: 'Edificio Q' },
    { id: 'R', nombre: 'Módulo R', x: 58, y: 29, descripcion: 'Edificio R' },
    { id: 'S', nombre: 'Módulo S', x: 44, y: 30, descripcion: 'Edificio S' },
    { id: 'T', nombre: 'Módulo T', x: 62, y: 26, descripcion: 'Edificio T' },
    { id: 'U', nombre: 'Módulo U', x: 61, y: 23, descripcion: 'Edificio U' },
    { id: 'V', nombre: 'Módulo V', x: 43, y: 21, descripcion: 'Edificio V' },
    { id: 'V2', nombre: 'Módulo V2', x: 44, y: 24, descripcion: 'Edificio V2' },
    { id: 'W', nombre: 'Módulo W', x: 30, y: 24, descripcion: 'Edificio W' },
    { id: 'X', nombre: 'Módulo X', x: 30, y: 21, descripcion: 'Edificio X' },
    { id: 'Y', nombre: 'Módulo Y', x: 22, y: 35, descripcion: 'Edificio Y' },
    { id: 'Z', nombre: 'Módulo Z', x: 13, y: 35, descripcion: 'Edificio Z' },
    { id: 'Z1', nombre: 'Módulo Z1', x: 10, y: 34, descripcion: 'Edificio Z1' },
    { id: 'Z2', nombre: 'Módulo Z2', x: 18, y: 30, descripcion: 'Edificio Z2' },
    { id: 'ALPHA', nombre: 'Alpha', x: 66, y: 46, descripcion: 'Edificio Alpha' },
    { id: 'BETA', nombre: 'Beta', x: 67, y: 48, descripcion: 'Edificio Beta' },
    { id: 'Pasillo Alpha y beta', nombre: 'Pasillo Alpha y beta', x: 67, y: 47, descripcion: 'Pasillo Alpha y beta' },
    { id: 'lona', nombre: 'Lona', x: 20, y: 32, descripcion: 'Área de la Lona - Eventos' },
    

    // Zonas especiales
    { id: 'Z1', nombre: 'Z 1', x: 0, y: 0, descripcion: 'Módulo Z1' },
    { id: 'Z2', nombre: 'Z 2', x: 0, y: 0, descripcion: 'Estacionamiento 2' },
    { id: 'V2', nombre: 'Pasillo M', x: 0, y: 0, descripcion: 'Vestíbulo principal' },
    { id: 'ALPHA', nombre: 'Alpha', x: 0, y: 0, descripcion: 'Edificio Alpha - Laboratorios' },
    { id: 'BETA', nombre: 'Beta', x: 0, y: 0, descripcion: 'Edificio Beta - Tecnología' },
    { id: 'L2', nombre: 'Laboratorio 2', x: 0, y: 0, descripcion: 'Laboratorio de Ingenierías' },
    { id: 'JOBS', nombre: 'JOBS', x: 0, y: 0, descripcion: 'Bolsa de trabajo' },
    { id: 'santander', nombre: 'Santander', x: 0, y: 0, descripcion: 'Cajero Santander' },
    { id: 'lona', nombre: 'Lona', x: 0, y: 0, descripcion: 'Área de la Lona - Eventos' },
    
    // Zonas de alimentos
    { id: 'zona_alimentos_p', nombre: 'Zona Alimentos P', x: 0, y: 0, descripcion: 'Cafetería P' },
    { id: 'zona_alimentos_x', nombre: 'Zona Alimentos X', x: 36, y: 14, descripcion: 'Comida rápida' },
    { id: 'zona_alimentos_t', nombre: 'Zona Alimentos T', x: 0, y: 0, descripcion: 'Tortas y snacks' },
    { id: 'zona_alimentos_j', nombre: 'Zona Alimentos J', x: 0, y: 0, descripcion: 'Jugos y frutas' },
    { id: 'laboratorio_ingenieria', nombre: 'Lab. Ingeniería', x: 80, y: 25, descripcion: 'Laboratorio de Ingenierías / TITANIC' },
    { id: 'MATUTE', nombre: 'MATUTE', x: 57, y: 40, descripcion: 'MATUTE' },    
    // Accesos
    { id: 'acceso_principal', nombre: 'Acceso Principal', x: 0, y: 0, descripcion: 'Registro facial - Entrada principal' },
    { id: 'acceso_secundario', nombre: 'Acceso Secundario', x: 0, y: 0, descripcion: 'Entrada por Calzada' },
    { id: 'acceso_revolucion', nombre: 'Acceso Revolución', x: 85, y: 12, descripcion: 'Entrada por Calz. Revolución' }
  ], []);

  // Filtrar módulos
  const modulosFiltrados = useMemo(() => {
    if (!filtroModulo) return modulos;
    return modulos.filter(modulo =>
      modulo.nombre.toLowerCase().includes(filtroModulo.toLowerCase()) ||
      modulo.descripcion.toLowerCase().includes(filtroModulo.toLowerCase())
    );
  }, [modulos, filtroModulo]);

  const handleMouseMove = useCallback((e) => {
    if (!imagenRef.current) return;
    
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = imagenRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setHoverCoords({ x, y, mostrar: true });
    }, 10);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverCoords({ x: null, y: null, mostrar: false });
  }, []);

  const handleImagenClick = (e) => {
    if (!imagenRef.current) return;
    const rect = imagenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCoordenadasImagen({ x, y });
    
    // Buscar módulo más cercano (distancia máxima 8%)
    let moduloCercano = null;
    let distanciaMinima = 8;
    for (const modulo of modulos) {
      const distancia = Math.sqrt(Math.pow(modulo.x - x, 2) + Math.pow(modulo.y - y, 2));
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        moduloCercano = modulo;
      }
    }
    
    if (moduloCercano) {
      // Si hay un módulo cercano, seleccionarlo
      onModuloChange(moduloCercano.nombre);
      onUbicacionChange({
        x: moduloCercano.x,
        y: moduloCercano.y,
        direccion: moduloCercano.nombre,
        descripcion: moduloCercano.descripcion
      });
      setCoordenadasImagen({ x: moduloCercano.x, y: moduloCercano.y });
    } else {
      // Si no hay módulo cercano, crear ubicación personalizada con coordenadas X e Y
      const xRedondeado = Math.round(x);
      const yRedondeado = Math.round(y);
      const ubicacionPersonalizada = `X:${xRedondeado}% Y:${yRedondeado}%`;
      
      onModuloChange(ubicacionPersonalizada);
      onUbicacionChange({
        x, y,
        direccion: ubicacionPersonalizada,
        descripcion: `Coordenadas en el mapa`
      });
      setCoordenadasImagen({ x, y });
    }
  };

  const handleModuloSelect = (modulo) => {
    onModuloChange(modulo.nombre);
    setCoordenadasImagen({ x: modulo.x, y: modulo.y });
    onUbicacionChange({
      x: modulo.x,
      y: modulo.y,
      direccion: modulo.nombre,
      descripcion: modulo.descripcion
    });
  };

  return (
    <div className="mapa-imagen-selector">
      <div className="mb-3">
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => setMostrarMapa(!mostrarMapa)}
          >
            {mostrarMapa ? '🔼 Ocultar mapa' : '🗺️ Mostrar mapa del CUCEI'}
          </button>
          {mostrarMapa && (
            <div className="ms-auto" style={{ width: '250px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="🔍 Buscar módulo (A, B, Biblioteca, etc)..."
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
              />
            </div>
          )}
        </div>

        {mostrarMapa && (
          <div className="mapa-imagen-container">
            <div 
              className="mapa-imagen-wrapper"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                ref={imagenRef}
                src="/images/mapacucei.jpg"
                alt="Mapa del CUCEI - Haz clic para seleccionar ubicación"
                className="mapa-imagen"
                onClick={handleImagenClick}
                style={{ cursor: 'crosshair', width: '100%', borderRadius: '12px' }}
              />
              
              {/* Todos los puntos de módulos siempre visibles */}
              <div className="mapa-modulos-overlay">
                {modulosFiltrados.map((modulo) => (
                  <div
                    key={modulo.id}
                    className={`mapa-modulo-marcador ${moduloSeleccionado === modulo.nombre ? 'selected' : ''}`}
                    style={{
                      left: `${modulo.x}%`,
                      top: `${modulo.y}%`
                    }}
                    title={`${modulo.nombre}: ${modulo.descripcion}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuloSelect(modulo);
                    }}
                  >
                    <div className="mapa-modulo-punto"></div>
                    <div className="mapa-modulo-etiqueta">
                      {modulo.nombre}
                    </div>
                    <div className="mapa-modulo-tooltip">
                      {modulo.descripcion}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Punto de hover (amarillo) */}
              {hoverCoords.mostrar && (
                <div 
                  className="mapa-hover"
                  style={{
                    left: `${hoverCoords.x}%`,
                    top: `${hoverCoords.y}%`
                  }}
                >
                  <div className="mapa-hover-punto"></div>
                </div>
              )}
              
              {/* Marcador seleccionado (rojo) */}
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
                    📍 {moduloSeleccionado || 'Seleccionado'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mapa-instrucciones mt-2">
              <div className="row">
                <div className="col-md-7">
                  <small className="text-muted">
                    💡 <strong>Mapa del CUCEI</strong> - Haz clic en cualquier punto azul o en el mapa para seleccionar ubicación
                  </small>
                </div>
                <div className="col-md-5 text-end">
                  <small className="text-muted">
                    <strong>Total ubicaciones:</strong> {modulosFiltrados.length}
                  </small>
                </div>
              </div>
            </div>

            {/* Leyenda de colores */}
            <div className="mapa-leyenda mt-2">
              <div className="d-flex gap-4 flex-wrap justify-content-center">
                <div className="d-flex align-items-center gap-2">
                  <div className="mapa-leyenda-punto" style={{ backgroundColor: '#1877f2' }}></div>
                  <small>Ubicación disponible</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="mapa-leyenda-punto" style={{ backgroundColor: '#28a745' }}></div>
                  <small>Seleccionado</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="mapa-leyenda-punto" style={{ backgroundColor: '#ffc107' }}></div>
                  <small>Posición del mouse</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="mapa-leyenda-punto" style={{ backgroundColor: '#dc3545' }}></div>
                  <small>Ubicación marcada</small>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mt-3">
          <div className="col-md-6">
            <label className="form-label">📍 Selecciona una ubicación:</label>
            <select 
              className="form-select"
              value={moduloSeleccionado || ''}
              onChange={(e) => {
                const modulo = modulos.find(m => m.nombre === e.target.value);
                if (modulo) handleModuloSelect(modulo);
              }}
            >
              <option value="">-- Selecciona --</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.nombre}>
                  {modulo.nombre} - {modulo.descripcion}
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
              placeholder="Haz clic en el mapa o selecciona una ubicación"
            />
            {ubicacionSeleccionada?.descripcion && (
              <small className="text-muted d-block mt-1">
                📖 {ubicacionSeleccionada.descripcion}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaImagenSelector;