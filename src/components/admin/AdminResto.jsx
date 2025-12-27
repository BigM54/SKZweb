import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import useIsAdmin from '../../hooks/useIsAdmin';

export default function AdminResto() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registeredCounts, setRegisteredCounts] = useState({});
  const [paidCounts, setPaidCounts] = useState({});
  const [paidNotInResto, setPaidNotInResto] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const token = await getToken({ template: 'supabase' });
    const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // fetch all resto registrations
    const { data: restos } = await supabase.from('resto').select('email, tabagns');
    const regCounts = {};
    const restoByEmail = {};
    (restos || []).forEach(r => {
      const t = (r.tabagns || '—');
      regCounts[t] = (regCounts[t] || 0) + 1;
      restoByEmail[r.email] = r;
    });

    // fetch all Paiements where resto = true
    const { data: paiements } = await supabase.from('Paiements').select('email').eq('resto', true);
    const paidCountsLocal = {};
    const paidNotIn = [];
    (paiements || []).forEach(p => {
      const email = p.email;
      const r = restoByEmail[email];
      if (r && r.tabagns) {
        const t = r.tabagns;
        paidCountsLocal[t] = (paidCountsLocal[t] || 0) + 1;
      } else {
        paidNotIn.push(email);
      }
    });

    setRegisteredCounts(regCounts);
    setPaidCounts(paidCountsLocal);
    setPaidNotInResto(paidNotIn);
    setLoading(false);
  };

  if (adminLoading) return <p className="text-center mt-5">Chargement...</p>;
  if (!isAdmin) return <p className="text-center text-danger mt-5">Accès refusé</p>;

  return (
    <Container className="mt-4">
      <h3 className="mb-4">🍽️ Resto — Inscrits et Paiements</h3>
      {loading && <Spinner animation="border" />}

      {!loading && (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Tabagns</th>
                <th>Inscrits</th>
                <th>Ayant payé</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys({ ...registeredCounts, ...paidCounts }).length === 0 && (
                <tr><td colSpan={3}>Aucune inscription trouvée</td></tr>
              )}
              {Object.keys({ ...registeredCounts, ...paidCounts }).sort().map(t => (
                <tr key={t}>
                  <td>{t}</td>
                  <td>{registeredCounts[t] || 0}</td>
                  <td>{paidCounts[t] || 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h5 className="mt-4">Paiements reçus sans enregistrement dans `resto`</h5>
          {paidNotInResto.length === 0 ? (
            <Alert variant="secondary">Aucun paiement trouvé hors table `resto`.</Alert>
          ) : (
            <Table striped bordered>
              <thead>
                <tr><th>Email</th></tr>
              </thead>
              <tbody>
                {paidNotInResto.map(e => <tr key={e}><td>{e}</td></tr>)}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
}
