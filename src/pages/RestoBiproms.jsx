import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function MonSkz() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [tabagnsOptions, setTabagnsOptions] = useState([]);
  const [selectedTabagns, setSelectedTabagns] = useState('');
  const [profileTabagns, setProfileTabagns] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [restoRow, setRestoRow] = useState(null);
  const [paid, setPaid] = useState(false);
  

  const pollRef = useRef(null);

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

  // Helper to get a safe email from Clerk user
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

        // fetch distinct tabagns from profils to populate dropdown
        const { data: tabsData, error: tabsErr } = await supabase.from('profils').select('tabagns').not('tabagns', 'is', null);
        if (tabsErr) throw tabsErr;
        // build unique tabagns list and exclude 'p3' (not selectable)
        const opts = Array.from(new Set((tabsData || []).map(r => (r.tabagns || '').trim()).filter(Boolean)))
          .filter(t => t.toLowerCase() !== 'p3');
        // ensure 'alterns' is available as a choice for resto
        if (!opts.map(x => x.toLowerCase()).includes('alterns')) {
          opts.push('alterns');
        }
        if (mounted) setTabagnsOptions(opts.sort());

        // fetch current user's profil to preselect tabagns if applicable
        const userId = user.id;
        const { data: profilData } = await supabase.from('profils').select('tabagns').eq('id', userId).maybeSingle();
        const profTab = profilData?.tabagns || '';
        if (mounted) setProfileTabagns(profTab);

        // Logic for preselection: if profile tabagns exists and is not 'p3', preselect it
        if (profTab && profTab.toLowerCase() !== 'p3') {
          setSelectedTabagns(profTab);
        }

        // fetch existing resto registration row for this email (if present)
        const email = getUserEmail();
        if (email) {
          const { data: existing } = await supabase.from('resto').select('*').eq('email', email).maybeSingle();
          if (existing) {
            setRestoRow(existing);
            const existingTab = (existing.tabagns || '').trim();
            if (existingTab && existingTab.toLowerCase() !== 'p3') {
              setSelectedTabagns(existingTab);
            }
          }
          // fetch paiement status from Paiements.resto
          const { data: payRow } = await supabase.from('Paiements').select('resto').eq('email', email).maybeSingle();
          if (payRow && payRow.resto) {
            setPaid(true);
            setStep(3);
          }
        }

      } catch (e) {
        console.error('MonSkz init error', e);
        if (mounted) setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Upsert resto row then go to iframe step
  const handleProceedToPay = async () => {
    setError(null);
    setSaving(true);
    try {
      if (!user) throw new Error('Vous devez être connecté');
      const email = getUserEmail();
      if (!email) throw new Error('Email non trouvé (Clerk)');
      if (!selectedTabagns) throw new Error('Choisissez un tabagns');
      if (selectedTabagns.toLowerCase() === 'p3') throw new Error('Le tabagns "p3" n\'est pas sélectionnable.');

      const supabase = await getSupabase();
      const payload = { email, tabagns: selectedTabagns };
      // Insert or update without relying on ON CONFLICT (email may not be a unique constraint)
      const { data: existingByEmail, error: selectErr } = await supabase.from('resto').select('email').eq('email', email).maybeSingle();
      if (selectErr) throw selectErr;
      if (existingByEmail && existingByEmail.email) {
        const { error: updErr } = await supabase.from('resto').update(payload).eq('email', email);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from('resto').upsert(payload);
        if (insErr) throw insErr;
      }

      // fetch saved row
      const { data: saved } = await supabase.from('resto').select('*').eq('email', email).maybeSingle();
      setRestoRow(saved || null);
      setStep(2);

      // start polling to check paiement status (in case webhook triggers)
      startPollingPayment(email);
    } catch (e) {
      console.error('ProceeToPay error', e);
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const startPollingPayment = (email) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase.from('Paiements').select('resto').eq('email', email).maybeSingle();
        if (data) {
          if (data.resto) {
            setPaid(true);
            stopPolling();
            setStep(3);
          }
        }
      } catch (e) {
        console.error('poll error', e);
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleCopyEmail = async () => {
    const email = getUserEmail();
    try {
      await navigator.clipboard.writeText(email);
      alert('Email copié');
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  const userEmail = getUserEmail();

  // Resto info (displayed on the form)
  const restoLocation = 'La Grotte du Yéti (Front de neige)';
  const restoPrice = '26€';
  const restoMenu = [
    'Entrée : Salade de saison',
    'Plat : Fondue et Raclette',
    'Boisson : Un verre de vin biere ou soft',
  ];

  // HelloAsso widget URL (provided). We append email + tabagns as query params.
  const helloAssoEmbedUrl = `https://www.helloasso.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/resto-biprom-s-skz/widget?email=${encodeURIComponent(userEmail)}&tabagns=${encodeURIComponent(selectedTabagns)}`;

  if (loading) return <Container className="py-4 text-center"><Spinner animation="border" /> Chargement...</Container>;
  if (!user) return <Container className="py-4 text-center text-danger">Connectez-vous pour vous inscrire au resto.</Container>;

  return (
    <Container className="py-4">
      <h3 className="mb-3">Resto biprom's</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Email de paiement</div>
              <div style={{ fontSize: 16, marginBottom: 8 }}>{userEmail || <em>Non trouvé</em>}</div>
              <Alert variant="danger" className="py-2" style={{ fontSize: 15, fontWeight: 700 }}>
                <div>ATTENTION — UTILISEZ CET EMAIL LORS DU PAIEMENT SUR HELLOASSO</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{userEmail || '—'}</div>
              </Alert>
              <Alert variant="warning" className="py-2" style={{ fontSize: 14 }}>
                <strong>INSCRIPTION DÉFINITIVE.</strong> Pas d'annulation possible. <strong>Pas de paiement = pas d'inscription.</strong>
              </Alert>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={handleCopyEmail}>Copier l'email</Button>
            </Col>
          </Row>
          <hr />
          <div className="mb-2">
            <div><strong>Lieu :</strong> {restoLocation}</div>
            <div><strong>Prix :</strong> {restoPrice}</div>
            <div><strong>Menu :</strong>
              <ul className="mb-0" style={{ paddingLeft: 18 }}>
                {restoMenu.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>

      {step === 1 && (
        <Card className="mb-3">
          <Card.Body>
            <Alert variant="danger" className="mb-3" style={{ fontSize: 15, fontWeight: 700 }}>
              IMPORTANT — Avant de payer : assurez-vous d'utiliser l'EMAIL affiché ci‑dessus sur la page HelloAsso. L'inscription est définitive et n'est validée qu'après paiement.
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label>Choisir le tabagns pour lequel vous participez</Form.Label>
              <Form.Select value={selectedTabagns} onChange={e => setSelectedTabagns(e.target.value)}>
                <option value="">— Choisir un tabagns —</option>
                {tabagnsOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
            <Button disabled={saving || !selectedTabagns} onClick={handleProceedToPay}>{saving ? 'Enregistrement...' : 'Payer et s\'inscrire'}</Button>
          </Card.Body>
        </Card>
      )}

      {step === 2 && (
        <Card className="mb-3">
          <Card.Body>
            <Alert variant="danger" className="mb-3" style={{ fontSize: 15, fontWeight: 700 }}>
              PAYEZ AVEC L'EMAIL INDIQUÉ — Ceci permet d'identifier automatiquement votre paiement. Sans paiement, votre inscription n'est pas validée.
            </Alert>
            <div className="mb-3">Étape de paiement — Utilisez le même email affiché en haut pour payer.</div>
            <div style={{ marginBottom: 8 }}>
              <Button variant="secondary" onClick={() => { stopPolling(); setStep(1); }}>Retour</Button>
            </div>
            <div style={{ minHeight: 200 }}>
              <div className="mb-3">
                <Alert variant="warning">Le paiement s'ouvrira dans une nouvelle fenêtre. Utilisez l'email affiché pour payer sur HelloAsso.</Alert>
              </div>
              <div>
                <Button variant="primary" onClick={() => window.open(helloAssoEmbedUrl, '_blank')}>
                  Ouvrir HelloAsso dans un nouvel onglet
                </Button>
              </div>
            </div>
            <div className="mt-3 text-muted">Nous détecterons le paiement automatiquement (webhook). Cette page vérifiera périodiquement si le paiement a été enregistré.</div>
          </Card.Body>
        </Card>
      )}

      {step === 3 && (
        <Card className="mb-3">
          <Card.Body>
            {paid ? (
              <>
                <h5>✅ Inscription confirmée</h5>
                <div>Vous êtes inscrit·e pour le tabagns : <strong>{restoRow?.tabagns}</strong></div>
              </>
            ) : (
              <>
                <h5>En attente de paiement</h5>
                <div>Nous n'avons pas encore reçu la confirmation de paiement. Si vous avez payé, attendez une minute ou contactez le support.</div>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
