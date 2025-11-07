import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Container, Card, Form, Row, Col, Button, Alert, Spinner, Badge } from 'react-bootstrap';

export default function ChoixRes() {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [newMemberId, setNewMemberId] = useState("");
  const [ambiance, setAmbiance] = useState('');
  const [tabagns, setTabagns] = useState('');
  const [customTabagns, setCustomTabagns] = useState('');
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
  const isComplete = useMemo(() => group && [group?.resident1, group?.resident2, group?.resident3, group?.resident4].every(Boolean), [group]);

  const createGroup = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiCall({ action: 'create_group' });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addMember = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiCall({ action: 'add_member', memberId: newMemberId.trim() });
      setNewMemberId("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = async (memberId) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiCall({ action: 'remove_member', memberId });
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
      const effectiveTabagns = tabagns === 'autre' ? customTabagns.trim() : tabagns;
      await apiCall({ action: 'update_prefs', ambiance, tabagns: effectiveTabagns });
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
            <p>Tu seras le responsable. Tu pourras ajouter tes 4 colocataires un par un ensuite.</p>
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
            <Button disabled={submitting} className="mt-2" onClick={createGroup}>Créer le groupe</Button>
          </Card.Body>
        </Card>
      )}

      {group && (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Mon groupe</Card.Title>
              <div className="mb-2">Responsable: <Badge bg="primary">{group.responsable}</Badge></div>
              <div className="mb-2">Résidents:</div>
              <div className="d-flex flex-column gap-2">
                {group.members && group.members.filter(m => m.role !== 'responsable').map((m, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between border rounded p-2">
                    <div>
                      <div><strong>{m.prenom || '—'} {m.nom || ''}</strong></div>
                      <div className="text-muted" style={{fontSize:'0.85em'}}>{m.id}</div>
                    </div>
                    {isResponsable && (
                      <Button variant="outline-danger" size="sm" disabled={submitting} onClick={() => removeMember(m.id)}>Retirer</Button>
                    )}
                  </div>
                ))}
                {group.members && group.members.filter(m => m.role !== 'responsable').length === 0 && (
                  <span className="text-muted">Aucun</span>
                )}
              </div>
              {isResponsable && (
                <div className="mt-3">
                  <Form.Label>Ajouter un résident (ID)</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control value={newMemberId} onChange={e => setNewMemberId(e.target.value)} placeholder="user_id" />
                    <Button disabled={submitting || !newMemberId.trim()} onClick={addMember}>Ajouter</Button>
                  </div>
                  <div className="text-muted mt-2" style={{fontSize:'0.9em'}}>Tu dois avoir 4 résidents au total. Le groupe est {isComplete ? 'complet' : 'incomplet'}.</div>
                  <Button variant="outline-danger" className="mt-3" disabled={submitting} onClick={async ()=>{ setSubmitting(true); setError(null); try { await apiCall({ action: 'delete_group' }); await load(); } catch(e){ setError(e.message);} finally { setSubmitting(false);} }}>Supprimer le groupe</Button>
                  <div className="text-muted mt-1" style={{fontSize:'0.75em'}}>Suppression totale pour recommencer ou rejoindre un autre groupe.</div>
                </div>
              )}
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
                    <Form.Label>Tabagn's</Form.Label>
                    <Form.Select value={tabagns} disabled={!isResponsable} onChange={e => { setTabagns(e.target.value)}}>
                      <option value="">— Choisir —</option>
                      <option value="sibers">Sibers</option>
                      <option value="kin">Kin</option>
                      <option value="birse">Birse</option>
                      <option value="chalons">Chalon's</option>
                      <option value="bordels">Bordel's</option>
                      <option value="boquette">Boquette</option>
                      <option value="p3">P3</option>
                    </Form.Select>
                    {tabagns === 'autre' && (
                      <Form.Control className="mt-2" value={customTabagns} disabled={!isResponsable} onChange={e => setCustomTabagns(e.target.value)} placeholder="Ton tabagn's" />
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Button className="mt-3" disabled={!isResponsable || submitting || !ambiance || !tabagns || (tabagns==='autre' && !customTabagns.trim()) || !isComplete} onClick={savePrefs}>Enregistrer</Button>
              {!isComplete && <div className="text-muted mt-2">Le choix de chambre n'est pas encore dispo.</div>}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Chambres disponibles</Card.Title>
              <div className="mb-2">Affichées selon ambiance/tabagns et uniquement celles non prises.</div>
              {!isComplete && <Alert variant="warning" className="mt-2">Le choix de chambre n'est pas encore dispo (groupe incomplet).</Alert>}
              <Button variant="outline-primary" size="sm" disabled={submitting || !ambiance || !tabagns || !isComplete} onClick={refreshRooms}>Rafraîchir</Button>
              <Row className="mt-3 g-2">
                {rooms.map((r) => (
                  <Col xs={12} md={6} lg={4} key={r.kgibs}>
                    <Card>
                      <Card.Body className="d-flex align-items-center justify-content-between">
                        <div>
                          <div><b>{r.kgibs}</b></div>
                          <div className="text-muted" style={{fontSize:'0.9em'}}>Ambiance: {r.ambiance} • Tabagns: {r.tabagns}</div>
                        </div>
                        <Button disabled={!isResponsable || submitting || !isComplete} onClick={() => chooseRoom(r.kgibs)}>Choisir</Button>
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
