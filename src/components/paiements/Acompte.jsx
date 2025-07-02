import { Card, Alert, Spinner } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function Acompte() {
  const { user, isLoaded } = useUser();
  const [hasPaid, setHasPaid] = useState(null); 
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const { getToken } = useAuth();

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

      const hasPaid = data?.acompteStatut === true;
      setHasPaid(hasPaid);
    };

    checkPayment();
  }, [isLoaded, user]);

  useEffect(() => {
    const resizeIframe = (e) => {
      const dataHeight = e.data.height;
      const haWidgetElement = document.getElementById('haWidget');
      if (haWidgetElement && dataHeight) {
        haWidgetElement.style.height = dataHeight + 'px';
        setWidgetLoaded(true);
      }
    };

    window.addEventListener('message', resizeIframe);

    const timeout = setTimeout(() => {
      if (!widgetLoaded) setHasTimedOut(true);
    }, 15000);

    return () => {
      window.removeEventListener('message', resizeIframe);
      clearTimeout(timeout);
    };
  }, [widgetLoaded]);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Acompte</Card.Title>

        {!isLoaded || hasPaid === null ? (
          <Spinner animation="border" />
        ) : hasPaid ? (
          <Alert variant="success">
            ✅ Tu as déjà payé ton acompte. Merci !
          </Alert>
        ) : hasTimedOut ? (
          <Alert variant="danger" className="mt-3">
            ❌ Le formulaire de paiement n’a pas pu être chargé. Vérifie ta connexion ou réessaie plus tard.
          </Alert>
        ) : (
          <>
            <Card.Text>
              Tu peux régler ton acompte en ligne via le formulaire ci-dessous :
            </Card.Text>
            <iframe
              id="haWidget" allowtransparency="true" src="https://www.helloasso-sandbox.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/acompte-skz/widget" style="width: 100%; border: none;" onload="window.addEventListener( 'message', e => { const dataHeight = e.data.height; const haWidgetElement = document.getElementById('haWidget'); haWidgetElement.height = dataHeight + 'px'; } )" 
            />
          </>
        )}
      </Card.Body>
    </Card>
  );
}
