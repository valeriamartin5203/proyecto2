import React, { useState, useRef, useEffect } from 'react';

function MapaImagenSelector({ ubicacionSeleccionada, onUbicacionChange, moduloSeleccionado, onModuloChange }) {
  const [coordenadasImagen, setCoordenadasImagen] = useState({ x: null, y: null, px: null, py: null });
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [hoverCoords, setHoverCoords] = useState({ x: null, y: null, mostrar: false });
  const [dimensionesImagen, setDimensionesImagen] = useState({ width: 0, height: 0 });
  const [modulosCercanos, setModulosCercanos] = useState([]);
  const [mostrarNombres, setMostrarNombres] = useState(false);
  const [filtroModulo, setFiltroModulo] = useState('');
  const imagenRef = useRef(null);
  const containerRef = useRef(null);

  // Módulos predefinidos con coordenadas relativas a la imagen (porcentajes)
  const modulos = [
    { id: 'A', nombre: 'Módulo A', x: 10, y: 20, descripcion: 'Edificio principal' },
    { id: 'B', nombre: 'Módulo B', x: 15, y: 25, descripcion: 'Biblioteca' },
    { id: 'C', nombre: 'Módulo C', x: 20, y: 30, descripcion: 'Cafetería' },
    { id: 'D', nombre: 'Módulo D', x: 25, y: 35, descripcion: 'Auditorio' },
    { id: 'E', nombre: 'Módulo E', x: 30, y: 40, descripcion: 'Laboratorios' },
    { id: 'F', nombre: 'Módulo F', x: 35, y: 45, descripcion: 'Salones' },
    { id: 'G', nombre: 'Módulo G', x: 40, y: 50, descripcion: 'Gimnasio' },
    { id: 'H', nombre: 'Módulo H', x: 45, y: 55, descripcion: 'Estacionamiento' },
    { id: 'I', nombre: 'Módulo I', x: 50, y: 60, descripcion: 'Área administrativa' },
    { id: 'J', nombre: 'Módulo J', x: 55, y: 65, descripcion: 'Talleres' },
    { id: 'K', nombre: 'Módulo K', x: 60, y: 70, descripcion: 'Área verde' },
    { id: 'L', nombre: 'Módulo L', x: 65, y: 75, descripcion: 'Canchas' },
    { id: 'M', nombre: 'Módulo M', x: 70, y: 80, descripcion: 'Laboratorio de cómputo' },
    { id: 'N', nombre: 'Módulo N', x: 75, y: 85, descripcion: 'Sala de juntas' },
    { id: 'O', nombre: 'Módulo O', x: 80, y: 90, descripcion: 'Área de descanso' },
    { id: 'P', nombre: 'Módulo P', x: 85, y: 95, descripcion: 'Salida principal' },
    { id: 'Q', nombre: 'Módulo Q', x: 12, y: 22, descripcion: 'Control escolar' },
    { id: 'R', nombre: 'Módulo R', x: 18, y: 28, descripcion: 'Oficinas' },
    { id: 'S', nombre: 'Módulo S', x: 22, y: 32, descripcion: 'Enfermería' },
    { id: 'T', nombre: 'Módulo T', x: 28, y: 38, descripcion: 'Psicología' },
    { id: 'U', nombre: 'Módulo U', x: 32, y: 42, descripcion: 'Tutorías' },
    { id: 'V', nombre: 'Módulo V', x: 38, y: 48, descripcion: 'Vinculación' },
    { id: 'W', nombre: 'Módulo W', x: 42, y: 52, descripcion: 'Idiomas' },
    { id: 'X', nombre: 'Módulo X', x: 48, y: 58, descripcion: 'Internacional' },
    { id: 'Y', nombre: 'Módulo Y', x: 52, y: 62, descripcion: 'Emprendedores' },
    { id: 'Z', nombre: 'Módulo Z', x: 58, y: 68, descripcion: 'Incubadora' },
    { id: 'Z1', nombre: 'Zona 1', x: 62, y: 72, descripcion: 'Área de carga' },
    { id: 'Z2', nombre: 'Zona 2', x: 68, y: 78, descripcion: 'Mantenimiento' },
    { id: 'V2', nombre: 'Vestíbulo 2', x: 72, y: 82, descripcion: 'Entrada secundaria' },
    { id: 'ALPHA', nombre: 'Edificio Alpha', x: 78, y: 88, descripcion: 'Tecnología' },
    { id: 'BETA', nombre: 'Edificio Beta', x: 82, y: 92, descripcion: 'Innovación' },
    { id: 'L2', nombre: 'Laboratorio 2', x: 8, y: 15, descripcion: 'Química' },
    { id: 'JOBS', nombre: 'Área Jobs', x: 14, y: 18, descripcion: 'Empleabilidad' },
    { id: 'santander', nombre: 'Edificio Santander', x: 24, y: 34, descripcion: 'Financiero' },
    { id: 'lona', nombre: 'Zona de la Lona', x: 34, y: 44, descripcion: 'Eventos' },
    { id: 'zona_alimentos_p', nombre: 'Zona Alimentos P', x: 44, y: 54, descripcion: 'Comida rápida' },
    { id: 'zona_alimentos_x', nombre: 'Zona Alimentos X', x: 54, y: 64, descripcion: 'Restaurantes' },
    { id: 'zona_alimentos_t', nombre: 'Zona Alimentos T', x: 64, y: 74, descripcion: 'Cafetería' },
    { id: 'zona_alimentos_j', nombre: 'Zona Alimentos J', x: 74, y: 84, descripcion: 'Snacks' },
    { id: 'banos', nombre: 'Baños', x: 84, y: 94, descripcion: 'Sanitarios' },
    { id: 'laboratorio_ingenieria', nombre: 'Laboratorio de Ingeniería', x: 5, y: 10, descripcion: 'Ingeniería' }
  ];

  // Filtrar módulos por búsqueda
  const modulosFiltrados = modulos.filter(modulo =>
    modulo.nombre.toLowerCase().includes(filtroModulo.toLowerCase()) ||
    modulo.descripcion.toLowerCase().includes(filtroModulo.toLowerCase())
  );

  // Obtener dimensiones reales de la imagen cuando se carga
  const handleImageLoad = () => {
    if (imagenRef.current) {
      const width = imagenRef.current.naturalWidth;
      const height = imagenRef.current.naturalHeight;
      setDimensionesImagen({ width, height });
      console.log(`📐 Dimensiones reales de la imagen: ${width}x${height}`);
    }
  };

  const handleMouseMove = (e) => {
    if (!imagenRef.current) return;
    
    const rect = imagenRef.current.getBoundingClientRect();
    const xPorcentaje = ((e.clientX - rect.left) / rect.width) * 100;
    const yPorcentaje = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Buscar módulos cercanos al hover
    const cercanos = modulos.filter(modulo => {
      const distancia = Math.sqrt(Math.pow(modulo.x - xPorcentaje, 2) + Math.pow(modulo.y - yPorcentaje, 2));
      return distancia < 8;
    });
    setModulosCercanos(cercanos);
    
    setHoverCoords({ 
      x: xPorcentaje, 
      y: yPorcentaje, 
      mostrar: true 
    });
  };

  const handleMouseLeave = () => {
    setHoverCoords({ x: null, y: null, mostrar: false });
    setModulosCercanos([]);
  };

  const handleImagenClick = (e) => {
    if (!imagenRef.current) return;
    
    const rect = imagenRef.current.getBoundingClientRect();
    const xPorcentaje = ((e.clientX - rect.left) / rect.width) * 100;
    const yPorcentaje = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCoordenadasImagen({ 
      x: xPorcentaje, 
      y: yPorcentaje,
    });
    
    // Buscar el módulo más cercano
    let moduloCercano = null;
    let distanciaMinima = 10;
    
    for (const modulo of modulos) {
      const distancia = Math.sqrt(Math.pow(modulo.x - xPorcentaje, 2) + Math.pow(modulo.y - yPorcentaje, 2));
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        moduloCercano = modulo;
      }
    }
    
    if (moduloCercano && distanciaMinima < 8) {
      onModuloChange(moduloCercano.nombre);
      onUbicacionChange({
        x: moduloCercano.x,
        y: moduloCercano.y,
        direccion: moduloCercano.nombre,
        descripcion: moduloCercano.descripcion
      });
      setCoordenadasImagen({ 
        x: moduloCercano.x, 
        y: moduloCercano.y,
      });
    } else {
      onModuloChange(`Ubicación personalizada`);
      onUbicacionChange({
        x: xPorcentaje,
        y: yPorcentaje,
        direccion: `Ubicación personalizada`,
      });
    }
  };

  const handleModuloSelect = (modulo) => {
    onModuloChange(modulo.nombre);
    setCoordenadasImagen({ 
      x: modulo.x, 
      y: modulo.y,
    });
    onUbicacionChange({
      x: modulo.x,
      y: modulo.y,
      direccion: modulo.nombre,
      descripcion: modulo.descripcion
    });
  };

  return (
    <div className="mapa-imagen-selector" ref={containerRef}>
      <div className="mb-3">
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => setMostrarMapa(!mostrarMapa)}
          >
            {mostrarMapa ? '🔼 Ocultar mapa' : '🗺️ Mostrar mapa del campus'}
          </button>
          {mostrarMapa && (
            <>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setMostrarNombres(!mostrarNombres)}
              >
                {mostrarNombres ? '🏷️ Ocultar etiquetas' : '🏷️ Mostrar etiquetas'}
              </button>
              <div className="ms-auto" style={{ width: '200px' }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="🔍 Buscar módulo..."
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                />
              </div>
            </>
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
                src="/images/mapa-campus.png"
                alt="Mapa del campus - Haz clic para seleccionar ubicación"
                className="mapa-imagen"
                onClick={handleImagenClick}
                onLoad={handleImageLoad}
                style={{ cursor: 'crosshair', width: '100%', borderRadius: '12px' }}
              />
              
              {/* Cursor de hover */}
              {hoverCoords.mostrar && (
                <div 
                  className="mapa-hover"
                  style={{
                    left: `${hoverCoords.x}%`,
                    top: `${hoverCoords.y}%`
                  }}
                >
                  <div className="mapa-hover-punto"></div>
                  <div className="mapa-hover-etiqueta">
                    {modulosCercanos.length > 0 ? (
                      <>
                        <span>📍 {modulosCercanos[0].nombre}</span>
                        <span className="mapa-hover-desc">{modulosCercanos[0].descripcion}</span>
                      </>
                    ) : (
                      <span>🖱️ Click para seleccionar</span>
                    )}
                  </div>
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
              
              {/* TODOS LOS MÓDULOS - Puntos visibles en el mapa */}
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
                    {mostrarNombres && (
                      <div className="mapa-modulo-etiqueta">
                        {modulo.nombre}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mapa-instrucciones mt-2">
              <div className="row">
                <div className="col-md-8">
                  <small className="text-muted">
                    💡 <strong>Instrucciones:</strong> 
                    <span> 🔵 Puntos azules = Módulos disponibles</span>
                    <span> 🟡 Hover = Ver módulo cercano</span>
                    <span> 🔴 Click = Seleccionar ubicación</span>
                  </small>
                </div>
                <div className="col-md-4 text-end">
                  <small className="text-muted">
                    <strong>Total módulos:</strong> {modulosFiltrados.length}
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mt-3">
          <div className="col-md-6">
            <label className="form-label">📍 Selecciona un módulo de la lista:</label>
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
              placeholder="Haz clic en el mapa o selecciona un módulo"
            />
            {ubicacionSeleccionada?.descripcion && (
              <small className="text-muted d-block mt-1">
                📖 {ubicacionSeleccionada.descripcion}
              </small>
            )}
          </div>
        </div>

        {/* Leyenda del mapa */}
        {mostrarMapa && (
          <div className="mapa-leyenda mt-3">
            <div className="d-flex gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-1">
                <div className="mapa-leyenda-punto" style={{ backgroundColor: '#1877f2' }}></div>
                <small>Módulo disponible</small>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="mapa-leyenda-punto" style={{ backgroundColor: '#ffc107' }}></div>
                <small>Posición del mouse</small>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="mapa-leyenda-punto" style={{ backgroundColor: '#dc3545' }}></div>
                <small>Ubicación seleccionada</small>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="mapa-leyenda-punto" style={{ backgroundColor: '#28a745' }}></div>
                <small>Módulo seleccionado</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapaImagenSelector;