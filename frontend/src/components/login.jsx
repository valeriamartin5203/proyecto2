import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Person, Key } from 'react-bootstrap-icons';
import api from '../services/api';

function Login({ onLogin, mostrarAlerta }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuario || !password) {
      mostrarAlerta('Completa todos los campos', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/login', { usuario, password });

      if (response.data.success) {
        onLogin(usuario);
      } else {
        mostrarAlerta(response.data.mensaje, 'error');
      }
    } catch (error) {
      mostrarAlerta('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Usuario</Form.Label>
        <div className="position-relative">
          <Person className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <Form.Control
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Ingresa tu usuario"
            disabled={loading}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </Form.Group>
      
      <Form.Group className="mb-4">
        <Form.Label>Contraseña</Form.Label>
        <div className="position-relative">
          <Key className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            disabled={loading}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </Form.Group>
      
      <Button 
        type="submit" 
        variant="primary" 
        size="lg"
        disabled={loading}
        className="w-100"
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
            Conectando...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </Form>
  );
}

export default Login;