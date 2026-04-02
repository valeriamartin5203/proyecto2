import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { ArrowLeft, Heart, HeartFill, Send, Facebook, Twitter, Envelope, Link45deg, Check2 } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ReporteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    cargarReporte();
    cargarDatosLocales();
  }, [id]);

  const cargarReporte = async () => {
    try {
      const response = await api.get(`/reportes/${id}`);
      setReporte(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosLocales = () => {
    const savedLikes = localStorage.getItem(`reporte_${id}_likes`);
    const savedLiked = localStorage.getItem(`reporte_${id}_liked`);
    const savedComentarios = localStorage.getItem(`reporte_${id}_comentarios`);
    
    if (savedLikes) setLikes(parseInt(savedLikes));
    if (savedLiked) setLiked(savedLiked === 'true');
    if (savedComentarios) setComentarios(JSON.parse(savedComentarios));
  };

  const handleLike = () => {
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;
    
    setLiked(newLiked);
    setLikes(newLikes);
    
    localStorage.setItem(`reporte_${id}_likes`, newLikes);
    localStorage.setItem(`reporte_${id}_liked`, newLiked);
  };

  const handleAddComentario = () => {
    if (!nuevoComentario.trim()) return;
    
    const nuevoCom = {
      id: Date.now(),
      usuario: localStorage.getItem('usuario') || 'Usuario',
      texto: nuevoComentario,
      fecha: new Date().toISOString()
    };
    
    const nuevosComentarios = [...comentarios, nuevoCom];
    setComentarios(nuevosComentarios);
    localStorage.setItem(`reporte_${id}_comentarios`, JSON.stringify(nuevosComentarios));
    setNuevoComentario('');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = encodeURIComponent(`📸 Reporte: ${reporte?.problema}`);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=Reporte%20#${id}&body=${text}%0A${encodeURIComponent(url)}`
    };
    
    window.open(shareUrls[platform], '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="text-center py-5">
        <h5>Reporte no encontrado</h5>
        <Button onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="link" className="text-decoration-none mb-3" onClick={() => navigate('/')}>
        <ArrowLeft /> Volver
      </Button>
      
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="mb-2">Reporte #{reporte.id}</h2>
              <p className="text-muted">Por {reporte.usuario} • {reporte.modulo}</p>
            </div>
            <div>
              <Badge bg={reporte.urgencia === 'Alta' ? 'danger' : reporte.urgencia === 'Media' ? 'warning' : 'success'} pill>
                Urgencia {reporte.urgencia}
              </Badge>
            </div>
          </div>
          
          <div className="mb-4">
            <Badge bg="secondary" pill className="me-2">
              🏷️ {reporte.categoria}
            </Badge>
          </div>
          
          <p className="lead mb-4">{reporte.problema}</p>
          
          <div className="border-top pt-3 mb-4">
            <div className="d-flex gap-3">
              <Button variant="link" className="text-decoration-none" onClick={handleLike}>
                {liked ? <HeartFill className="text-danger me-2" /> : <Heart className="me-2" />}
                {likes} Me gusta
              </Button>
            </div>
          </div>
          
          <div className="border-top pt-3">
            <h6 className="mb-3">Comentarios ({comentarios.length})</h6>
            
            <div className="mb-3">
              <InputGroup>
                <Form.Control
                  placeholder="Escribe un comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComentario()}
                />
                <Button variant="primary" onClick={handleAddComentario}>
                  <Send />
                </Button>
              </InputGroup>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {comentarios.map((com) => (
                <div key={com.id} className="d-flex mb-3">
                  <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                    {com.usuario?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-light rounded-3 p-2 flex-grow-1">
                    <div className="fw-bold small">{com.usuario}</div>
                    <p className="small mb-0">{com.texto}</p>
                    <small className="text-muted">{new Date(com.fecha).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-top pt-3 mt-3">
            <h6 className="mb-3">Compartir</h6>
            <div className="d-flex gap-2">
              <Button variant="primary" size="sm" onClick={() => handleShare('facebook')}>
                <Facebook /> Facebook
              </Button>
              <Button variant="info" size="sm" className="text-white" onClick={() => handleShare('twitter')}>
                <Twitter /> Twitter
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleShare('email')}>
                <Envelope /> Email
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleCopyLink}>
                {copied ? <Check2 /> : <Link45deg />} {copied ? 'Copiado' : 'Copiar enlace'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ReporteDetalle;