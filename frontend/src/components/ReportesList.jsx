import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { Person, GeoAlt, FileText, Calendar } from 'react-bootstrap-icons';

function ReportesList({ reportes }) {
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

  if (!reportes || reportes.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <FileText size={48} className="mb-3 text-secondary" />
        <p>No hay reportes aún</p>
        <small>Crea tu primer reporte usando el formulario</small>
      </div>
    );
  }

  return (
    <div className="reportes-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      {reportes.map((reporte) => (
        <Card key={reporte.id} className="mb-3 shadow-sm border-0">
          <Card.Body className="p-3">
            <Row className="align-items-start">
              <Col xs={12}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <h6 className="mb-0 fw-bold text-primary">
                    #{reporte.id} - {reporte.modulo}
                  </h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <Badge bg={getCategoriaBadge(reporte.categoria)} pill>
                      🏷️ {reporte.categoria}
                    </Badge>
                    <Badge bg={getBadgeVariant(reporte.urgencia)} pill>
                      ⚠️ {reporte.urgencia}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-secondary mb-2 small">
                  <GeoAlt className="me-1" /> {reporte.modulo}
                </p>
                
                <p className="mb-2">
                  <FileText className="me-1 text-muted" /> {reporte.problema}
                </p>
                
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <small className="text-muted">
                    <Person className="me-1" /> {reporte.usuario}
                  </small>
                  <small className="text-muted">
                    <Calendar className="me-1" /> {new Date().toLocaleDateString()}
                  </small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      
      <div className="text-center mt-3">
        <small className="text-muted">
          Total: {reportes.length} reporte{reportes.length !== 1 ? 's' : ''}
        </small>
      </div>
    </div>
  );
}

export default ReportesList;