import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import useIsAdmin from '../../hooks/useIsAdmin';

export default function AdminResto() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [restos, setRestos] = useState([]);
  const [restoMap, setRestoMap] = useState({});
  const [emailQuery, setEmailQuery] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    loadRestos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadRestos = async () => {
    setLoading(true);
    const token = await getToken({ template: 'supabase' });
    const supabase = createClient(
      'https://vwwnyxyglihmsabvbmgs.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data } = await supabase.from('resto').select('email, tabagns, paiement');
    const rows = data || [];
    const map = {};
    rows.forEach(r => {
      if (r.email) map[String(r.email).toLowerCase().trim()] = r;
    });
    setRestos(rows);
    setRestoMap(map);
    setLoading(false);
  };

  const handleCheck = () => {
    setResult(null);
    const q = (emailQuery || '').toLowerCase().trim();
    if (!q) return;
    const r = restoMap[q];
    if (r) {
      if (r.paiement === true) {
        setResult({ status: 'paid', tabagns: r.tabagns || '—', email: r.email });
      } else {
        setResult({ status: 'registered_not_paid', tabagns: r.tabagns || '—', email: r.email });
      }
    } else {
      // not registered in resto
      setResult({ status: 'not_registered', email: q });
    }
  };

  if (adminLoading) return <p className="text-center mt-5">Chargement...</p>;
  if (!isAdmin) return <p className="text-center text-danger mt-5">Accès refusé</p>;

  return (
    <Container className="mt-4">
      <h3 className="mb-4">🍽️ Admin Resto — Vérification inscription</h3>
      {loading && <Spinner animation="border" />}

      {!loading && (
        <>
          <Row className="mb-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vérifier par email</Form.Label>
                <Form.Control type="email" value={emailQuery} onChange={e => setEmailQuery(e.target.value)} placeholder="adresse email à vérifier" />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button onClick={handleCheck} style={{ marginBottom: 8 }}>Vérifier</Button>
            </Col>
            <Col />
          </Row>

          {result && result.status === 'paid' && (
            <Alert variant="success">
              <strong>{result.email}</strong> — Inscription confirmée pour le tabagns : <span style={{ fontWeight: 700 }}>{result.tabagns}</span>
            </Alert>
          )}

          {result && result.status === 'registered_not_paid' && (
            <Alert variant="warning">
              <strong>{result.email}</strong> — Inscrit pour le tabagns : <span style={{ fontWeight: 700 }}>{result.tabagns}</span>.<br />
              Le paiement n'a pas été confirmé. Si la personne affirme avoir payé, merci de nous contacter pour vérification.
            </Alert>
          )}

          {result && result.status === 'not_registered' && (
            <Alert variant="info">
              <strong>{result.email}</strong> — Non inscrit au resto.<br />
              Si cette personne a effectué un paiement malgré tout, merci de nous contacter; sinon l'inscription est fermée.
            </Alert>
          )}

          <h5 className="mt-4">Récapitulatif par tabagns</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Tabagns</th>
                <th>Inscrits</th>
                <th>Ayant payé (resto.paiement = true)</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const regCounts = {};
                const paidCounts = {};
                restos.forEach(r => {
                  const t = r.tabagns || '—';
                  regCounts[t] = (regCounts[t] || 0) + 1;
                  if (r.paiement === true) paidCounts[t] = (paidCounts[t] || 0) + 1;
                });
                const keys = Array.from(new Set([...Object.keys(regCounts), ...Object.keys(paidCounts)])).sort();
                if (keys.length === 0) return <tr><td colSpan={3}>Aucune inscription trouvée</td></tr>;
                return keys.map(k => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>{regCounts[k] || 0}</td>
                    <td>{paidCounts[k] || 0}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}
