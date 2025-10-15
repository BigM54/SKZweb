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

export default function Paiement3() {
  const { user, isLoaded } = useUser();
  const [hasPaid, setHasPaid] = useState(null); 
  const [fraude, setFraude] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [step, setStep] = useState(0); // 0: avertissement, 1: paiement
  const [canConfirm, setCanConfirm] = useState(false);
  const [montant, setMontant] = useState(null); // <-- Ajout pour stocker paiement3Montant
  const [montantSaisi, setMontantSaisi] = useState("");
  const [hasPaid1, setHasPaid1] = useState(null); // Paiement 1 status
  const [hasPaid2, setHasPaid2] = useState(null); // Paiement 2 status
  const { getToken } = useAuth();
  const [datePaiement3, setDatePaiement3] = useState(null);
  const [paiementOuvert, setPaiementOuvert] = useState(true);


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
        .select('paiement3Recu,paiement3Montant,Fraude,paiement1Statut,paiement2Statut')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur Supabase :', error);
      }

      setHasPaid1(data?.paiement1Statut === true);
      setHasPaid2(data?.paiement2Statut === true);
      setHasPaid(Number(data?.paiement3Recu) > 0);
      setFraude(data?.Fraude === true);
      setMontant(data?.paiement3Montant ?? null);

    };

    const fetchDatePaiement3 = async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('datePaiement')
        .select('Paiement3')
        .eq('id', 1)
        .single();
      if (!error && data?.Paiement3) {
        setDatePaiement3(data.Paiement3);
        setPaiementOuvert(new Date() > new Date(data.Paiement3));
      }
    };
    
    fetchDatePaiement3();
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
      const haWidgetElement = document.getElementById('haWidgetPaiement3');
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

  const montantAffiche = montant !== null && montant !== undefined ? montant : "";

  if (!isLoaded || hasPaid === null || hasPaid1 === null || hasPaid2 === null) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>3ème Paiement ({montantAffiche}€)</Card.Title>
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  if (!paiementOuvert) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>3ème Paiement ({montantAffiche}€)</Card.Title>
          <Alert variant="info">
            Le paiement n'est pas encore ouvert.<br />
            Ouverture prévue le <span dangerouslySetInnerHTML={{__html: datePaiement3 ? formatDateLong(datePaiement3) : '...'}} /> <br />
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!hasPaid1 || !hasPaid2) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>3ème Paiement ({montantAffiche}€)</Card.Title>
          <Alert variant="warning">
            ⚠️ Tu dois d'abord effectuer les paiements précédents avant d'accéder à ce paiement.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (fraude) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>3ème Paiement ({montantAffiche}€)</Card.Title>
          <Alert variant="danger">
            ❌ Le montant reçu ne correspond pas au montant demandé. Merci de contacter l'organisation.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress || '';

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
    }
  };

  if (hasPaid) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>3ème Paiement ({montantAffiche}€)</Card.Title>
          <Alert variant="success">
            ✅ Tu as déjà effectué ce paiement. Merci !
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
            <div className="mt-2">
              <b>💡 Le montant payé sera automatiquement vérifié par le système.</b>
            </div>
            <div className="mt-2">
              <b> Somme a payer : ({montantAffiche}€)</b>
            </div>
          </Alert>
          <div className="mb-2">
            <Button
              variant="outline-primary"
              onClick={handleCopyEmail}
              size="sm"
            >
              Copier mon mail
            </Button>
          </div>
          <div className="mb-2">
            <label htmlFor="montant-confirm" className="form-label">
              Pour confirmer, entre le montant à payer :
            </label>
            <input
              id="montant-confirm"
              type="number"
              className="form-control"
              style={{ maxWidth: 200, margin: "0 auto" }}
              value={montantSaisi}
              onChange={e => setMontantSaisi(e.target.value)}
              placeholder={`Montant attendu : ${montantAffiche}€`}
              min={0}
            />
          </div>
          <Button
            variant="primary"
            disabled={
              !canConfirm ||
              String(montantSaisi).trim() === "" ||
              Number(montantSaisi) !== montantAffiche
            }
            onClick={() => setStep(1)}
          >
            J'ai compris, accéder au paiement
          </Button>
          {!canConfirm && (
            <div className="mt-2 text-muted" style={{ fontSize: '0.9em' }}>
              Le bouton sera disponible dans 5 secondes…
            </div>
          )}
          {String(montantSaisi).trim() !== "" && Number(montantSaisi) !== montantAffiche && (
            <div className="mt-2 text-danger" style={{ fontSize: '0.95em' }}>
              Le montant saisi ne correspond pas au montant attendu.
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
                href="https://www.helloasso-sandbox.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/paiement-3-skz/formulaire"
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
            id="haWidgetPaiement3"
            allowTransparency="true"
            src="https://www.helloasso-sandbox.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/paiement-3-skz/widget"
            style={{
              width: '100%',
              minHeight: '700px',
              border: 'none',
              display: 'block',
            }}
            title="3ème Paiement"
          />
        )}
      </div>
    );
  }

  return null;
}
