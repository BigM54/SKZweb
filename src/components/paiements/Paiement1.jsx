import { Card, Alert, Spinner, Button } from 'react-bootstrap';
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


export default function Paiement1() {
  const { user, isLoaded } = useUser();
  const [hasPaid, setHasPaid] = useState(null); 
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [step, setStep] = useState(0); // 0: avertissement, 1: paiement
  const [canConfirm, setCanConfirm] = useState(false);
  const { getToken } = useAuth();
  const [datePaiement1, setDatePaiement1] = useState(null);
  const [paiementOuvert, setPaiementOuvert] = useState(true);
  const [emailInput, setEmailInput] = useState("");

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
        .select('paiement1Statut')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur Supabase :', error);
      }

      setHasPaid(data?.paiement1Statut === true);

    };

    const fetchDatePaiement1 = async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('datePaiement')
        .select('Paiement1')
        .eq('id', 1)
        .single();
      if (!error && data?.Paiement1) {
        setDatePaiement1(data.Paiement1);
        setPaiementOuvert(new Date() > new Date(data.Paiement1));
      }
    };
    
    fetchDatePaiement1();
    checkPayment();
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
      const haWidgetElement = document.getElementById('haWidgetPaiement1');
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

  const email = user?.primaryEmailAddress?.emailAddress || '';

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
    }
  };

  if (!isLoaded || hasPaid === null) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>1er Paiement (200€)</Card.Title>
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  if (hasPaid) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>1er Paiement (200€)</Card.Title>
          <Alert variant="success">
            ✅ Tu as déjà effectué ce paiement. Merci !
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!paiementOuvert) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>1er Paiement (200€)</Card.Title>
          <Alert variant="info">
            Le paiement n'est pas encore ouvert.<br />
            Ouverture prévue le <span dangerouslySetInnerHTML={{__html: datePaiement1 ? formatDateLong(datePaiement1) : '...'}} /> <br />
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (step === 0) {
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
                href="https://www.helloasso.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/1er-echelon-skz"
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
            id="haWidgetPaiement1"
            allowTransparency="true"
            src="https://www.helloasso.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/1er-echelon-skz/widget"
            style={{
              width: '100%',
              minHeight: '700px',
              border: 'none',
              display: 'block',
            }}
            title="1er Paiement"
          />
        )}
      </div>
    );
  }

  return null;
}
