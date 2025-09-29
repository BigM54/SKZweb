import { Container, Row, Col, Card } from "react-bootstrap";

export default function Contact() {
  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <h1 className="mb-4 text-center">Contact</h1>
      <Row className="justify-content-center g-4 w-100">
        <Col xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
          <Card>
            <Card.Body>
              <Card.Title>Sponsors</Card.Title>
              <Card.Text>
                Pour toute question liée aux sponsors, contactez :<br />
                <a href="tel:0782861927"><b>07 82 86 19 27</b></a><br />
                ou par mail : <a href="mailto:skz.ue@gadz.org">skz.ue@gadz.org</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
          <Card>
            <Card.Body>
              <Card.Title>Informatique</Card.Title>
              <Card.Text>
                Pour toute difficulté technique ou bug sur le site, contactez :<br />
                <a href="tel:0769394470"><b>07 69 39 44 70</b></a><br />
                ou par mail : <a href="mailto:skz.ue@gadz.org">skz.ue@gadz.org</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
          <Card>
            <Card.Body>
              <Card.Title>Financement</Card.Title>
              <Card.Text>
                Pour toute question concernant le paiement ou un souci financier, contactez :<br />
                <a href="tel:0767436024"><b>07 67 43 60 24</b></a><br />
                ou par mail : <a href="mailto:skz.ue@gadz.org">skz.ue@gadz.org</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
          <Card>
            <Card.Body>
              <Card.Title>Autre question</Card.Title>
              <Card.Text>
                Pour toute autre demande, contactez :<br />
                <a href="tel:0665243376"><b>06 65 24 33 76</b></a><br />
                ou par mail : <a href="mailto:skz.ue@gadz.org">skz.ue@gadz.org</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}