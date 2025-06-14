import { Card, Button } from 'react-bootstrap';

export default function Acompte() {

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Acompte</Card.Title>
        <Card.Text>
          Ce paiement n'est pas encore disponible (sois patient)
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
