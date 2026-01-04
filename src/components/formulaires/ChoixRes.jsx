import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Container, Card, Row, Col, Spinner, Badge, Alert } from 'react-bootstrap';

export default function ChoixResRead() {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken({ template: 'supabase' });
      const res = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/functions/v1/residence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'get_state' })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement');
      setGroup(data.group);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4 text-center">Ma Résidence</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {!group ? (
        <Alert variant="info">Tu n'appartiens à aucun groupe pour le moment.</Alert>
      ) : (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            
            {/* CARD : INFOS CHAMBRE */}
            <Card className="mb-4 border-primary shadow-sm">
              <Card.Body className="text-center">
                <Card.Subtitle className="text-muted mb-2">Numéro de chambre (kgibs)</Card.Subtitle>
                {group.kgibs ? (
                  <h1 className="display-4 fw-bold text-primary">{group.kgibs}</h1>
                ) : (
                  <h4 className="text-muted italic">Aucune chambre assignée</h4>
                )}
                <div className="mt-3">
                  <Badge bg="secondary" className="me-2">{group.computedGroupe || 'Groupe non défini'}</Badge>
                  <Badge bg="info">{group.ambiance || 'Ambiance non définie'}</Badge>
                </div>
              </Card.Body>
            </Card>

            {/* CARD : MEMBRES DU GROUPE */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white fw-bold">Membres du groupe</Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-2">
                  {group.members && group.members.map((m, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2 last:border-0">
                      <div>
                        <div className="fw-bold">{m.prenom} {m.nom}</div>
                        <div className="text-muted small">{m.id}</div>
                      </div>
                      {m.role === 'responsable' && (
                        <Badge bg="primary" pill>Responsable</Badge>
                      )}
                      {m.id === userId && (
                        <Badge bg="success" pill>Moi</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      )}
    </Container>
  );
}