import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const cards = [
  {
    title: 'Les Stands fast food',
    img: '/stand_bouffe.jpeg',
    desc: "Des stands pour te régaler tous les soirs !"
  },
  {
    title: 'After ski et soirée festival',
    img: '/village_festival.jpeg',
    desc: "Le Village s’anime dès la fin des pistes avec des after ski festifs !"
  },
  {
    title: 'Bar du village',
    img: '/village_bar.jpg',
    desc: "Un espace convivial pour partager un verre entre ch'ticop's"
  },
  {
    title: 'Les Défis & Jeux du village',
    img: '/village_jeux.jpg',
    desc: "Des animations, défis et jeux pour tous"
  },
];

export default function Village() {
  return (
    <div style={{ background: '#0d1c31', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Image top full width */}
      <div style={{
        width: '100vw',
        maxWidth: '100vw',
        height: '45vw',
        minHeight: 860,
        maxHeight: 860,
        backgroundImage: 'url("/village.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          background: 'linear-gradient(180deg,rgba(13,28,49,0) 60%,#0d1c31 100%)',
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: '60%',
        }} />
        <h1 style={{
          color: '#fff',
          fontWeight: 800,
          fontSize: '2.5rem',
          letterSpacing: '1px',
          margin: 0,
          padding: '2.5vw 0 2vw 0',
          position: 'relative',
          zIndex: 2,
          textShadow: '0 2px 16px #000',
        }}>
          Le Village SKZ
        </h1>
      </div>
      {/* Texte d'intro */}
      <div style={{ width: '100vw', maxWidth: '100vw', background: '#0d1c31', color: '#fff', textAlign: 'center', padding: '2.5rem 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 400 }}>
        Avec ses 550 m² d’espace, le Village est le véritable point de ralliement du séjour. Ouvert toute la journée, il accueille les étudiants dans une ambiance conviviale, que ce soit pour se retrouver entre amis, faire une pause après le ski ou prolonger la fête jusqu’au bout de la nuit.
      </div>
      {/* Cartes Village */}
      <Container fluid style={{ background: '#0d1c31', padding: '2rem 0 2rem 0' }}>
        <Row className="justify-content-center g-1 w-100">
          {cards.map((card) => (
            <Col key={card.title} xs={12} md={8} lg={8} xl={5} className="d-flex justify-content-center" style={{ minWidth: 520, maxWidth: 1000, margin: '0 1vw 2.5rem 1vw' }}>
              <Card className="shadow-sm border-0 animation-card" style={{ background: '#00314f', color: '#fff', borderRadius: 18, boxShadow: '0 2px 18px #0002', maxWidth: 1000 }}>
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <Card.Img
                    variant="top"
                    src={card.img}
                    alt={card.title}
                    style={{
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <Card.Title className="h5 mb-2">{card.title}</Card.Title>
                  </div>
                  <Card.Text className="flex-grow-1" style={{ color: '#fff'}}>
                    {card.desc}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
