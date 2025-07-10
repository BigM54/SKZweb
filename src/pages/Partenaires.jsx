import { Card, Container, Row, Col } from "react-bootstrap";


export default function Partenaires() {
  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">Nos Partenaires & Sponsors</h1>
      <Row className="g-4 justify-content-center">
        <Col xs="auto">
        <a href="https://www.rolex.com" target="_blank" rel="noopener noreferrer">
            <img src="/Rolex.png" alt="Rolex" style={{ maxHeight: '80px', margin: '1rem' }} />
        </a>
        </Col>
        <Col xs="auto">
        <a href="https://www.gucci.com" target="_blank" rel="noopener noreferrer">
            <img src="/Gucci.png" alt="Gucci" style={{ maxHeight: '80px', margin: '1rem' }} />
        </a>
        </Col>
        <Col xs="auto">
        <a href="https://youtu.be/dQw4w9WgXcQ?si=NOz9qFdokahj36y8" target="_blank" rel="noopener noreferrer">
            <img src="/Jacquie.png" alt="Jacquie" style={{ maxHeight: '80px', margin: '1rem' }} />
        </a>
        </Col>
        <Col xs="auto">
        <a href="https://www.Bugatti.com" target="_blank" rel="noopener noreferrer">
            <img src="/Bugatti.png" alt="Bugatti" style={{ maxHeight: '80px', margin: '1rem' }} />
        </a>
        </Col>
      </Row>
    </Container>
  );
}