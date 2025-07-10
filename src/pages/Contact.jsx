import { Container, Row, Col, Card } from "react-bootstrap";

export default function Contact() {
  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <h1 className="mb-4 text-center">Contact</h1>
      <Row className="justify-content-center g-4 w-100">
        <Col xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
          <Card>
            <Card.Body>
              <Card.Title>Problème informatique</Card.Title>
              <Card.Text>
                Pour toute difficulté technique ou bug sur le site, contactez :
                <br />
                <a href="tel:0769394470"><b>07 69 39 44 70</b></a>
                <br />
                ou par mail : <a href="mailto:info@skz.com">info@skz.com</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
          <Card>
            <Card.Body>
              <Card.Title>Problème de financement</Card.Title>
              <Card.Text>
                Pour toute question concernant le paiement ou un souci financier, contactez :
                <br />
                <a href="tel:062345XXXX"><b>06 23 45 XX XX</b></a>
                <br />
                ou par mail : <a href="mailto:finances@skz.com">finances@skz.com</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
          <Card>
            <Card.Body>
              <Card.Title>Autre question</Card.Title>
              <Card.Text>
                Pour toute autre demande, contactez :
                <br />
                <a href="tel:069876XXXX"><b>06 98 76 XX XX</b></a>
                <br />
                ou par mail : <a href="mailto:contact@skz.com">contact@skz.com</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}