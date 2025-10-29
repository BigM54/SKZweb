import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';

export default function ChoixBus() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabagns, setTabagns] = useState(null);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchState = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken({ template: 'supabase' });
      const res = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/functions/v1/bus_choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'get' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de chargement');
      setTabagns(data.tabagns);
      setCurrentVariant(data.currentVariant);
      setVariants(data.variants || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchState(); }, []);

  const reserve = async (variant) => {
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken({ template: 'supabase' });
      const res = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/functions/v1/bus_choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'reserve', variant })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la réservation');
      setCurrentVariant(variant);
      // refresh counts
      await fetchState();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner animation="border" role="status" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const order = { 'calme': 1, 'anims': 2, 'anims+': 3 };
  const sorted = [...variants].sort((a, b) => (order[a.variant] || 99) - (order[b.variant] || 99));

  return (
    <div className="container py-4">
      <h3>Choix des bus ({tabagns})</h3>
      <p>Pour ton tabagns, choisis entre Calme, Anim's, et Anim's+. Tu peux voir le nombre de places restantes.</p>
      <Row>
        {sorted.map(v => {
          const full = (v.dispo ?? 0) <= 0;
          const selected = currentVariant && currentVariant === v.variant;
          return (
            <Col key={v.variant} md={4} className="mb-3">
              <Card className={selected ? 'border-success' : ''}>
                <Card.Body>
                  <Card.Title>{v.variant === 'anims+' ? "Anim's+" : v.variant.charAt(0).toUpperCase() + v.variant.slice(1)}</Card.Title>
                  <Card.Text>
                    Places: {(v.nbInscrits ?? 0)} / {(v.nbMax ?? 0)}<br/>
                    Restantes: {v.dispo}
                  </Card.Text>
                  <Button
                    variant={selected ? 'success' : 'primary'}
                    disabled={selected || full || submitting}
                    onClick={() => reserve(v.variant)}
                  >
                    {selected ? 'Sélectionné' : full ? 'Complet' : 'Choisir'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
