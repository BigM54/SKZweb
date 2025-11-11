import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Container, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';

export default function ChoixRes() {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [newMemberId, setNewMemberId] = useState("");
  // Choix des chambres désactivé temporairement (ouverture le 17 novembre)
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
      // Pas de calcul de groupe / chambres pour l'instant
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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

  // Pas de fonctions de préférences / chambres pendant la période de fermeture des choix

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}><Spinner animation="border" /></div>;

  return (
    <Container fluid className="py-4" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      <h3 className="mb-3">Résidence (kgibs)</h3>
      <Alert variant="info" className="mb-4">
        Le choix des chambres ouvrira le 17&nbsp;novembre. Tu peux dès maintenant créer ton groupe et ajouter tes colocataires.
      </Alert>
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
                  <div className="text-muted mt-2" style={{fontSize:'0.9em'}}>Tu dois avoir 5 résidents au total. Le groupe est {isComplete ? 'complet' : 'incomplet'}.</div>
                  <Button variant="outline-danger" className="mt-3" disabled={submitting} onClick={async ()=>{ setSubmitting(true); setError(null); try { await apiCall({ action: 'delete_group' }); await load(); } catch(e){ setError(e.message);} finally { setSubmitting(false);} }}>Supprimer le groupe</Button>
                  <div className="text-muted mt-1" style={{fontSize:'0.75em'}}>Suppression totale pour recommencer ou rejoindre un autre groupe.</div>
                </div>
              )}
              {/* Pas de sélection de chambre pour l'instant */}
            </Card.Body>
          </Card>


        </>
      )}
    </Container>
  );
}
