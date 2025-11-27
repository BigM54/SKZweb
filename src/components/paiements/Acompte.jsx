import { Card, Alert, Spinner, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function Acompte() {
  const { user, isLoaded } = useUser();
  const [hasPaid, setHasPaid] = useState(null); 
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [step, setStep] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);
  const [acompteOuvert, setAcompteOuvert] = useState(null);
  const [dateOuverturePerso, setDateOuverturePerso] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const checkAcompteOuvert = async () => {
      if (!user) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      // 1. Récupère la prom's de l'utilisateur
      const email = user.primaryEmailAddress?.emailAddress;
      const { data: profil } = await supabase
        .from('profils')
        .select('proms')
        .eq('email', email)
        .single();

      // 2. Récupère les dates shotgun
      const { data: shotgunDates } = await supabase
        .from('dateShotgun')
        .select('*')
        .single();

      if (!profil || !shotgunDates) {
        setAcompteOuvert(false);
        return;
      }

      // 3. Détermine la colonne à utiliser selon la promo
      let dateOuverture = null;
      const promoUser = profil.proms ? Number(profil.proms) : null;
      const promoConscrits = shotgunDates.promsConscrits ? Number(shotgunDates.promsConscrits) : null;

      if (promoUser === null || promoConscrits === null) {
        dateOuverture = shotgunDates.PeksArchis;
      } else if (promoUser === promoConscrits) {
        dateOuverture = shotgunDates.Conscrits;
      } else if (promoUser === promoConscrits - 1) {
        dateOuverture = shotgunDates.Anciens;
      } else if (promoUser === promoConscrits - 2) {
        dateOuverture = shotgunDates.P3;
      } else if (promoUser <= promoConscrits - 3) {
        dateOuverture = shotgunDates.PeksArchis;
      } else {
        dateOuverture = null;
      }

      // 4. Compare la date d'ouverture à aujourd'hui
      if (dateOuverture) {
        setDateOuverturePerso(dateOuverture);
        setAcompteOuvert(new Date(dateOuverture) <= new Date());
      } else {
        setDateOuverturePerso(null);
        setAcompteOuvert(false);
      }
    };

    checkAcompteOuvert();
  }, [user, getToken]);

  useEffect(() => {
    const checkPayment = async () => {
      if (!user) return;

      const token = await getToken({ template: 'supabase' });

      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) return;

      const email = user.primaryEmailAddress.emailAddress;

      const { data, error } = await supabase
        .from('Paiements')
        .select('acompteStatut')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur Supabase :', error);
      }

      setHasPaid(data?.acompteStatut === true);
    };

    checkPayment();
  }, [isLoaded, user]);

  useEffect(() => {
    if (step === 0) {
      setCanConfirm(false);
      const timer = setTimeout(() => setCanConfirm(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Ce useEffect ne s'active que quand on est à l'étape 1 (affichage iframe)
  useEffect(() => {
    if (step !== 1) return;

    setHasTimedOut(false); // reset à chaque affichage du widget

    const resizeIframe = (e) => {
      const dataHeight = e.data.height;
      const haWidgetElement = document.getElementById('haWidgetAcompte');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, widgetLoaded]);

  const email = user?.primaryEmailAddress?.emailAddress || '';

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
    }
  };

  if (!isLoaded || acompteOuvert === null || hasPaid === null) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Acompte</Card.Title>
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  
  if (!acompteOuvert) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Acompte</Card.Title>
          <Alert variant="info">
            ⏳ Le shotgun n'est pas encore disponible pour toi.<br />
            {dateOuverturePerso && (
              <>
                Il ouvrira le&nbsp;
                <b>
                  {new Date(dateOuverturePerso).toLocaleString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </b>
                .
              </>
            )}
            <br />
            Merci de revenir plus tard.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (hasPaid) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Acompte</Card.Title>
          <Alert variant="success">
            ✅ Tu as déjà payé ton acompte. Merci !
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
          <div className="d-flex gap-2 justify-content-center mt-2">
            <Button
              variant="outline-primary"
              onClick={handleCopyEmail}
            >
              Copier mon mail
            </Button>
            <Button
              variant="primary"
              disabled={!canConfirm}
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

  // Étape 1 : affichage du widget HelloAsso en plein écran sous la navbar/bannière
  if (step === 1) {
    return (
      <div style={{ width: '100%', background: '#fff', padding: 0 }}>
        {hasTimedOut ? (
          <div style={{ padding: 24 }}>
            <Alert variant="danger" className="mt-3">
              ❌ Le formulaire de paiement n’a pas pu être chargé. Vérifie ta connexion ou réessaie plus tard.<br />
              Certains navigateurs peuvent empêcher l'affichage du formulaire.<br />
              <a
                href=""
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
            id="haWidgetAcompte"
            allowTransparency="true"
            src=""
            style={{
              width: '100%',
              minHeight: '700px',
              border: 'none',
              display: 'block',
            }}
            title="Paiement Acompte"
          />
        )}
      </div>
    );
  }

  return null;
}
