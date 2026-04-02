import React, { useState, useEffect } from 'react';
import { Card, Badge, Dropdown, Button } from 'react-bootstrap';
import { Person, Chat, Share, ThreeDots, Heart, HeartFill } from 'react-bootstrap-icons';
import Confetti from './Confetti';

function ReportesList({ reportes }) {
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});
  const [animating, setAnimating] = useState({});
  const [showConfetti, setShowConfetti] = useState({});
  const [consecutiveLikes, setConsecutiveLikes] = useState({});

  // Cargar likes desde localStorage al iniciar
  useEffect(() => {
    const savedLikes = localStorage.getItem('reportesLikes');
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes));
    }
    const savedLiked = localStorage.getItem('reportesLiked');
    if (savedLiked) {
      setLiked(JSON.parse(savedLiked));
    }
  }, []);

  // Guardar likes en localStorage cuando cambien
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

  const handleLike = (id) => {
    // Contar likes consecutivos para confeti
    const newCount = (consecutiveLikes[id] || 0) + 1;
    setConsecutiveLikes(prev => ({ ...prev, [id]: newCount }));
    
    // Mostrar confeti cada 5 likes consecutivos o en el primer like
    if (newCount % 5 === 0 && !liked[id]) {
      setShowConfetti(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setShowConfetti(prev => ({ ...prev, [id]: false })), 1000);
    }
    
    // Animación de "pop"
    setAnimating(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAnimating(prev => ({ ...prev, [id]: false })), 300);

    if (liked[id]) {
      // Quitar like
      setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
      setLiked(prev => ({ ...prev, [id]: false }));
    } else {
      // Agregar like
      setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setLiked(prev => ({ ...prev, [id]: true }));
    }
  };

  const getLikeIcon = (id) => {
    if (liked[id]) {
      return <HeartFill className="text-danger" size={18} />;
    }
    return <Heart size={18} />;
  };

  const getLikeText = (id) => {
    const count = likes[id] || 0;
    if (count === 0) return "Me gusta";
    if (count === 1) return "1 persona le gusta esto";
    return `${count} personas les gusta esto`;
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
          {/* Confetti */}
          <Confetti active={showConfetti[reporte.id]} onComplete={() => setShowConfetti(prev => ({ ...prev, [reporte.id]: false }))} />
          
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
                    <span>{new Date().toLocaleDateString()}</span>
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

          {/* Interacciones estilo Facebook */}
          <Card.Body className="pt-0 pb-2 border-top">
            <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
              <div className="d-flex align-items-center gap-1">
                <div className="d-flex align-items-center">
                  {liked[reporte.id] ? (
                    <HeartFill className="text-danger" size={14} />
                  ) : (
                    <Heart size={14} className="text-muted" />
                  )}
                  <span className="ms-1">{getLikeText(reporte.id)}</span>
                </div>
              </div>
              <div>0 comentarios • 0 veces compartido</div>
            </div>
            
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
              
              <Button variant="link" className="text-muted text-decoration-none d-flex align-items-center gap-2">
                <Chat size={18} /> Comentar
              </Button>
              
              <Button variant="link" className="text-muted text-decoration-none d-flex align-items-center gap-2">
                <Share size={18} /> Compartir
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default ReportesList;