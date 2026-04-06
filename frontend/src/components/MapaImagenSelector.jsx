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
    // Edificios principales (parte superior)
    { id: 'A', nombre: 'Módulo A', x: 60, y: 80, descripcion: 'Edificio A' },
    { id: 'B', nombre: 'Módulo B', x: 79, y: 76, descripcion: 'Edificio B' },
    { id: 'C', nombre: 'Módulo C', x: 29, y: 31, descripcion: 'Edificio C' },
    { id: 'D', nombre: 'Módulo D', x: 36, y: 34, descripcion: 'Edificio D' },
    { id: 'E', nombre: 'Módulo E', x: 43, y: 37, descripcion: 'Edificio E' },
    { id: 'F', nombre: 'Módulo F', x: 50, y: 40, descripcion: 'Edificio F' },
    { id: 'G', nombre: 'Módulo G', x: 57, y: 43, descripcion: 'Edificio G' },
    { id: 'H', nombre: 'Módulo H', x: 64, y: 46, descripcion: 'Edificio H' },
    { id: 'I', nombre: 'Módulo I', x: 71, y: 49, descripcion: 'Edificio I' },
    { id: 'J', nombre: 'Módulo J', x: 78, y: 52, descripcion: 'Edificio J' },
    { id: 'K', nombre: 'Módulo K', x: 85, y: 55, descripcion: 'Edificio K' },
    { id: 'L', nombre: 'Módulo L', x: 20, y: 60, descripcion: 'Edificio L' },
    { id: 'M', nombre: 'Módulo M', x: 30, y: 65, descripcion: 'Edificio M' },
    { id: 'N', nombre: 'Módulo N', x: 40, y: 70, descripcion: 'Edificio N' },
    { id: 'O', nombre: 'Módulo O', x: 50, y: 75, descripcion: 'Edificio O' },
    { id: 'P', nombre: 'Módulo P', x: 60, y: 80, descripcion: 'Edificio P' },
    { id: 'Q', nombre: 'Módulo Q', x: 70, y: 85, descripcion: 'Edificio Q' },
    { id: 'R', nombre: 'Módulo R', x: 80, y: 90, descripcion: 'Edificio R' },
    { id: 'S', nombre: 'Módulo S', x: 10, y: 35, descripcion: 'Servicios Escolares' },
    { id: 'T', nombre: 'Módulo T', x: 18, y: 42, descripcion: 'Control Escolar' },
    { id: 'U', nombre: 'Módulo U', x: 26, y: 49, descripcion: 'Unidad de Posgrado' },
    { id: 'V', nombre: 'Módulo V', x: 34, y: 56, descripcion: 'Vinculación' },
    { id: 'W', nombre: 'Módulo W', x: 42, y: 63, descripcion: 'Idiomas' },
    { id: 'X', nombre: 'Módulo X', x: 50, y: 20, descripcion: 'Área de Gobierno' },
    { id: 'Y', nombre: 'Módulo Y', x: 58, y: 25, descripcion: 'Rectoría' },
    { id: 'Z', nombre: 'Módulo Z', x: 66, y: 30, descripcion: 'Planeación' },
    
    // Zonas especiales
    { id: 'Z1', nombre: 'Z 1', x: 75, y: 35, descripcion: ' Modulo Z1' },
    { id: 'Z2', nombre: 'Z 2', x: 85, y: 40, descripcion: 'Estacionamiento 2' },
    { id: 'V2', nombre: 'pasillo M', x: 45, y: 45, descripcion: 'Vestíbulo principal' },
    { id: 'ALPHA', nombre: 'Alpha', x: 55, y: 50, descripcion: 'Edificio Alpha - Laboratorios' },
    { id: 'BETA', nombre: 'Beta', x: 65, y: 55, descripcion: 'Edificio Beta - Tecnología' },
    { id: 'L2', nombre: 'Laboratorio 2', x: 35, y: 60, descripcion: 'Laboratorio de Ingenierías' },
    { id: 'JOBS', nombre: 'JOBS', x: 25, y: 65, descripcion: 'Bolsa de trabajo' },
    { id: 'santander', nombre: 'Santander', x: 15, y: 70, descripcion: 'Cajero Santander' },
    { id: 'lona', nombre: 'Lona', x: 5, y: 75, descripcion: 'Área de la Lona - Eventos' },
    
    // Zonas de alimentos
    { id: 'zona_alimentos_p', nombre: 'Zona Alimentos P', x: 12, y: 80, descripcion: 'Cafetería P' },
    { id: 'zona_alimentos_x', nombre: 'Zona Alimentos X', x: 22, y: 85, descripcion: 'Comida rápida' },
    { id: 'zona_alimentos_t', nombre: 'Zona Alimentos T', x: 32, y: 90, descripcion: 'Tortas y snacks' },
    { id: 'zona_alimentos_j', nombre: 'Zona Alimentos J', x: 42, y: 95, descripcion: 'Jugos y frutas' },
    
    // Servicios
    { id: 'baños', nombre: 'Baños', x: 48, y: 98, descripcion: 'Sanitarios generales' },
    { id: 'laboratorio_ingenieria', nombre: 'Lab. Ingeniería', x: 38, y: 55, descripcion: 'Laboratorio de Ingenierías' },
    { id: 'biblioteca', nombre: 'Biblioteca', x: 52, y: 52, descripcion: 'Biblioteca Central' },
    { id: 'auditorios', nombre: 'Auditorios', x: 62, y: 48, descripcion: 'Auditorio principal' },
    { id: 'medico', nombre: 'Médico', x: 72, y: 44, descripcion: 'Servicio médico' },
    { id: 'servicios_generales', nombre: 'Servicios Generales', x: 82, y: 40, descripcion: 'Mantenimiento' },
    { id: 'papeleria', nombre: 'Papelería', x: 28, y: 35, descripcion: 'Papelería' },
    { id: 'cafeteria', nombre: 'Cafetería', x: 18, y: 30, descripcion: 'Cafetería central' },
    { id: 'linea3', nombre: 'Línea 3', x: 8, y: 25, descripcion: 'Estación Línea 3' },
    { id: 'cid', nombre: 'CID', x: 48, y: 28, descripcion: 'Centro de Investigación' },
    { id: 'jardines', nombre: 'Jardines', x: 58, y: 22, descripcion: 'Áreas verdes' },
    { id: 'explanadas', nombre: 'Explanadas', x: 68, y: 18, descripcion: 'Zonas de esparcimiento' },
    
    // Accesos
    { id: 'acceso_principal', nombre: 'Acceso Principal', x: 50, y: 10, descripcion: 'Registro facial - Entrada principal' },
    { id: 'acceso_secundario', nombre: 'Acceso Secundario', x: 80, y: 15, descripcion: 'Entrada por Calzada' },
    { id: 'acceso_revolucion', nombre: 'Acceso Revolución', x: 10, y: 5, descripcion: 'Entrada por Calz. Revolución' }
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
    
    // Buscar módulo más cercano
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
      onModuloChange(moduloCercano.nombre);
      onUbicacionChange({
        x: moduloCercano.x,
        y: moduloCercano.y,
        direccion: moduloCercano.nombre,
        descripcion: moduloCercano.descripcion
      });
      setCoordenadasImagen({ x: moduloCercano.x, y: moduloCercano.y });
    } else {
      onModuloChange(`Ubicación personalizada`);
      onUbicacionChange({
        x, y,
        direccion: `Ubicación personalizada`,
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
              
              {/* Punto de hover */}
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
              
              {/* Marcador seleccionado */}
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

            {/* Leyenda */}
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