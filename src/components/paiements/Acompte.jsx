import { Card, Button } from 'react-bootstrap';

export default function Acompte() {
  const montant = 100;
  const dateLimite = '1er décembre';

  const handlePaiement = () => {
    alert('Redirection vers la page de paiement en ligne...');
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Acompte</Card.Title>
        <Card.Text>
          Le montant de l'acompte est de <strong>{montant}€</strong>.
          <br />
          Il est à régler avant le <strong>{dateLimite}</strong>.
        </Card.Text>
        <Button variant="primary" onClick={handlePaiement}>
          Régler mon acompte
        </Button>
      </Card.Body>
    </Card>
  );
}
