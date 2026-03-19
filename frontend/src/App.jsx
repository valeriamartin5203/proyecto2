import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCamera, FiList, FiLogIn, FiUserPlus } from 'react-icons/fi';
import Login from './components/login';
import Registro from './components/registro';
import ReporteForm from './components/reporteform';
import ReportesList from './components/ReportesList';
import Navbar from './components/Navbar';
import './App.css';

// URL de la API según el entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    if (savedUser) {
      setUsuario(savedUser);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarReportes();
    }
  }, [usuario]);

  const verificarServidor = async () => {
    try {
      await axios.get(`${API_URL}/`);
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const cargarReportes = async () => {
    setCargandoReportes(true);
    try {
      const response = await axios.get(`${API_URL}/reportes`);
      setReportes(response.data || []);
    } catch (error) {
      console.error('Error cargando reportes:', error);
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

  return (
    <div className="container">
      <Navbar 
        usuario={usuario} 
        onLogout={handleLogout}
        serverStatus={serverStatus}
      />

      {alert.show && (
        <div className={`alert ${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="header">
        <h1>📸 Sistema de Reportes con IA</h1>
        <p>Sube una imagen y la IA analizará el problema automáticamente</p>
      </div>

      <div className="grid">
        <div className="card">
          {!usuario ? (
            <>
              <h2><FiLogIn /> Acceso al Sistema</h2>
              <div className="tabs">
                <div 
                  className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </div>
                <div 
                  className={`tab ${activeTab === 'registro' ? 'active' : ''}`}
                  onClick={() => setActiveTab('registro')}
                >
                  Registro
                </div>
              </div>

              {activeTab === 'login' ? (
                <Login 
                  API_URL={API_URL} 
                  onLogin={handleLogin}
                  mostrarAlerta={mostrarAlerta}
                />
              ) : (
                <Registro 
                  API_URL={API_URL}
                  mostrarAlerta={mostrarAlerta}
                  onRegistroExitoso={() => setActiveTab('login')}
                />
              )}
            </>
          ) : (
            <>
              <h2><FiCamera /> Nuevo Reporte</h2>
              <ReporteForm 
                API_URL={API_URL}
                usuario={usuario}
                onReporteCreado={cargarReportes}
                mostrarAlerta={mostrarAlerta}
              />
            </>
          )}
        </div>

        <div className="card">
          <h2><FiList /> Reportes Recientes</h2>
          
          {!usuario ? (
            <div className="empty-state">
              <FiList style={{ fontSize: '3em', color: '#cbd5e0' }} />
              <p>🔒 Inicia sesión para ver los reportes</p>
            </div>
          ) : cargandoReportes ? (
            <div className="text-center p-4">
              <div className="loading"></div>
              <p>Cargando...</p>
            </div>
          ) : (
            <ReportesList reportes={reportes} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;