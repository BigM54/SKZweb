import { Card, Alert, Spinner } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function Paiement2() {
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
        .select('paiement2Statut')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur Supabase :', error);
      }

      const hasPaid = data?.paiement2Statut === true;
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
        <Card.Title>2ème Paiement (200€)</Card.Title>

        {!isLoaded || hasPaid === null ? (
          <Spinner animation="border" />
        ) : hasPaid ? (
          <Alert variant="success">
            ✅ Tu as déjà effectué ce paiement. Merci !
          </Alert>
        ) : hasTimedOut ? (
          <Alert variant="danger" className="mt-3">
            ❌ Le formulaire de paiement n’a pas pu être chargé. Vérifie ta connexion ou réessaie plus tard.
          </Alert>
        ) : (
          <>
            <Card.Text>
              Tu peux régler ton deuxième paiement en ligne via le formulaire ci-dessous :
            </Card.Text>
            <iframe
              id="haWidget"
              allowTransparency="true"
              src="https://www.helloasso-sandbox.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/paiement-2-skz/widget"
              style={{ width: '100%', border: 'none', height: '300px' }}
              title="2eme Paiement"
            />
          </>
        )}
      </Card.Body>
    </Card>
  );
}
