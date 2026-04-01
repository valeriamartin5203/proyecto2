import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Person, Key, Shield } from 'react-bootstrap-icons';
import api from '../services/api';

function Registro({ mostrarAlerta, onRegistroExitoso }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuario || !password) {
      mostrarAlerta('Completa todos los campos', 'error');
      return;
    }

    if (password.length < 6) {
      mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/registro', { usuario, password });

      if (response.data.success) {
        mostrarAlerta('✅ Usuario registrado correctamente', 'success');
        setUsuario('');
        setPassword('');
        onRegistroExitoso();
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
            placeholder="Elige un usuario"
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
            placeholder="Mínimo 6 caracteres"
            disabled={loading}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <Form.Text className="text-muted">
          <Shield className="me-1" /> La contraseña debe tener al menos 6 caracteres
        </Form.Text>
      </Form.Group>
      
      <Button 
        type="submit" 
        variant="success" 
        size="lg"
        disabled={loading}
        className="w-100"
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
            Registrando...
          </>
        ) : (
          'Registrarse'
        )}
      </Button>
    </Form>
  );
}

export default Registro;