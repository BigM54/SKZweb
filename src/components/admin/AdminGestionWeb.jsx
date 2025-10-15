import { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Alert, Collapse } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

function toDatetimeLocal(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminGestionWeb() {
  const [dates, setDates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showShotgun, setShowShotgun] = useState(false);
  const [showPaiements, setShowPaiements] = useState(false);
  const [datePaiement, setdatePaiement] = useState(null);
  const [loadingPaiements, setLoadingPaiements] = useState(true);
  const [savingPaiements, setSavingPaiements] = useState(false);
  const [errorPaiements, setErrorPaiements] = useState(null);
  const [successPaiements, setSuccessPaiements] = useState(false);
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
    const fetchdatePaiement = async () => {
      setLoadingPaiements(true);
      setErrorPaiements(null);
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('datePaiement')
        .select('*')
        .eq('id', 1)
        .single();
      if (error) setErrorPaiements("Erreur lors du chargement des dates de paiement");
      setdatePaiement(data);
      setLoadingPaiements(false);
    };
    fetchDates();
    fetchdatePaiement();
    // eslint-disable-next-line
  }, [getToken]);

  const handleChange = (col, value) => {
    setDates(prev => ({ ...prev, [col]: value }));
  };
  const handleChangePaiements = (col, value) => {
    setdatePaiement(prev => ({ ...prev, [col]: value }));
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
        PeksArchis: toISO(dates.PeksArchis)
      })
      .eq('id', dates.id)
      .single();
    if (error) setError("Erreur lors de la sauvegarde");
    else setSuccess(true);
    setSaving(false);
  };
  const handleSavePaiements = async () => {
    setSavingPaiements(true);
    setErrorPaiements(null);
    setSuccessPaiements(false);
    const supabase = await getSupabase();
    const toISO = val => val ? new Date(val).toISOString() : null;
    const { error } = await supabase
      .from('datePaiement')
      .update({
        Paiement1: toISO(datePaiement.Paiement1),
        Paiement2: toISO(datePaiement.Paiement2),
        Paiement3: toISO(datePaiement.Paiement3)
      })
      .eq('id', 1)
      .single();
    if (error) console.log(error);
    else setSuccessPaiements(true);
    setSavingPaiements(false);
  };

  if (loading || loadingPaiements) return <Spinner animation="border" />;

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title style={{ cursor: 'pointer' }} onClick={() => setShowShotgun(s => !s)}>
            Gestion des dates du Shotgun
            <span style={{ float: 'right', fontSize: '1.2em' }}>{showShotgun ? '▼' : '▲'}</span>
          </Card.Title>
          <Collapse in={showShotgun}>
            <div>
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
                  <Form.Label>Peks/Archis</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={toDatetimeLocal(dates?.PeksArchis)}
                    onChange={e => handleChange("PeksArchis", e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </Form>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title style={{ cursor: 'pointer' }} onClick={() => setShowPaiements(s => !s)}>
            Gestion des dates paiement
            <span style={{ float: 'right', fontSize: '1.2em' }}>{showPaiements ? '▼' : '▲'}</span>
          </Card.Title>
          <Collapse in={showPaiements}>
            <div>
              <div className="mb-3">
                <b>Fuseau horaire utilisé : {timezone}</b>
              </div>
              {errorPaiements && <Alert variant="danger">{errorPaiements}</Alert>}
              {successPaiements && <Alert variant="success">Dates de paiement sauvegardées !</Alert>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Paiement 1</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={toDatetimeLocal(datePaiement?.Paiement1)}
                    onChange={e => handleChangePaiements("Paiement1", e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Paiement 2</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={toDatetimeLocal(datePaiement?.Paiement2)}
                    onChange={e => handleChangePaiements("Paiement2", e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Paiement 3</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={toDatetimeLocal(datePaiement?.Paiement3)}
                    onChange={e => handleChangePaiements("Paiement3", e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleSavePaiements} disabled={savingPaiements}>
                  {savingPaiements ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </Form>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
    </>
  );
}