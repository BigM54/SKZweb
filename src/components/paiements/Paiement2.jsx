import { Card, Alert, Spinner, Button, Form, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const jours = [
    "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"
  ];
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  return `<b>${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()} à ${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}</b>`;
}

export default function Paiement2() {
  const { user, isLoaded } = useUser();
  const [hasPaid, setHasPaid] = useState(null); 
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [step, setStep] = useState(0); // 0: avertissement, 1: paiement
  const [canConfirm, setCanConfirm] = useState(false);
  const [hasPaid1, setHasPaid1] = useState(null); // Paiement 1 status
  const { getToken } = useAuth();
  const [datePaiement2, setdatePaiement2] = useState(null);
  const [paiementOuvert, setPaiementOuvert] = useState(true);
  const [emailInput, setEmailInput] = useState("");

  // Profile form states
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [taille, setTaille] = useState('');
  const [taillePied, setTaillePied] = useState('');
  const [rue, setRue] = useState('');
  const [rueNumero, setRueNumero] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [civilite, setCivilite] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveProfileError, setSaveProfileError] = useState(null);

  const email = user?.primaryEmailAddress?.emailAddress || '';

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
    }
  };

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
    const checkPayment = async () => {

      if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) return;

      const email = user.primaryEmailAddress.emailAddress;

      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('Paiements')
        .select('paiement2Statut, paiement1Statut')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur Supabase :', error);
      }
      setHasPaid1(data?.paiement1Statut === true);
      setHasPaid(data?.paiement2Statut === true);

    };

    const fetchProfile = async () => {
      if (!isLoaded || !user?.id) return;
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('profils')
          .select('taille, taille_pied, rue, rue_numero, code_postal, ville, date_naissance, civilite')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          setTaille(data.taille ?? '');
          setTaillePied(data.taille_pied ?? '');
          setRue(data.rue ?? '');
          setRueNumero(data.rue_numero ?? '');
          setCodePostal(data.code_postal ?? '');
          setVille(data.ville ?? '');
          setDateNaissance(data.date_naissance ?? '');
          setCivilite(data.civilite ?? '');
          const complete = Boolean(
            data.taille && data.taille_pied && data.rue && data.rue_numero && data.code_postal && data.ville && data.date_naissance && data.civilite
          );
          setProfileComplete(complete);
        }
      } catch (e) {
        console.error('Erreur fetchProfile', e);
      } finally {
        setProfileLoaded(true);
      }
    };

    const fetchdatePaiement2 = async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('datePaiement')
        .select('Paiement2')
        .eq('id', 1)
        .single();
      if (!error && data?.Paiement2) {
        setdatePaiement2(data.Paiement2);
        setPaiementOuvert(new Date() > new Date(data.Paiement2));
      }
    };
    
    fetchdatePaiement2();
    checkPayment();
    fetchProfile();
  }, [isLoaded, user]);


  useEffect(() => {
    if (step === 0) {
      setCanConfirm(false);
      const timer = setTimeout(() => setCanConfirm(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step !== 1) return;

    setHasTimedOut(false);

    const resizeIframe = (e) => {
      const dataHeight = e.data.height;
      const haWidgetElement = document.getElementById('haWidgetPaiement2');
      if (haWidgetElement && dataHeight) {
        haWidgetElement.style.height = dataHeight + 'px';
        setWidgetLoaded(true);
      }
    };

    window.addEventListener('message', resizeIframe);

    const timeout = setTimeout(() => {
      if (!widgetLoaded) setHasTimedOut(true);
    }, 5000);

    return () => {
      window.removeEventListener('message', resizeIframe);
      clearTimeout(timeout);
    };
  }, [step, widgetLoaded]);

  if (!isLoaded || hasPaid === null || hasPaid1 === null) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>2ème Paiement (200€)</Card.Title>
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  if (!paiementOuvert) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>2ème Paiement (200€)</Card.Title>
          <Alert variant="info">
            Le paiement n'est pas encore ouvert.<br />
            Ouverture prévue le <span dangerouslySetInnerHTML={{__html: datePaiement2 ? formatDateLong(datePaiement2) : '...'}} /> <br />
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!hasPaid1) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>2ème Paiement (200€)</Card.Title>
          <Alert variant="warning">
            ⚠️ Tu dois d'abord effectuer le 1er paiement avant d'accéder à ce paiement.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (hasPaid) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>2ème Paiement (200€)</Card.Title>
          <Alert variant="success">
            ✅ Tu as déjà effectué ce paiement. Merci !
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (step === 0) {
    // If profile not loaded yet, show spinner in place of form/disclaimer
    if (!profileLoaded) {
      return (
        <Card className="mb-4"><Card.Body><Spinner /></Card.Body></Card>
      );
    }

    // If profile incomplete, show the mini-form before the disclaimer
    if (!profileComplete) {
      const canSave = taille.trim() && taillePied.trim() && rue.trim() && rueNumero.trim() && codePostal.trim() && ville.trim() && dateNaissance.trim() && (civilite === 'H' || civilite === 'F');
      const handleSaveProfile = async () => {
        setSaveProfileError(null);
        setSavingProfile(true);
        try {
          const supabase = await getSupabase();
          const payload = {
            id: user.id,
            taille: taille.trim(),
            taille_pied: taillePied.trim(),
            rue: rue.trim(),
            rue_numero: rueNumero.trim(),
            code_postal: codePostal.trim(),
            ville: ville.trim(),
            date_naissance: dateNaissance.trim(),
            civilite: civilite
          };
          const { error } = await supabase.from('profils').upsert([payload], { onConflict: ['id'] });
          if (error) {
            setSaveProfileError(error.message || 'Erreur enregistrement');
          } else {
            setProfileComplete(true);
          }
        } catch (e) {
          setSaveProfileError(e.message || String(e));
        } finally {
          setSavingProfile(false);
        }
      };

      return (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Informations personnelles requises</Card.Title>
            <p className="text-muted">Avant de continuer, complète ces informations (elles seront enregistrées dans ton profil).</p>
            {saveProfileError && <Alert variant="danger">{saveProfileError}</Alert>}
            <Form>
              <Row className="g-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Taille (cm)</Form.Label>
                    <Form.Control value={taille} onChange={e => setTaille(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Taille de pied (EU)</Form.Label>
                    <Form.Control value={taillePied} onChange={e => setTaillePied(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Civilité</Form.Label>
                    <Form.Select value={civilite} onChange={e => setCivilite(e.target.value)}>
                      <option value="">—</option>
                      <option value="H">H</option>
                      <option value="F">F</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Rue</Form.Label>
                    <Form.Control value={rue} onChange={e => setRue(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Nº</Form.Label>
                    <Form.Control value={rueNumero} onChange={e => setRueNumero(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Code postal</Form.Label>
                    <Form.Control value={codePostal} onChange={e => setCodePostal(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Ville</Form.Label>
                    <Form.Control value={ville} onChange={e => setVille(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Date de naissance</Form.Label>
                    <Form.Control type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-3 d-flex gap-2 align-items-center">
                <Button disabled={!canSave || savingProfile} onClick={handleSaveProfile}>{savingProfile ? 'Enregistrement...' : 'Enregistrer et continuer'}</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      );
    }

    // Profile complete: show original disclaimer UI
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Avertissement avant paiement</Card.Title>
          <Alert variant="warning">
            <ul>
              <li>
                <b>Le mail utilisé pour le paiement doit être le même que celui de ton compte !</b>
              </li>
              <li>
                <b>La contribution à HelloAsso est facultative</b> : tu peux la mettre à <b>0 €</b> si tu le souhaites, cela ne revient pas à SKZ.
              </li>
            </ul>
          </Alert>
          <div>
          <Button
            variant="outline-primary"
            onClick={handleCopyEmail}
            className="mt-2"
          >
            Copier mon mail
          </Button>
          </div>
          <div className="mt-3">
            <label htmlFor="emailConfirm" className="form-label">Entre ton mail pour confirmer</label>
            <input
              id="emailConfirm"
              type="email"
              className="form-control"
              placeholder="ton.email@exemple.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              autoComplete="email"
            />
            {emailInput && email && email.trim().toLowerCase() !== emailInput.trim().toLowerCase() && (
              <div className="text-danger mt-1" style={{ fontSize: '0.9em' }}>
                L'adresse saisie ne correspond pas à celle de ton compte.
              </div>
            )}
            {!emailInput && (
              <div className="text-muted mt-1" style={{ fontSize: '0.9em' }}>
                Saisis l’adresse e‑mail de ton compte pour débloquer le bouton.
              </div>
            )}
          </div>
          <div>
          <Button
            className="mt-2"
            variant="primary"
            disabled={!(canConfirm && email && email.trim().toLowerCase() === emailInput.trim().toLowerCase())}
            onClick={() => setStep(1)}
          >
            J'ai compris, accéder au paiement
          </Button>
          </div>
          {!canConfirm && (
            <div className="mt-2 text-muted" style={{ fontSize: '0.9em' }}>
              Le bouton sera disponible dans 5 secondes…
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }

  if (step === 1) {
    return (
      <div style={{ width: '100%', background: '#fff', padding: 0 }}>
        {hasTimedOut ? (
          <div style={{ padding: 24 }}>
            <Alert variant="danger" className="mt-3">
              ❌ Le formulaire de paiement n’a pas pu être chargé. Vérifie ta connexion ou réessaie plus tard.<br />
              Certains navigateurs peuvent empêcher l'affichage du formulaire.<br />
              <a
                href="https://www.helloasso.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/paiement-2-skz"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-2"
              >
                Ouvrir le formulaire dans un nouvel onglet
              </a>
            </Alert>
          </div>
        ) : (
          <iframe
            id="haWidgetPaiement2"
            allowTransparency="true"
            src="https://www.helloasso.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/paiement-2-skz/widget"
            style={{
              width: '100%',
              minHeight: '700px',
              border: 'none',
              display: 'block',
            }}
            title="2ème Paiement"
          />
        )}
      </div>
    );
  }

  return null;
}
