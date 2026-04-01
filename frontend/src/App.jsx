import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Navbar, Nav, Button, Tab, Tabs, Spinner, Badge } from 'react-bootstrap';
import { Camera, List, Person, BoxArrowRight, CheckCircle, ExclamationTriangle, InfoCircle } from 'react-bootstrap-icons';
import api from './services/api';
import Login from './components/login';
import Registro from './components/registro';
import ReporteForm from './components/reporteform';
import ReportesList from './components/ReportesList';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [serverStatus, setServerStatus] = useState('offline');
  const [activeTab, setActiveTab] = useState('login');
  const [cargandoReportes, setCargandoReportes] = useState(false);

  useEffect(() => {
    verificarServidor();
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) setUsuario(savedUser);
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
    mostrarAlerta(`✅ Bienvenido ${user}`, 'success');
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setReportes([]);
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

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '20px 0' }}>
      <Container>
        {/* Navbar */}
        <Navbar bg="white" expand="lg" className="mb-4 rounded-3 shadow-sm">
          <Container fluid>
            <Navbar.Brand className="fw-bold text-primary">
              <Camera className="me-2" /> Reportes IA
              <ServerStatusBadge />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                {usuario && (
                  <>
                    <Nav.Item className="d-flex align-items-center me-3">
                      <Person className="me-1" /> <span className="fw-semibold">{usuario}</span>
                    </Nav.Item>
                    <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                      <BoxArrowRight className="me-1" /> Salir
                    </Button>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Header */}
        <div className="text-center text-white mb-5">
          <h1 className="display-4 fw-bold">📸 Sistema de Reportes con IA</h1>
          <p className="lead">Sube una imagen y la IA analizará el problema automáticamente</p>
        </div>

        {/* Alertas */}
        <AlertMessage />

        {/* Grid principal */}
        <Row className="g-4">
          {/* Columna izquierda */}
          <Col lg={6} md={12}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                {!usuario ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Card.Title className="mb-4">
                      <Camera className="me-2 text-primary" /> Nuevo Reporte
                    </Card.Title>
                    <ReporteForm usuario={usuario} onReporteCreado={cargarReportes} mostrarAlerta={mostrarAlerta} />
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Columna derecha */}
          <Col lg={6} md={12}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-4">
                  <List className="me-2 text-primary" /> Reportes Recientes
                </Card.Title>
                {!usuario ? (
                  <div className="text-center text-muted py-5">
                    <List size={48} className="mb-3 text-secondary" />
                    <p>🔒 Inicia sesión para ver los reportes</p>
                    <small>Podrás ver todos los reportes creados</small>
                  </div>
                ) : cargandoReportes ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Cargando reportes...</p>
                  </div>
                ) : (
                  <ReportesList reportes={reportes} />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <footer className="text-center text-white mt-5 pt-3">
          <small>Sistema de Reportes con IA v1.0 | {reportes.length} reporte{reportes.length !== 1 ? 's' : ''} en total</small>
        </footer>
      </Container>
    </div>
  );
}

export default App;