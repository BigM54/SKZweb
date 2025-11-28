import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Form, Row, Col, Button, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

export default function AdminResidences() {
  const [ambiance, setAmbiance] = useState('');
  const [group, setGroup] = useState('');
  const [rooms, setRooms] = useState([]);
  const [optionsWithoutResidence, setOptionsWithoutResidence] = useState([]);
  const [optionsInResidenceNoKgibs, setOptionsInResidenceNoKgibs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const groupOptions = ['', 'sibers','birse','chalons','cluns','intertbk','kin','boquette','bordels','archis','peks','p3'];
  const ambianceOptions = ['', 'calme', 'anims', "anims+"];

  const sbRef = useRef(null);

  const { getToken } = useAuth();

  const loadRooms = async (client) => {
    setLoading(true);
    setError(null);
    try {
      // ensure we have a Supabase client
      if (!client) client = sbRef.current;
      if (!client) {
        // try to initialize token & client
        const token = await getToken({ template: 'supabase' }).catch(() => null);
        if (!token) throw new Error('Unable to get auth token');
        client = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
          global: { headers: { Authorization: `Bearer ${token}` } }
        });
        sbRef.current = client;
      }

      let query = client.from('chambres').select('kgibs, ambiance, groupe, etage, cote').order('kgibs', { ascending: true });
      if (ambiance) query = query.eq('ambiance', ambiance);
      if (group) query = query.eq('groupe', group);
      const { data: chambreData, error: chambreErr } = await query;
      if (chambreErr) throw chambreErr;
      const roomsList = chambreData || [];

      // Find any residence rows that take these kgibs
      const kgibsList = roomsList.map(r => r.kgibs).filter(Boolean);
      let resRows = [];
      if (kgibsList.length) {
        const { data: rdata, error: rerr } = await client.from('residence').select('kgibs, responsable, resident1, resident2, resident3, resident4').in('kgibs', kgibsList);
        if (rerr) throw rerr;
        resRows = rdata || [];
      }

      const kgibsToIds = {};
      resRows.forEach(r => {
        const ids = [r.responsable, r.resident1, r.resident2, r.resident3, r.resident4].filter(Boolean);
        kgibsToIds[String(r.kgibs)] = ids;
      });

      const allIds = Array.from(new Set(Object.values(kgibsToIds).flat()));
      let profils = [];
      if (allIds.length) {
        const chunkSize = 200;
        const chunks = [];
        for (let i = 0; i < allIds.length; i += chunkSize) chunks.push(allIds.slice(i, i + chunkSize));
        let allProfils = [];
        for (const ch of chunks) {
          const { data: p, error: perr } = await client.from('profils').select('id, prenom, nom').in('id', ch);
          if (perr) throw perr;
          allProfils = allProfils.concat(p || []);
        }
        profils = allProfils;
      }
      const profMap = {};
      profils.forEach(p => { profMap[p.id] = p; });

      const roomsWithOccupants = roomsList.map(r => {
        const ids = kgibsToIds[String(r.kgibs)] || [];
        const occupants = ids.map(id => {
          const pf = profMap[id];
          return pf ? `${pf.prenom || ''} ${pf.nom || ''}`.trim() : id;
        });
        return { ...r, occupants };
      });

      setRooms(roomsWithOccupants);

      // Now fetch options and all residence rows to find users who have options but
      // are not assigned to any residence, or are assigned to a residence but that
      // residence has no kgibs value set.
      const { data: optionsData } = await client.from('options').select('*');
      const optionsIds = (optionsData || []).map(o => o.id).filter(Boolean);

      // fetch all residences
      const { data: allRes, error: allResErr } = await client.from('residence').select('kgibs, responsable, resident1, resident2, resident3, resident4');
      if (allResErr) throw allResErr;
      const resRowsAll = allRes || [];

      const idToRes = {};
      resRowsAll.forEach(rr => {
        ['responsable', 'resident1', 'resident2', 'resident3', 'resident4'].forEach(col => {
          const val = rr[col];
          if (val) idToRes[String(val)] = rr;
        });
      });

      const without = [];
      const withResNoKgibs = [];
      optionsIds.forEach(id => {
        const rr = idToRes[String(id)];
        if (!rr) without.push(id);
        else {
          if (rr.kgibs === null || rr.kgibs === undefined || String(rr.kgibs).trim() === '') withResNoKgibs.push({ id, rr });
        }
      });

      // Fetch profiles for both lists and build display data
      const allOptIdsToFetch = Array.from(new Set(without.concat(withResNoKgibs.map(r => r.id))));
      let profilsForOpts = [];
      if (allOptIdsToFetch.length) {
        const chunkSize = 200;
        for (let i = 0; i < allOptIdsToFetch.length; i += chunkSize) {
          const ch = allOptIdsToFetch.slice(i, i + chunkSize);
          const { data: p, error: pErr } = await client.from('profils').select('id, prenom, nom, email, proms').in('id', ch);
          if (pErr) throw pErr;
          profilsForOpts = profilsForOpts.concat(p || []);
        }
      }
      const profilById = {};
      profilsForOpts.forEach(p => { profilById[p.id] = p; });

      const withoutRows = without.map(id => {
        const p = profilById[id];
        return { id, prenom: p?.prenom, nom: p?.nom, email: p?.email, proms: p?.proms };
      });
      const withNoKgRows = withResNoKgibs.map(({ id, rr }) => {
        const p = profilById[id];
        return { id, prenom: p?.prenom, nom: p?.nom, email: p?.email, proms: p?.proms, residence: rr };
      });
      setOptionsWithoutResidence(withoutRows);
      setOptionsInResidenceNoKgibs(withNoKgRows);
    } catch (e) {
      console.error('AdminResidences load error', e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initialize client once and load rooms
    (async () => {
      try {
        const token = await getToken({ template: 'supabase' }).catch(() => null);
        if (!token) throw new Error('Unable to get auth token');
        const client = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
          global: { headers: { Authorization: `Bearer ${token}` } }
        });
        sbRef.current = client;
        await loadRooms(client);
      } catch (e) {
        console.error('AdminResidences init error', e);
        setError(e.message || String(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid className="py-4">
      <h3 className="mb-3">Résidences (admin)</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Ambiance</Form.Label>
                <Form.Select value={ambiance} onChange={e => setAmbiance(e.target.value)}>
                  {ambianceOptions.map(a => <option key={a} value={a}>{a || '— Tous —'}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Groupe</Form.Label>
                <Form.Select value={group} onChange={e => setGroup(e.target.value)}>
                  {groupOptions.map(g => <option key={g} value={g}>{g || '— Tous —'}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button onClick={() => loadRooms()} disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Charger...</> : 'Charger'}
              </Button>
              <Button variant="outline-secondary" onClick={() => { setAmbiance(''); setGroup(''); loadRooms(); }} disabled={loading}>Réinitialiser</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Options — profils sans chambre / chambre sans kgibs</Card.Title>
            <div className="mb-3 text-muted">Liste des personnes ayant des options mais qui ne sont assignées à aucune résidence, ou qui sont assignées à une résidence mais sans kgibs défini.</div>
            {loading && <div className="d-flex justify-content-center my-4"><Spinner animation="border" /></div>}
            {!loading && optionsWithoutResidence.length === 0 && optionsInResidenceNoKgibs.length === 0 && <div className="text-muted">Aucun profil trouvé.</div>}

            {!loading && optionsWithoutResidence.length > 0 && (
              <>
                <h6>📭 Profil(s) avec options mais sans chambre assignée</h6>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Prom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsWithoutResidence.map(p => (
                      <tr key={p.id}>
                        <td>{(p.prenom || '') + ' ' + (p.nom || '')}</td>
                        <td><code>{p.id}</code></td>
                        <td>{p.email || '—'}</td>
                        <td>{p.proms || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}

            {!loading && optionsInResidenceNoKgibs.length > 0 && (
              <>
                <h6>🛏️ Profil(s) assignés·es à une résidence mais sans kgibs</h6>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Responsable (ID)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsInResidenceNoKgibs.map(p => (
                      <tr key={p.id}>
                        <td>{(p.prenom || '') + ' ' + (p.nom || '')}</td>
                        <td><code>{p.id}</code></td>
                        <td>{p.email || '—'}</td>
                        <td>{p.residence?.responsable || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}

          </Card.Body>
        </Card>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Chambres</Card.Title>
          <div className="mb-3 text-muted">Liste des chambres correspondant aux filtres choisis. Les occupants affichent le prénom et nom s'ils existent, sinon "Vide".</div>
          {loading && <div className="d-flex justify-content-center my-4"><Spinner animation="border" /></div>}
          {!loading && rooms.length === 0 && <div className="text-muted">Aucune chambre trouvée pour ces critères.</div>}

          {!loading && rooms.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Kgibs</th>
                  <th>Étage</th>
                  <th>Ambiance</th>
                  <th>Groupe</th>
                  <th>Occupants</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.kgibs}>
                    <td><strong>{r.kgibs}</strong></td>
                    <td>{r.etage ?? '—'}</td>
                    <td>{r.ambiance || '—'}</td>
                    <td><Badge bg="secondary">{r.groupe || '—'}</Badge></td>
                    <td>
                      {r.occupants && r.occupants.length > 0 ? (
                        r.occupants.map((o, i) => <div key={i}><Badge bg="info" text="dark">{o}</Badge></div>)
                      ) : (
                        <span className="text-muted">Vide</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
