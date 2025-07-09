import { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

function toDatetimeLocal(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminShotgunDates() {
  const [dates, setDates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { getToken } = useAuth();

  // Get browser timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // On crée le client à chaque appel avec le bon header Authorization
  const getSupabase = async () => {
    const token = await getToken({ template: 'supabase' });
    return createClient(
      'https://vwwnyxyglihmsabvbmgs.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
  };

  useEffect(() => {
    const fetchDates = async () => {
      setLoading(true);
      setError(null);
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('dateShotgun')
        .select('*')
        .single();
      if (error) setError("Erreur lors du chargement");
      setDates(data);
      setLoading(false);
    };
    fetchDates();
    // eslint-disable-next-line
  }, [getToken]);

  const handleChange = (col, value) => {
    setDates(prev => ({ ...prev, [col]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = await getSupabase();
    const toISO = val => val ? new Date(val).toISOString() : null;
    const { error } = await supabase
      .from('dateShotgun')
      .update({
        Conscrits: toISO(dates.Conscrits),
        promsConscrits: dates.promsConscrits,
        Anciens: toISO(dates.Anciens),
        P3: toISO(dates.P3),
        Archis: toISO(dates.Archis)
      })
      .eq('id', dates.id)
      .single();
    if (error) setError("Erreur lors de la sauvegarde");
    else setSuccess(true);
    setSaving(false);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Gestion des dates du Shotgun</Card.Title>
        <div className="mb-3">
          <b>Fuseau horaire utilisé : {timezone}</b>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Dates sauvegardées !</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Prom's des conscrits</Form.Label>
            <Form.Control
              type="number"
              value={dates?.promsConscrits || ""}
              onChange={e => handleChange("promsConscrits", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Conscrits</Form.Label>
            <Form.Control
              type="datetime-local"
              value={toDatetimeLocal(dates?.Conscrits)}
              onChange={e => handleChange("Conscrits", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Anciens</Form.Label>
            <Form.Control
              type="datetime-local"
              value={toDatetimeLocal(dates?.Anciens)}
              onChange={e => handleChange("Anciens", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>P3</Form.Label>
            <Form.Control
              type="datetime-local"
              value={toDatetimeLocal(dates?.P3)}
              onChange={e => handleChange("P3", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Archis / Pek's</Form.Label>
            <Form.Control
              type="datetime-local"
              value={toDatetimeLocal(dates?.Archis)}
              onChange={e => handleChange("Archis", e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}