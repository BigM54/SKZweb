import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function Infos() {
  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">Informations complémentaires</h1>
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title>Plan de la station</Card.Title>
              <Card.Text>
                Voici le plan de la station de La Plagne où se déroulera le séjour :
              </Card.Text>
              <div className="text-center mb-3">
                <img
                  src="https://www.la-plagne.com/sites/la-plagne/files/styles/slider_full/public/2022-11/plan-la-plagne.png"
                  alt="Plan de la station La Plagne"
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              </div>
              <Button
                variant="primary"
                href="https://www.la-plagne.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir le site officiel de La Plagne
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title>Accès à la station</Card.Title>
              <Card.Text>
                Pour organiser votre trajet, retrouvez toutes les informations pratiques sur le site officiel de la station.
              </Card.Text>
              <Button
                variant="secondary"
                href="https://www.la-plagne.com/decouvrir-la-plagne/acces"
                target="_blank"
                rel="noopener noreferrer"
              >
                Accéder à la page "Venir à La Plagne"
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}