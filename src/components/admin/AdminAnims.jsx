import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { Container, Card, Row, Col, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';

// List of animation column names (main columns). FA column assumed to be the same name + '_FA'
const ANIMS = [
  'Slalom', 'Derby', 'Boarder Cross', 'Compétition Freestyle (Big Air)', 'First Track', 'Last Track',
  'ARVA Gourmand', 'Descente aux flambeaux', 'Visite remontée mécanique', 'Visite usine à neige', 'Visite fromagerie',
  'Découverte de la station', 'Cours de Ski Débutant-Intermédiaire', 'Cours de Snow', 'Initiation Freeride', 'Initiation Freestyle', 'Rando Raquette'
];

export default function AdminAnims() {
  const { getToken } = useAuth();
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [waiting, setWaiting] = useState([]);

  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const loadForAnim = async (animName) => {
    setError(null);
    setLoading(true);
    setParticipants([]);
    setWaiting([]);
    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });

      // Read all rows from resultats_anims. Each row represents a position; columns are anim names.
      const { data: rows, error: rowsErr } = await supabase.from('resultats_anims').select('*');
      if (rowsErr) throw rowsErr;
      const col = animName;
      const faCol = `${animName}_FA`;

      // Collect ids in order (rows order) for participants and waiting list
      const partIds = [];
      const waitIds = [];
      (rows || []).forEach(r => {
        const v = r[col];
        if (v) partIds.push(String(v));
        const w = r[faCol];
        if (w) waitIds.push(String(w));
      });

      const allIds = Array.from(new Set(partIds.concat(waitIds)));
      const profilesMap = {};
      if (allIds.length) {
        const chunks = chunk(allIds, 200);
        let allProfiles = [];
        for (const ch of chunks) {
          const { data: p, error: pErr } = await supabase.from('profils').select('id, prenom, nom, numero').in('id', ch);
          if (pErr) throw pErr;
          allProfiles = allProfiles.concat(p || []);
        }
        allProfiles.forEach(p => { profilesMap[String(p.id)] = p; });
      }

      // Map ids to profile entries preserving order
      const parts = partIds.map(id => profilesMap[id] ? { id, prenom: profilesMap[id].prenom, nom: profilesMap[id].nom, numero: profilesMap[id].numero } : { id, prenom: null, nom: null, numero: null });
      const waits = waitIds.map(id => profilesMap[id] ? { id, prenom: profilesMap[id].prenom, nom: profilesMap[id].nom, numero: profilesMap[id].numero } : { id, prenom: null, nom: null, numero: null });

      setParticipants(parts);
      setWaiting(waits);
    } catch (e) {
      console.error('AdminAnims load error', e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) loadForAnim(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <Container fluid className="py-4">
      <h3 className="mb-3">Résultats Anim's</h3>
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sélectionne une animation</Form.Label>
                <Form.Select value={selected} onChange={e => setSelected(e.target.value)}>
                  <option value="">— Choisir —</option>
                  {ANIMS.map(a => <option key={a} value={a}>{a}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex gap-2">
              <Button onClick={() => selected && loadForAnim(selected)} disabled={!selected || loading}>{loading ? <><Spinner animation="border" size="sm"/> Charger</> : 'Charger'}</Button>
              <Button variant="outline-secondary" onClick={() => { setSelected(''); setParticipants([]); setWaiting([]); setError(null); }}>Réinitialiser</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {selected && (
        <Row className="g-3">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Participants ({participants.length})</Card.Title>
                {participants.length === 0 && <div className="text-muted">Aucun participant inscrit.</div>}
                {participants.map((p, idx) => (
                  <div key={`${p.id}-${idx}`} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                      <strong>{p.prenom || '—'} {p.nom || ''}</strong>
                      <div className="text-muted" style={{fontSize:'0.9em'}}>{p.id}</div>
                    </div>
                    <div className="text-end">
                      <div className="small">{p.numero ? <a href={`tel:${p.numero}`}>{p.numero}</a> : '—'}</div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>File d'attente ({waiting.length})</Card.Title>
                {waiting.length === 0 && <div className="text-muted">Aucune personne en file d'attente.</div>}
                {waiting.map((p, idx) => (
                  <div key={`${p.id}-w-${idx}`} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                      <strong>{p.prenom || '—'} {p.nom || ''}</strong>
                      <div className="text-muted" style={{fontSize:'0.9em'}}>{p.id}</div>
                    </div>
                    <div className="text-end">
                      <div className="small">{p.numero ? <a href={`tel:${p.numero}`}>{p.numero}</a> : '—'}</div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
