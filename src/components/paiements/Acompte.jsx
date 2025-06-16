import { Card, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';

export default function Acompte() {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const resizeIframe = (e) => {
      const dataHeight = e.data.height;
      const haWidgetElement = document.getElementById('haWidget');
      if (haWidgetElement && dataHeight) {
        haWidgetElement.style.height = dataHeight + 'px';
        setWidgetLoaded(true); // ✅ Le widget est chargé
      }
    };

    window.addEventListener('message', resizeIframe);

    // Si après 5 secondes, rien n’a chargé
    const timeout = setTimeout(() => {
      if (!widgetLoaded) setHasTimedOut(true);
    }, 5000);

    return () => {
      window.removeEventListener('message', resizeIframe);
      clearTimeout(timeout);
    };
  }, [widgetLoaded]);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Acompte</Card.Title>
        <Card.Text>
          Tu peux régler ton acompte en ligne via le formulaire ci-dessous :
        </Card.Text>

        {!hasTimedOut ? (
          <iframe
            id="haWidget"
            allowTransparency="true"
            src="https://www.helloasso-sandbox.com/associations/union-des-eleves-arts-et-metiers-ueam/paiements/acompte-skz/widget"
            style={{ width: '100%', border: 'none', height: '300px' }}
            title="Paiement Acompte"
          />
        ) : (
          <Alert variant="danger" className="mt-3">
            ❌ Le formulaire de paiement n’a pas pu être chargé. Vérifie ta connexion ou réessaie plus tard.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}
