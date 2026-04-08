import React, { useState, useEffect } from 'react';
import { Card, Badge, Dropdown, Button, Modal, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Person, Chat, Share, ThreeDots, Heart, HeartFill, Send, Link45deg, Check2, Facebook, Twitter, Envelope, Eye, Reply, Trash } from 'react-bootstrap-icons';
import api from '../services/api';
import Confetti from './Confetti';

// Componente de imagen
function ReporteImagen({ imagen, problema, onClick }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  if (!imagen) return null;
  const imageUrl = imagen.startsWith('http') ? imagen : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${imagen}`;

  return (
    <div className="mt-3 position-relative">
      <div className="reporte-imagen-container rounded-3 overflow-hidden" style={{ cursor: 'pointer', maxHeight: '400px', backgroundColor: '#f0f2f5', minHeight: '200px' }} onClick={onClick}>
        {cargando && (
          <div className="d-flex align-items-center justify-content-center h-100" style={{ minHeight: '200px' }}>
            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
            <span className="text-muted">Cargando imagen...</span>
          </div>
        )}
        <img src={imageUrl} alt={problema || "Evidencia"} className="img-fluid w-100" style={{ objectFit: 'cover', maxHeight: '350px', display: cargando ? 'none' : 'block' }} onLoad={() => setCargando(false)} onError={() => { setCargando(false); setError(true); }} />
        {error && (
          <div className="d-flex flex-column align-items-center justify-content-center p-4" style={{ minHeight: '200px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="8.82" y1="8.82" x2="15.18" y2="15.18"></line><line x1="15.18" y1="8.82" x2="8.82" y2="15.18"></line></svg>
            <p className="text-danger mt-2 small mb-0">No se pudo cargar la imagen</p>
          </div>
        )}
        <div className="imagen-overlay"><Eye size={20} className="text-white" /><span className="text-white ms-2 small">Ver imagen completa</span></div>
      </div>
    </div>
  );
}

function ReportesList({ reportes, usuarioActual, onReporteEliminado }) {
  // Estados para likes
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});
  const [animating, setAnimating] = useState({});
  const [cargandoLikes, setCargandoLikes] = useState(true);
  const [showConfetti, setShowConfetti] = useState({});
  const [consecutiveLikes, setConsecutiveLikes] = useState({});
  
  // Estados para comentarios
  const [showComments, setShowComments] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [respuestas, setRespuestas] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState({});
  const [nuevaRespuesta, setNuevaRespuesta] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [cargandoComentarios, setCargandoComentarios] = useState({});
  const [enviandoComentario, setEnviandoComentario] = useState({});
  const [enviandoRespuesta, setEnviandoRespuesta] = useState({});
  
  // Estados para compartir
  const [showShare, setShowShare] = useState({});
  const [copied, setCopied] = useState({});
  const [showImageModal, setShowImageModal] = useState({});
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  
  // Estado para confirmar eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reporteAEliminar, setReporteAEliminar] = useState(null);

  // Cargar likes
  useEffect(() => {
    if (usuarioActual && reportes.length > 0) cargarTodosLosLikes();
  }, [usuarioActual, reportes]);

  const cargarTodosLosLikes = async () => {
    setCargandoLikes(true);
    try {
      const response = await api.get(`/api/likes/usuario/${usuarioActual}`);
      const likedReportes = response.data.likedReportes || [];
      const likesMap = {};
      const likedMap = {};
      for (const reporte of reportes) {
        try {
          const likesResponse = await api.get(`/api/likes/${reporte.id}`);
          likesMap[reporte.id] = likesResponse.data.total || 0;
          likedMap[reporte.id] = likedReportes.includes(reporte.id);
        } catch (error) {
          likesMap[reporte.id] = 0;
          likedMap[reporte.id] = false;
        }
      }
      setLikes(likesMap);
      setLiked(likedMap);
    } catch (error) {
      console.error('Error cargando likes:', error);
    } finally {
      setCargandoLikes(false);
    }
  };

  // Cargar respuestas
  const cargarRespuestas = async (comentarioId) => {
    if (respuestas[comentarioId]) return;
    try {
      const response = await api.get(`/api/respuestas/${comentarioId}`);
      setRespuestas(prev => ({ ...prev, [comentarioId]: response.data || [] }));
    } catch (error) {
      setRespuestas(prev => ({ ...prev, [comentarioId]: [] }));
    }
  };

  const handleLike = async (reporteId) => {
    if (!usuarioActual) return alert('Inicia sesión para dar like');
    const newCount = (consecutiveLikes[reporteId] || 0) + 1;
    setConsecutiveLikes(prev => ({ ...prev, [reporteId]: newCount }));
    if (newCount % 3 === 0 && !liked[reporteId]) {
      setShowConfetti(prev => ({ ...prev, [reporteId]: true }));
      setTimeout(() => setShowConfetti(prev => ({ ...prev, [reporteId]: false })), 1500);
    }
    setAnimating(prev => ({ ...prev, [reporteId]: true }));
    setTimeout(() => setAnimating(prev => ({ ...prev, [reporteId]: false })), 300);
    const newLiked = !liked[reporteId];
    const newTotal = newLiked ? (likes[reporteId] || 0) + 1 : (likes[reporteId] || 0) - 1;
    setLiked(prev => ({ ...prev, [reporteId]: newLiked }));
    setLikes(prev => ({ ...prev, [reporteId]: newTotal }));
    try {
      const response = await api.post('/api/likes/toggle', { reporteId, usuario: usuarioActual });
      if (response.data.success) {
        setLiked(prev => ({ ...prev, [reporteId]: response.data.liked }));
        setLikes(prev => ({ ...prev, [reporteId]: response.data.total }));
      }
    } catch (error) {
      setLiked(prev => ({ ...prev, [reporteId]: !newLiked }));
      setLikes(prev => ({ ...prev, [reporteId]: !newLiked ? newTotal + 1 : newTotal - 1 }));
    }
  };

  const getLikeIcon = (id) => liked[id] ? <HeartFill className="text-danger" size={18} /> : <Heart size={18} />;
  const getLikeText = (id) => {
    const count = likes[id] || 0;
    if (count === 0) return "Me gusta";
    if (count === 1) return "1 persona le gusta esto";
    return `${count} personas les gusta esto`;
  };

  // Comentarios
  const cargarComentarios = async (reporteId) => {
    if (comentarios[reporteId]) return;
    setCargandoComentarios(prev => ({ ...prev, [reporteId]: true }));
    try {
      const response = await api.get(`/api/comentarios/${reporteId}`);
      setComentarios(prev => ({ ...prev, [reporteId]: response.data || [] }));
    } catch (error) {
      setComentarios(prev => ({ ...prev, [reporteId]: [] }));
    } finally {
      setCargandoComentarios(prev => ({ ...prev, [reporteId]: false }));
    }
  };

  const handleToggleComments = async (reporteId) => {
    const newState = !showComments[reporteId];
    setShowComments(prev => ({ ...prev, [reporteId]: newState }));
    if (newState && !comentarios[reporteId]) await cargarComentarios(reporteId);
  };

  const handleAddComentario = async (reporteId) => {
    const texto = nuevoComentario[reporteId];
    if (!texto?.trim()) return;
    if (!usuarioActual) return alert('Debes iniciar sesión para comentar');
    setEnviandoComentario(prev => ({ ...prev, [reporteId]: true }));
    try {
      const response = await api.post('/api/comentarios', { reporteId, usuario: usuarioActual, texto: texto.trim() });
      if (response.data.success) {
        setComentarios(prev => ({ ...prev, [reporteId]: [response.data.comentario, ...(prev[reporteId] || [])] }));
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
      await api.post(`/api/comentarios/${comentarioId}/like`);
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
      console.error('Error al dar like a comentario:', error);
    }
  };

  // Respuestas
  const handleToggleReply = async (comentarioId) => {
    const newState = !showReplyInput[comentarioId];
    setShowReplyInput(prev => ({ ...prev, [comentarioId]: newState }));
    if (newState && !respuestas[comentarioId]) await cargarRespuestas(comentarioId);
  };

  const handleAddRespuesta = async (comentarioId) => {
    const texto = nuevaRespuesta[comentarioId];
    if (!texto?.trim()) return;
    if (!usuarioActual) return alert('Debes iniciar sesión para responder');
    setEnviandoRespuesta(prev => ({ ...prev, [comentarioId]: true }));
    try {
      const response = await api.post('/api/respuestas', { comentarioId, usuario: usuarioActual, texto: texto.trim() });
      if (response.data.success) {
        setRespuestas(prev => ({ ...prev, [comentarioId]: [...(prev[comentarioId] || []), response.data.respuesta] }));
        setNuevaRespuesta(prev => ({ ...prev, [comentarioId]: '' }));
        setShowReplyInput(prev => ({ ...prev, [comentarioId]: false }));
      }
    } catch (error) {
      console.error('Error al responder:', error);
    } finally {
      setEnviandoRespuesta(prev => ({ ...prev, [comentarioId]: false }));
    }
  };

  const handleLikeRespuesta = async (respuestaId) => {
    try {
      await api.post(`/api/respuestas/${respuestaId}/like`);
      setRespuestas(prev => {
        const newRespuestas = { ...prev };
        for (const comId in newRespuestas) {
          newRespuestas[comId] = newRespuestas[comId].map(res =>
            res.id === respuestaId ? { ...res, likes: (res.likes || 0) + 1 } : res
          );
        }
        return newRespuestas;
      });
    } catch (error) {
      console.error('Error al dar like a respuesta:', error);
    }
  };

  // Compartir
  const handleToggleShare = (id) => setShowShare(prev => ({ ...prev, [id]: !prev[id] }));
  
  const handleCopyLink = async (reporteId) => {
    const link = `${window.location.origin}/reporte/${reporteId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(prev => ({ ...prev, [reporteId]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [reporteId]: false })), 2000);
    } catch (err) { console.error('Error:', err); }
  };
  
  const handleShareToFacebook = (reporteId) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/reporte/${reporteId}`)}`, '_blank');
  const handleShareToTwitter = (reporteId, reporte) => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`📸 Reporte: ${reporte?.problema?.substring(0, 100)}`)}&url=${encodeURIComponent(`${window.location.origin}/reporte/${reporteId}`)}`, '_blank');
  const handleShareToEmail = (reporteId, reporte) => window.location.href = `mailto:?subject=${encodeURIComponent(`Reporte #${reporteId}`)}&body=${encodeURIComponent(`Hola,\n\nTe comparto este reporte:\n\nProblema: ${reporte?.problema}\nUbicación: ${reporte?.modulo}\nUrgencia: ${reporte?.urgencia}\n\nVer más en: ${window.location.origin}/reporte/${reporteId}`)}`;

  // Eliminar reporte
  const handleEliminarClick = (reporte) => {
    setReporteAEliminar(reporte);
    setShowDeleteModal(true);
  };

  const confirmarEliminar = async () => {
    if (!reporteAEliminar) return;
    
    try {
      // Eliminar el reporte (también eliminará comentarios y likes por CASCADE)
      await api.delete(`/api/reportes/${reporteAEliminar.id}`);
      
      // Mostrar mensaje de éxito
      alert('✅ Reporte eliminado correctamente');
      
      // Recargar la lista de reportes
      if (onReporteEliminado) {
        onReporteEliminado();
      }
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      alert('❌ Error al eliminar el reporte');
    } finally {
      setShowDeleteModal(false);
      setReporteAEliminar(null);
    }
  };

  const handleVerImagen = (reporte) => {
    setImagenSeleccionada(reporte);
    setShowImageModal(prev => ({ ...prev, [reporte.id]: true }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'recientemente';
    const date = new Date(dateString);
    const diff = Math.floor((new Date() - date) / 1000 / 60);
    if (diff < 1) return 'ahora mismo';
    if (diff < 60) return `hace ${diff} minutos`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)} horas`;
    return date.toLocaleDateString();
  };

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

  if (cargandoLikes && reportes.length > 0) {
    return <div className="text-center py-5"><div className="spinner"></div><p className="mt-3 text-muted">Cargando interacciones...</p></div>;
  }

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
          <Confetti active={showConfetti[reporte.id]} onComplete={() => setShowConfetti(prev => ({ ...prev, [reporte.id]: false }))} />

          {/* Header */}
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
              
              {/* Solo mostrar el menú si el usuario es el dueño del reporte */}
              {usuarioActual === reporte.usuario && (
                <Dropdown>
                  <Dropdown.Toggle as={Button} variant="link" className="text-dark p-1"><ThreeDots /></Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => handleEliminarClick(reporte)} className="text-danger">
                      <Trash className="me-2" /> Eliminar reporte
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </Card.Body>

          {/* Contenido */}
          <Card.Body className="pt-0 pb-2">
            <div className="mb-2">
              <Badge bg={getCategoriaBadge(reporte.categoria)} pill className="me-2">🏷️ {reporte.categoria}</Badge>
              <Badge bg={getBadgeVariant(reporte.urgencia)} pill>⚠️ Urgencia {reporte.urgencia}</Badge>
            </div>
            <p className="mb-2">{reporte.problema}</p>
            {reporte.imagen && <ReporteImagen imagen={reporte.imagen} problema={reporte.problema} onClick={() => handleVerImagen(reporte)} />}
          </Card.Body>

          {/* Interacciones */}
          <Card.Body className="pt-0 pb-2 border-top">
            <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }} onClick={() => handleLike(reporte.id)}>
                  {liked[reporte.id] ? <HeartFill className="text-danger" size={14} /> : <Heart size={14} className="text-muted" />}
                  <span>{getLikeText(reporte.id)}</span>
                </div>
                <div className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }} onClick={() => handleToggleComments(reporte.id)}>
                  <Chat size={14} />
                  <span>{comentarios[reporte.id]?.length || 0} comentarios</span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-around pt-2 border-top">
              <Button variant="link" className={`text-decoration-none d-flex align-items-center gap-2 like-button ${liked[reporte.id] ? 'liked' : ''}`} onClick={() => handleLike(reporte.id)}>
                <span className={`like-icon ${animating[reporte.id] ? 'animate-like' : ''}`}>{getLikeIcon(reporte.id)}</span>
                <span className={liked[reporte.id] ? 'text-primary fw-bold' : 'text-muted'}>Me gusta</span>
              </Button>
              <Button variant="link" className="text-muted text-decoration-none d-flex align-items-center gap-2" onClick={() => handleToggleComments(reporte.id)}>
                <Chat size={18} /> Comentar
              </Button>
              <Button variant="link" className="text-muted text-decoration-none d-flex align-items-center gap-2" onClick={() => handleToggleShare(reporte.id)}>
                <Share size={18} /> Compartir
              </Button>
            </div>

            {/* Sección de comentarios con respuestas */}
            {showComments[reporte.id] && (
              <div className="mt-3 pt-2 border-top">
                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cargandoComentarios[reporte.id] ? (
                    <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                  ) : comentarios[reporte.id]?.length === 0 ? (
                    <div className="text-center text-muted py-3 small">No hay comentarios aún. ¡Sé el primero en comentar!</div>
                  ) : (
                    comentarios[reporte.id]?.map((com) => (
                      <div key={com.id} className="comentario-item d-flex mb-3">
                        <div className="comentario-avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {com.usuario?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="comentario-content bg-light rounded-3 p-2 flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="fw-bold small">{com.usuario}</span>
                            <small className="text-muted">{formatDate(com.fecha)}</small>
                          </div>
                          <p className="small mb-1">{com.texto}</p>
                          <div className="d-flex gap-2">
                            <button className="btn btn-link btn-sm text-muted text-decoration-none p-0 small" onClick={() => handleLikeComentario(com.id)}>
                              {com.likes > 0 ? `❤️ ${com.likes}` : '❤️ Me gusta'}
                            </button>
                            <button className="btn btn-link btn-sm text-muted text-decoration-none p-0 small" onClick={() => handleToggleReply(com.id)}>
                              <Reply size={12} /> Responder
                            </button>
                          </div>

                          {/* Respuestas */}
                          {respuestas[com.id]?.length > 0 && (
                            <div className="mt-2">
                              {respuestas[com.id].map((res) => (
                                <div key={res.id} className="d-flex mt-2 ms-4">
                                  <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '28px', height: '28px', fontSize: '10px' }}>
                                    {res.usuario?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                  <div className="bg-light rounded-3 p-2 flex-grow-1" style={{ backgroundColor: '#e8e8e8' }}>
                                    <div className="d-flex justify-content-between align-items-start">
                                      <span className="fw-bold small">{res.usuario}</span>
                                      <small className="text-muted">{formatDate(res.fecha)}</small>
                                    </div>
                                    <p className="small mb-1">{res.texto}</p>
                                    <button className="btn btn-link btn-sm text-muted text-decoration-none p-0 small" onClick={() => handleLikeRespuesta(res.id)}>
                                      {res.likes > 0 ? `❤️ ${res.likes}` : '❤️ Me gusta'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Input para responder */}
                          {showReplyInput[com.id] && (
                            <div className="mt-2 d-flex gap-2">
                              <input type="text" className="form-control form-control-sm" placeholder="Escribe una respuesta..." value={nuevaRespuesta[com.id] || ''} onChange={(e) => setNuevaRespuesta(prev => ({ ...prev, [com.id]: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && handleAddRespuesta(com.id)} />
                              <button className="btn btn-primary btn-sm" onClick={() => handleAddRespuesta(com.id)} disabled={enviandoRespuesta[com.id] || !nuevaRespuesta[com.id]?.trim()}>
                                {enviandoRespuesta[com.id] ? <Spinner animation="border" size="sm" /> : <Send size={14} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input para nuevo comentario */}
                <div className="d-flex gap-2">
                  <input type="text" className="form-control" placeholder={usuarioActual ? "Escribe un comentario..." : "Inicia sesión para comentar"} value={nuevoComentario[reporte.id] || ''} onChange={(e) => setNuevoComentario(prev => ({ ...prev, [reporte.id]: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && usuarioActual && handleAddComentario(reporte.id)} disabled={!usuarioActual} />
                  <button className="btn btn-primary" onClick={() => handleAddComentario(reporte.id)} disabled={enviandoComentario[reporte.id] || !nuevoComentario[reporte.id]?.trim() || !usuarioActual}>
                    {enviandoComentario[reporte.id] ? <Spinner animation="border" size="sm" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Modal para compartir */}
            <Modal show={showShare[reporte.id]} onHide={() => handleToggleShare(reporte.id)} centered>
              <Modal.Header closeButton className="border-0 pb-0"><Modal.Title>Compartir reporte</Modal.Title></Modal.Header>
              <Modal.Body className="pt-0">
                <p className="text-muted small mb-3">Comparte este reporte con otras personas</p>
                <div className="d-flex gap-3 mb-4 justify-content-center">
                  <button className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }} onClick={() => handleShareToFacebook(reporte.id)}><Facebook size={24} /></button>
                  <button className="btn btn-info rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '48px', height: '48px' }} onClick={() => handleShareToTwitter(reporte.id, reporte)}><Twitter size={24} /></button>
                  <button className="btn btn-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }} onClick={() => handleShareToEmail(reporte.id, reporte)}><Envelope size={24} /></button>
                </div>
                <div className="border rounded-3 p-2 bg-light d-flex align-items-center gap-2">
                  <Link45deg className="text-muted" />
                  <input type="text" className="form-control form-control-sm bg-light border-0" value={`${window.location.origin}/reporte/${reporte.id}`} readOnly />
                  <button className={`btn btn-sm ${copied[reporte.id] ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => handleCopyLink(reporte.id)}>{copied[reporte.id] ? <Check2 size={14} /> : 'Copiar'}</button>
                </div>
              </Modal.Body>
            </Modal>
          </Card.Body>
        </Card>
      ))}

      {/* Modal para ver imagen */}
      <Modal show={imagenSeleccionada && showImageModal[imagenSeleccionada?.id]} onHide={() => { if (imagenSeleccionada) { setShowImageModal(prev => ({ ...prev, [imagenSeleccionada.id]: false })); setTimeout(() => setImagenSeleccionada(null), 300); } }} centered size="lg" className="image-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>{imagenSeleccionada?.usuario?.charAt(0).toUpperCase() || 'U'}</div>
              <div><div className="fw-bold">{imagenSeleccionada?.usuario}</div><small className="text-muted">{imagenSeleccionada?.modulo}</small></div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 text-center">
          <img src={imagenSeleccionada?.imagen} alt="Evidencia" className="img-fluid rounded-3" style={{ maxHeight: '70vh', objectFit: 'contain' }} onError={(e) => e.target.src = 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'} />
          <div className="mt-3 text-start"><p><strong>Problema:</strong> {imagenSeleccionada?.problema}</p><p><strong>Urgencia:</strong> {imagenSeleccionada?.urgencia}</p><p><strong>Categoría:</strong> {imagenSeleccionada?.categoria}</p></div>
        </Modal.Body>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">⚠️ Eliminar reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <p>¿Estás seguro de que quieres eliminar este reporte?</p>
          <p className="text-muted small">Esta acción no se puede deshacer y eliminará también todos los comentarios y likes asociados.</p>
          {reporteAEliminar && (
            <div className="bg-light p-2 rounded-3 mt-2">
              <small><strong>Reporte:</strong> {reporteAEliminar.problema?.substring(0, 100)}</small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminar}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ReportesList;