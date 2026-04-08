import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Navbar, Button, Tab, Tabs, Spinner, Badge } from 'react-bootstrap';
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
  const [activeSection, setActiveSection] = useState('inicio');

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
                <Card className="card-custom cursor-pointer" onClick={() => setActiveSection('crear')}>
                  <Card.Body className="text-center">
                    <Camera size={40} className="text-primary mb-2" />
                    <h5>Hacer Reporte</h5>
                    <small className="text-muted">Reporta un nuevo problema</small>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="card-custom cursor-pointer" onClick={() => setActiveSection('ver')}>
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
          <Card className="card-custom">
            <Card.Body>
              <h4 className="card-title-custom">
                <Camera className="me-2" /> Hacer Reporte
              </h4>
              <ReporteForm usuario={usuario} onReporteCreado={cargarReportes} mostrarAlerta={mostrarAlerta} />
            </Card.Body>
          </Card>
        );
      case 'ver':
        return (
          <Card className="card-custom">
            <Card.Body>
              <h4 className="card-title-custom">
                <List className="me-2" /> Ver Reportes
              </h4>
              {cargandoReportes ? (
                <div className="spinner-container">
                  <div className="spinner"></div>
                  <p className="mt-3 text-muted">Cargando reportes...</p>
                </div>
              ) : (
                <ReportesList 
                  reportes={reportes} 
                  usuarioActual={usuario}
                  onReporteEliminado={cargarReportes}
                />
              )}
            </Card.Body>
          </Card>
        );
      default:
        return null;
    }
  };

  // Pantalla de login/registro
  if (!usuario) {
    return (
      <div className="login-container">
        <Container className="login-content">
          <Navbar bg="white" expand="lg" className="navbar-custom">
            <Container fluid>
              <Navbar.Brand className="navbar-brand-custom">
                <Camera className="me-2" /> Reportes IA
                <ServerStatusBadge />
              </Navbar.Brand>
            </Container>
          </Navbar>

          <div className="header-title">
            <h1>📸 Sistema de Reportes con IA</h1>
            <p>Sube una imagen y la IA analizará el problema automáticamente</p>
          </div>

          <AlertMessage />

          <Row className="justify-content-center">
            <Col lg={6} md={8}>
              <Card className="card-login">
                <Card.Body>
                  <h4 className="card-title-custom justify-content-center">
                    <Person className="me-2" /> Acceso al Sistema
                  </h4>
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

          <footer className="footer">
            <small>© 2026 Reportes IA - Todos los derechos reservados</small>
          </footer>
        </Container>
      </div>
    );
  }

  // Pantalla principal después de login
  return (
    <div className="main-container">
      <div className="sticky-navbar">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <div className="navbar-brand-custom">
              <Camera className="me-2" /> Reportes IA
              <ServerStatusBadge />
            </div>
            <div className="navbar-user">
              <span className="user-name">👤 {usuario}</span>
            </div>
          </div>
        </Container>
      </div>

      <AlertMessage />

      <Container fluid>
        <div className="row">
          <div className="col-md-3 col-lg-2 p-0">
            <MenuLateral 
              activeSection={activeSection}
              onSelectSection={setActiveSection}
              usuario={usuario}
              onLogout={handleLogout}
            />
          </div>

          <div className="col-md-9 col-lg-10 p-4">
            {renderContent()}
            <footer className="footer footer-light mt-5 pt-3">
              <small>Reportes IA v1.0 | {reportes.length} reporte{reportes.length !== 1 ? 's' : ''} en total</small>
            </footer>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;