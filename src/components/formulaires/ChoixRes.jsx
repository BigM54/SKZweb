import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Container, Card, Form, Row, Col, Button, Alert, Spinner, Badge } from 'react-bootstrap';

export default function ChoixRes() {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [residents, setResidents] = useState(["", "", "", ""]);
  const [ambiance, setAmbiance] = useState('');
  const [tabagns, setTabagns] = useState('');
  const [rooms, setRooms] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const apiCall = async (body) => {
    const token = await getToken({ template: 'supabase' });
    const res = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/functions/v1/residence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall({ action: 'get_state' });
      setGroup(data.group);
      if (data.group) {
        setAmbiance(data.group.ambiance || '');
        setTabagns(data.group.tabagns || '');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const canCreate = useMemo(() => !group, [group]);
  const isResponsable = useMemo(() => group && group.responsable === userId, [group, userId]);

  const createGroup = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const clean = residents.map(r => r.trim() || null);
      await apiCall({ action: 'create_group', residents: clean });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const savePrefs = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiCall({ action: 'update_prefs', ambiance, tabagns });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const refreshRooms = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = await apiCall({ action: 'list_rooms' });
      setRooms(data.available || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const chooseRoom = async (kgibs) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiCall({ action: 'choose_room', kgibs });
      await load();
      await refreshRooms();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}><Spinner animation="border" /></div>;

  return (
    <Container className="py-4">
      <h3 className="mb-3">Résidence (kgibs)</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      {!group && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Créer mon groupe</Card.Title>
            <p>Tu seras le responsable. Renseigne les 4 IDs des comptes de tes colocataires (obligatoire).</p>
            <div className="mb-2">
              <small className="text-muted">Ton ID (responsable)&nbsp;:</small>
              <div className="d-flex align-items-center gap-2 mt-1">
                <code className="p-1">{userId}</code>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => { if (userId) navigator.clipboard.writeText(userId); }}
                >
                  Copier
                </Button>
              </div>
            </div>
            <Row className="g-2">
              {[0,1,2,3].map(i => (
                <Col md={6} key={i}>
                  <Form.Group>
                    <Form.Label>Résident {i+1} (ID)</Form.Label>
                    <Form.Control value={residents[i]} onChange={e => setResidents(prev => { const n=[...prev]; n[i]=e.target.value; return n; })} placeholder="user_id (obligatoire)" />
                  </Form.Group>
                </Col>
              ))}
            </Row>
            {(() => {
              const anyEmpty = residents.some(r => !r || r.trim() === '');
              const hasSelf = residents.some(r => r.trim() === (userId || ''));
              const unique = new Set(residents.map(r => r.trim())).size === residents.length;
              const canCreateLocal = !anyEmpty && !hasSelf && unique;
              return (
                <>
                  {anyEmpty && <div className="text-danger mt-2">Tous les résidents doivent être renseignés.</div>}
                  {hasSelf && <div className="text-danger mt-2">Ton ID ne doit pas apparaître dans la liste des résidents.</div>}
                  {!unique && <div className="text-danger mt-2">Chaque résident doit être unique (pas de doublon).</div>}
                  <Button disabled={submitting || !canCreateLocal} className="mt-3" onClick={createGroup}>Créer le groupe</Button>
                </>
              );
            })()}
          </Card.Body>
        </Card>
      )}

      {group && (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Mon groupe</Card.Title>
              <div className="mb-2">Responsable: <Badge bg="primary">{group.responsable}</Badge></div>
              <div className="mb-2">Résidents:
                <div className="d-flex gap-2 flex-wrap mt-1">
                  {[group.resident1, group.resident2, group.resident3, group.resident4].filter(Boolean).map((r, idx) => (
                    <Badge bg="secondary" key={idx}>{r}</Badge>
                  ))}
                  {![group.resident1, group.resident2, group.resident3, group.resident4].some(Boolean) && <span className="text-muted">Aucun</span>}
                </div>
              </div>
              <div className="mb-2">Chambre choisie: {group.kgibs ? <Badge bg="success">{group.kgibs}</Badge> : <span className="text-muted">Aucune</span>}</div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Préférences</Card.Title>
              {!isResponsable && <Alert variant="info">Seul le responsable peut modifier ces options.</Alert>}
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ambiance</Form.Label>
                    <Form.Select value={ambiance} disabled={!isResponsable} onChange={e => setAmbiance(e.target.value)}>
                      <option value="">— Choisir —</option>
                      <option value="calme">Calme</option>
                      <option value="anims">Anim's</option>
                      <option value="anims+">Anim's+</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tabagns</Form.Label>
                    <Form.Control value={tabagns} disabled={!isResponsable} onChange={e => setTabagns(e.target.value)} placeholder="ex: sibers, kin…" />
                  </Form.Group>
                </Col>
              </Row>
              <Button className="mt-3" disabled={!isResponsable || submitting || !ambiance || !tabagns} onClick={savePrefs}>Enregistrer</Button>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Chambres disponibles</Card.Title>
              <div className="mb-2">Affichées selon ambiance/tabagns et uniquement celles non prises.</div>
              <Button variant="outline-primary" size="sm" disabled={submitting || !ambiance || !tabagns} onClick={refreshRooms}>Rafraîchir</Button>
              <Row className="mt-3 g-2">
                {rooms.map((r) => (
                  <Col xs={12} md={6} lg={4} key={r.kgibs}>
                    <Card>
                      <Card.Body className="d-flex align-items-center justify-content-between">
                        <div>
                          <div><b>{r.kgibs}</b></div>
                          <div className="text-muted" style={{fontSize:'0.9em'}}>Ambiance: {r.ambiance} • Tabagns: {r.tabagns}</div>
                        </div>
                        <Button disabled={!isResponsable || submitting} onClick={() => chooseRoom(r.kgibs)}>Choisir</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
                {rooms.length === 0 && <div className="text-muted">Aucune chambre disponible selon tes critères.</div>}
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}
