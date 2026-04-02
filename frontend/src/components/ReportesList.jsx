import React, { useState, useEffect } from 'react';
import { Card, Badge, Dropdown, Button, Modal, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Person, Chat, Share, ThreeDots, Heart, HeartFill, Send, X, Link45deg, Check2, Facebook, Twitter, Envelope } from 'react-bootstrap-icons';
import api from '../services/api';

function ReportesList({ reportes, onReporteActualizado, usuarioActual }) {
  // Estados para likes
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});
  const [animating, setAnimating] = useState({});
  
  // Estados para comentarios
  const [showComments, setShowComments] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState({});
  const [cargandoComentarios, setCargandoComentarios] = useState({});
  const [enviandoComentario, setEnviandoComentario] = useState({});
  
  // Estados para compartir
  const [showShare, setShowShare] = useState({});
  const [copied, setCopied] = useState({});

  // Cargar likes desde localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem('reportesLikes');
    const savedLiked = localStorage.getItem('reportesLiked');
    if (savedLikes) setLikes(JSON.parse(savedLikes));
    if (savedLiked) setLiked(JSON.parse(savedLiked));
  }, []);

  // Guardar likes en localStorage
  useEffect(() => {
    localStorage.setItem('reportesLikes', JSON.stringify(likes));
    localStorage.setItem('reportesLiked', JSON.stringify(liked));
  }, [likes, liked]);

  const getBadgeVariant = (urgencia) => {
    switch(urgencia?.toLowerCase()) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'secondary';
    }
  };

  const getCategoriaBadge = (categoria) => {
    const colors = {
      'Infraestructura': 'secondary',
      'Limpieza': 'info',
      'Seguridad': 'danger',
      'Tecnología': 'primary',
      'Servicios': 'success'
    };
    return colors[categoria] || 'secondary';
  };

  // ========== FUNCIONES DE LIKES ==========
  const handleLike = (id) => {
    setAnimating(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAnimating(prev => ({ ...prev, [id]: false })), 300);

    if (liked[id]) {
      setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
      setLiked(prev => ({ ...prev, [id]: false }));
    } else {
      setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setLiked(prev => ({ ...prev, [id]: true }));
    }
  };

  const getLikeIcon = (id) => {
    if (liked[id]) return <HeartFill className="text-danger" size={18} />;
    return <Heart size={18} />;
  };

  const getLikeText = (id) => {
    const count = likes[id] || 0;
    if (count === 0) return "Me gusta";
    if (count === 1) return "1 persona le gusta esto";
    return `${count} personas les gusta esto`;
  };

  // ========== FUNCIONES DE COMENTARIOS ==========
  const cargarComentarios = async (reporteId) => {
    if (comentarios[reporteId]) return;
    
    setCargandoComentarios(prev => ({ ...prev, [reporteId]: true }));
    try {
      const response = await api.get(`/reportes/${reporteId}/comentarios`);
      setComentarios(prev => ({ ...prev, [reporteId]: response.data || [] }));
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      setComentarios(prev => ({ ...prev, [reporteId]: [] }));
    } finally {
      setCargandoComentarios(prev => ({ ...prev, [reporteId]: false }));
    }
  };

  const handleToggleComments = async (reporteId) => {
    const newState = !showComments[reporteId];
    setShowComments(prev => ({ ...prev, [reporteId]: newState }));
    
    if (newState && !comentarios[reporteId]) {
      await cargarComentarios(reporteId);
    }
  };

  const handleAddComentario = async (reporteId) => {
    const texto = nuevoComentario[reporteId];
    if (!texto?.trim()) return;
    
    setEnviandoComentario(prev => ({ ...prev, [reporteId]: true }));
    
    try {
      const response = await api.post(`/reportes/${reporteId}/comentarios`, {
        usuario: usuarioActual || localStorage.getItem('usuario') || 'Usuario',
        texto: texto.trim()
      });
      
      if (response.data.success) {
        // Agregar comentario a la lista
        setComentarios(prev => ({
          ...prev,
          [reporteId]: [response.data.comentario, ...(prev[reporteId] || [])]
        }));
        setNuevoComentario(prev => ({ ...prev, [reporteId]: '' }));
      }
    } catch (error) {
      console.error('Error al comentar:', error);
    } finally {
      setEnviandoComentario(prev => ({ ...prev, [reporteId]: false }));
    }
  };

  const handleLikeComentario = async (comentarioId) => {
    try {
      await api.post(`/comentarios/${comentarioId}/like`);
      // Actualizar UI
      setComentarios(prev => {
        const newComentarios = { ...prev };
        for (const reporteId in newComentarios) {
          newComentarios[reporteId] = newComentarios[reporteId].map(com =>
            com.id === comentarioId ? { ...com, likes: (com.likes || 0) + 1 } : com
          );
        }
        return newComentarios;
      });
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  // ========== FUNCIONES DE COMPARTIR ==========
  const handleToggleShare = (id) => {
    setShowShare(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = async (reporteId) => {
    const link = `${window.location.origin}/reporte/${reporteId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(prev => ({ ...prev, [reporteId]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [reporteId]: false })), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleShareToFacebook = (reporteId) => {
    const url = `${window.location.origin}/reporte/${reporteId}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareToTwitter = (reporteId, reporte) => {
    const text = encodeURIComponent(`📸 Reporte: ${reporte?.problema?.substring(0, 100)}`);
    const url = `${window.location.origin}/reporte/${reporteId}`;
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareToEmail = (reporteId, reporte) => {
    const subject = encodeURIComponent(`Reporte #${reporteId} - Sistema de Reportes IA`);
    const body = encodeURIComponent(`Hola,\n\nTe comparto este reporte:\n\nProblema: ${reporte?.problema}\nUbicación: ${reporte?.modulo}\nUrgencia: ${reporte?.urgencia}\n\nVer más en: ${window.location.origin}/reporte/${reporteId}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    
    if (diff < 1) return 'ahora mismo';
    if (diff < 60) return `hace ${diff} minutos`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)} horas`;
    return date.toLocaleDateString();
  };

  if (!reportes || reportes.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <Heart size={48} className="mb-3 text-secondary" />
        <h5>No hay reportes aún</h5>
        <p className="small">Sé el primero en reportar un problema</p>
      </div>
    );
  }

  return (
    <div>
      {reportes.map((reporte) => (
        <Card key={reporte.id} className="border-0 shadow-sm rounded-3 mb-4 reporte-card">
          {/* Header del reporte */}
          <Card.Body className="p-3 pb-2">
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                  {reporte.usuario?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="fw-bold">{reporte.usuario}</div>
                  <div className="d-flex align-items-center gap-2 small text-muted">
                    <span>{reporte.modulo}</span>
                    <span>•</span>
                    <span>{new Date(reporte.fecha).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Dropdown>
                <Dropdown.Toggle as={Button} variant="link" className="text-dark p-1">
                  <ThreeDots />
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item>Guardar reporte</Dropdown.Item>
                  <Dropdown.Item>Reportar problema</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-danger">Eliminar</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card.Body>

          {/* Contenido del reporte */}
          <Card.Body className="pt-0 pb-2">
            <div className="mb-2">
              <Badge bg={getCategoriaBadge(reporte.categoria)} pill className="me-2">
                🏷️ {reporte.categoria}
              </Badge>
              <Badge bg={getBadgeVariant(reporte.urgencia)} pill>
                ⚠️ Urgencia {reporte.urgencia}
              </Badge>
            </div>
            <p className="mb-2">{reporte.problema}</p>
          </Card.Body>

          {/* Interacciones */}
          <Card.Body className="pt-0 pb-2 border-top">
            <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1">
                  {liked[reporte.id] ? (
                    <HeartFill className="text-danger" size={14} />
                  ) : (
                    <Heart size={14} className="text-muted" />
                  )}
                  <span>{getLikeText(reporte.id)}</span>
                </div>
                <div 
                  className="d-flex align-items-center gap-1" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleToggleComments(reporte.id)}
                >
                  <Chat size={14} />
                  <span>{comentarios[reporte.id]?.length || 0} comentarios</span>
                </div>
                <div>0 veces compartido</div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="d-flex justify-content-around pt-2 border-top">
              <Button 
                variant="link" 
                className={`text-decoration-none d-flex align-items-center gap-2 like-button ${liked[reporte.id] ? 'liked' : ''}`}
                onClick={() => handleLike(reporte.id)}
              >
                <span className={`like-icon ${animating[reporte.id] ? 'animate-like' : ''}`}>
                  {getLikeIcon(reporte.id)}
                </span>
                <span className={liked[reporte.id] ? 'text-primary fw-bold' : 'text-muted'}>
                  Me gusta
                </span>
              </Button>
              
              <Button 
                variant="link" 
                className="text-muted text-decoration-none d-flex align-items-center gap-2"
                onClick={() => handleToggleComments(reporte.id)}
              >
                <Chat size={18} /> Comentar
              </Button>
              
              <Button 
                variant="link" 
                className="text-muted text-decoration-none d-flex align-items-center gap-2"
                onClick={() => handleToggleShare(reporte.id)}
              >
                <Share size={18} /> Compartir
              </Button>
            </div>

            {/* Sección de comentarios */}
            {showComments[reporte.id] && (
              <div className="mt-3 pt-2 border-top comments-section">
                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cargandoComentarios[reporte.id] ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : comentarios[reporte.id]?.length === 0 ? (
                    <div className="text-center text-muted py-3 small">
                      No hay comentarios aún. ¡Sé el primero en comentar!
                    </div>
                  ) : (
                    comentarios[reporte.id]?.map((com) => (
                      <div key={com.id} className="d-flex mb-3">
                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {com.usuario?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="bg-light rounded-3 p-2 flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="fw-bold small">{com.usuario}</span>
                            <small className="text-muted">{formatDate(com.fecha)}</small>
                          </div>
                          <p className="small mb-1">{com.texto}</p>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-muted text-decoration-none p-0 small comment-like"
                              onClick={() => handleLikeComentario(com.id)}
                            >
                              {com.likes > 0 ? `❤️ ${com.likes}` : '❤️ Me gusta'}
                            </Button>
                            <Button variant="link" size="sm" className="text-muted text-decoration-none p-0 small">
                              Responder
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input para nuevo comentario */}
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={nuevoComentario[reporte.id] || ''}
                    onChange={(e) => setNuevoComentario(prev => ({ ...prev, [reporte.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComentario(reporte.id)}
                    className="rounded-pill bg-light border-0"
                    disabled={!usuarioActual && !localStorage.getItem('usuario')}
                  />
                  <Button 
                    variant="primary" 
                    className="rounded-pill"
                    onClick={() => handleAddComentario(reporte.id)}
                    disabled={enviandoComentario[reporte.id] || !nuevoComentario[reporte.id]?.trim() || (!usuarioActual && !localStorage.getItem('usuario'))}
                  >
                    {enviandoComentario[reporte.id] ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </InputGroup>
                {(!usuarioActual && !localStorage.getItem('usuario')) && (
                  <small className="text-muted mt-1 d-block">Inicia sesión para comentar</small>
                )}
              </div>
            )}

            {/* Modal para compartir */}
            <Modal show={showShare[reporte.id]} onHide={() => handleToggleShare(reporte.id)} centered>
              <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title>Compartir reporte</Modal.Title>
              </Modal.Header>
              <Modal.Body className="pt-0">
                <p className="text-muted small mb-3">Comparte este reporte con otras personas</p>
                
                <div className="d-flex gap-3 mb-4 justify-content-center share-buttons">
                  <Button 
                    variant="primary" 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px' }}
                    onClick={() => handleShareToFacebook(reporte.id)}
                  >
                    <Facebook size={24} />
                  </Button>
                  <Button 
                    variant="info" 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: '48px', height: '48px' }}
                    onClick={() => handleShareToTwitter(reporte.id, reporte)}
                  >
                    <Twitter size={24} />
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px' }}
                    onClick={() => handleShareToEmail(reporte.id, reporte)}
                  >
                    <Envelope size={24} />
                  </Button>
                </div>

                <div className="border rounded-3 p-2 bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <Link45deg className="text-muted" />
                    <Form.Control 
                      type="text" 
                      value={`${window.location.origin}/reporte/${reporte.id}`}
                      readOnly
                      size="sm"
                      className="bg-light border-0 small"
                    />
                    <Button 
                      variant={copied[reporte.id] ? 'success' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleCopyLink(reporte.id)}
                    >
                      {copied[reporte.id] ? <Check2 size={14} /> : 'Copiar'}
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default ReportesList;