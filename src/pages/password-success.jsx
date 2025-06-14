import React from 'react';
import { Container, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

export default function PasswordSuccess() {
  const navigate = useNavigate();

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="shadow" style={{ maxWidth: 500 }}>
        <CardBody className="text-center">
          <CardTitle tag="h4" className="text-success mb-3">
            ✅ Mot de passe mis à jour
          </CardTitle>
          <CardText>
            Ton mot de passe a bien été changé. Tu peux maintenant te connecter avec tes nouvelles informations.
          </CardText>
          <Button color="primary" className="mt-3" onClick={() => navigate('/login')}>
            Retour à la connexion
          </Button>
        </CardBody>
      </Card>
    </Container>
  );
}
