import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function RestoBiproms() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [restoRow, setRestoRow] = useState(null);
  const [error, setError] = useState(null);

  const getSupabase = async () => {
    const token = await getToken({ template: 'supabase' });
    return createClient(
      'https://vwwnyxyglihmsabvbmgs.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
  };

  const getUserEmail = () => {
    if (!user) return '';
    return (user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || user.email) || '';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (!user) throw new Error('Connexion requise');
        const supabase = await getSupabase();
        const email = getUserEmail();
        if (!email) throw new Error('Email introuvable');

        // Fetch resto row for this email. We rely on `resto.paiement` as canonical.
        const { data: existing, error: fetchErr } = await supabase.from('resto').select('tabagns, paiement').eq('email', email).maybeSingle();
        if (fetchErr) throw fetchErr;
        if (mounted) setRestoRow(existing || null);
      } catch (e) {
        console.error('Resto init error', e);
        if (mounted) setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const userEmail = getUserEmail();

  if (loading) return <Container className="py-4 text-center"><Spinner animation="border" /> Chargement...</Container>;
  if (!user) return <Container className="py-4 text-center text-danger">Connectez-vous pour voir votre statut resto.</Container>;

  return (
    <Container className="py-4">
      <h3 className="mb-3">Resto Biprom's — Statut d'inscription</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-3">
        <Card.Body>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Email lié</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>{userEmail || <em>Non trouvé</em>}</div>

          {restoRow && restoRow.paiement === true ? (
            <>
              <Alert variant="success">
                ✅ Inscription confirmée — Vous êtes inscrit·e pour le tabagns : <span style={{ fontWeight: 700 }}>{restoRow.tabagns || '—'}</span>
              </Alert>
            </>
          ) : restoRow && restoRow.paiement !== true ? (
            <>
              <Alert variant="warning">
                ⚠️ Inscription enregistrée mais paiement non confirmé.
                <div style={{ marginTop: 8 }}>Si la personne affirme avoir effectué le paiement, merci de nous contacter pour vérification.</div>
              </Alert>
            </>
          ) : (
            <>
              <Alert variant="info">
                ❌ Non inscrit au resto.
                <div style={{ marginTop: 8 }}>Si la personne affirme avoir effectué le paiement, merci de nous contacter ; sinon l'inscription est fermée.</div>
              </Alert>
            </>
          )}

          <div className="mt-2">
            <Button variant="secondary" onClick={() => window.location.reload()}>Rafraîchir le statut</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
