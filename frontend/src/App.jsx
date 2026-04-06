import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Navbar, Nav, Button, Tab, Tabs, Spinner, Badge } from 'react-bootstrap';
import { Camera, List, Person, BoxArrowRight, CheckCircle, ExclamationTriangle, InfoCircle, House } from 'react-bootstrap-icons';
import api from './services/api';
import Login from './components/login';
import Registro from './components/registro';
import ReporteForm from './components/reporteform';
import ReportesList from './components/ReportesList';
import MenuLateral from './components/MenuLateral';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [serverStatus, setServerStatus] = useState('offline');
  const [activeTab, setActiveTab] = useState('login');
  const [cargandoReportes, setCargandoReportes] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio'); // Controla qué mostrar

  useEffect(() => {
    verificarServidor();
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      setUsuario(savedUser);
      setActiveSection('inicio');
    }
  }, []);

  useEffect(() => {
    if (usuario) cargarReportes();
  }, [usuario]);

  const verificarServidor = async () => {
    try {
      await api.get('/api/test');
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const cargarReportes = async () => {
    setCargandoReportes(true);
    try {
      const response = await api.get('/reportes');
      setReportes(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargandoReportes(false);
    }
  };

  const mostrarAlerta = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleLogin = (user) => {
    setUsuario(user);
    localStorage.setItem('usuario', user);
    setActiveSection('inicio');
    mostrarAlerta(`✅ Bienvenido ${user}`, 'success');
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setReportes([]);
    setActiveSection('inicio');
    mostrarAlerta('👋 Sesión cerrada', 'info');
  };

  const ServerStatusBadge = () => (
    <Badge 
      bg={serverStatus === 'online' ? 'success' : 'danger'} 
      className="ms-2"
      style={{ fontSize: '0.7rem' }}
    >
      {serverStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
    </Badge>
  );

  const AlertMessage = () => {
    if (!alert.show) return null;
    const variant = alert.type === 'success' ? 'success' : alert.type === 'error' ? 'danger' : 'info';
    const icon = alert.type === 'success' ? <CheckCircle /> : alert.type === 'error' ? <ExclamationTriangle /> : <InfoCircle />;
    return (
      <Alert variant={variant} onClose={() => setAlert({ ...alert, show: false })} dismissible className="mb-4">
        <div className="d-flex align-items-center gap-2">
          {icon}
          <span>{alert.message}</span>
        </div>
      </Alert>
    );
  };

  // Renderizar según la sección activa
  const renderContent = () => {
    switch(activeSection) {
      case 'inicio':
        return (
          <div className="text-center py-5">
            <House size={64} className="text-primary mb-3" />
            <h2>Bienvenido, {usuario}!</h2>
            <p className="text-muted">Selecciona una opción del menú para comenzar</p>
            <div className="row g-3 mt-4 justify-content-center">
              <div className="col-md-4">
                <Card className="h-100 shadow-sm border-0" style={{ cursor: 'pointer' }} onClick={() => setActiveSection('crear')}>
                  <Card.Body className="text-center">
                    <Camera size={40} className="text-primary mb-2" />
                    <h5>Hacer Reporte</h5>
                    <small className="text-muted">Reporta un nuevo problema</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="h-100 shadow-sm border-0" style={{ cursor: 'pointer' }} onClick={() => setActiveSection('ver')}>
                  <Card.Body className="text-center">
                    <List size={40} className="text-primary mb-2" />
                    <h5>Ver Reportes</h5>
                    <small className="text-muted">Consulta todos los reportes</small>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'crear':
        return (
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-4">
                <Camera className="me-2 text-primary" /> Hacer Reporte
              </Card.Title>
              <ReporteForm usuario={usuario} onReporteCreado={cargarReportes} mostrarAlerta={mostrarAlerta} />
            </Card.Body>
          </Card>
        );
      case 'ver':
        return (
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-4">
                <List className="me-2 text-primary" /> Ver Reportes
              </Card.Title>
              {cargandoReportes ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando reportes...</p>
                </div>
              ) : (
                <ReportesList reportes={reportes} usuarioActual={usuario} />
              )}
            </Card.Body>
          </Card>
        );
      default:
        return null;
    }
  };

  // Si NO hay usuario logueado, mostrar login/registro
  if (!usuario) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '20px 0' }}>
        <Container>
          <Navbar bg="white" expand="lg" className="mb-4 rounded-3 shadow-sm">
            <Container fluid>
              <Navbar.Brand className="fw-bold text-primary">
                <Camera className="me-2" /> Reportes IA
                <ServerStatusBadge />
              </Navbar.Brand>
            </Container>
          </Navbar>

          <div className="text-center text-white mb-5">
            <h1 className="display-4 fw-bold">📸 Sistema de Reportes con IA</h1>
            <p className="lead">Sube una imagen y la IA analizará el problema automáticamente</p>
          </div>

          <AlertMessage />

          <Row className="justify-content-center">
            <Col lg={6} md={8}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="mb-4">
                    <Person className="me-2 text-primary" /> Acceso al Sistema
                  </Card.Title>
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                    fill
                  >
                    <Tab eventKey="login" title="Login">
                      <Login onLogin={handleLogin} mostrarAlerta={mostrarAlerta} />
                    </Tab>
                    <Tab eventKey="registro" title="Registro">
                      <Registro mostrarAlerta={mostrarAlerta} onRegistroExitoso={() => setActiveTab('login')} />
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Si HAY usuario logueado, mostrar con menú lateral
  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Barra superior */}
      <Navbar bg="white" expand="lg" className="shadow-sm px-3 py-2" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <Container fluid>
          <Navbar.Brand className="fw-bold text-primary">
            <Camera className="me-2" /> Reportes IA
            <ServerStatusBadge />
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">👤 {usuario}</span>
          </div>
        </Container>
      </Navbar>

      <AlertMessage />

      <Container fluid>
        <Row>
          {/* Menú lateral */}
          <MenuLateral 
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            usuario={usuario}
            onLogout={handleLogout}
          />

          {/* Contenido principal */}
          <Col md={9} className="p-4">
            {renderContent()}
            <footer className="text-center text-muted mt-5 pt-3">
              <small>Sistema de Reportes con IA v1.0 | {reportes.length} reporte{reportes.length !== 1 ? 's' : ''} en total</small>
            </footer>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;