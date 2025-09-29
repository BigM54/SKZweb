import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

export default function Soirees() {
  const soirees = [
    {
      id: 1,
      title: "FEST'KZ",
      date: "Dimanche 18 janvier",
      time: "20h30 - 00h30",
      description: "Le FestKZ est l’événement à ne pas rater de la semaine SKZ. Une soirée digne d’un festival avec une Line up internationale, une scène gigantesque et un système son incroyable.",
      highlights: ["Une scène unique au milieu des montagnes", "Une line-up d’artistes avec des DJ’s internationaux.", "La soirée festival de SKZ."],
      location: "Village SKZ"
    },
    {
      id: 2,
      title: "Soirée Em’ss",
      date: "Lundi 19 janvier",
      time: "20h30 - 00h30",
      description: "Premiere soirée au foy’s ou les groupes de musiques de chaque TBK’s vont partager un moment musical en montrant aux autres le savoir faire de leur Tabagn’s.",
      highlights: ["La soirée d’ouverture du foy’s.", "7 groupes de musiques.", "Ambiance rock/jazz"],
      location: "Foy's SKZ"
    },
    {
      id: 3,
      title: "Soirée Fluo",
      date: "Mardi 20 janvier",
      time: "20h30 - 00h30",
      description: "Skioz'Arts ne serait pas complet sans sa mythique Soirée Fluo !.",
      highlights: ["Ambiance lumineuse et festive au foy’s avec éclairage UV", "Du bodypainting et accessoires fluo pour briller sous les UV", "Une ambiance unique où chacun devient une partie du spectacle","Dress code néon/fluo encourag"],
      location: "Foy's SKZ"
    },
    {
      id: 4,
      title: "Soirée Boiler Room",
      date: "Jeudi 22 janvier",
      time: "20h30 - 00h30",
      description: "Une des nouveautés de cette année : La Boiler Room, un concept mondialement reconnu qui fait vibrer les clubs les plus emblématiques et qui s’installe exceptionnellement au foy’ss.",
      highlights: ["La disposition du Foy’ss modifiée pour la soirée", "Un DJ booth au centre du public, fidèle à l’esprit Boiler Room", "Ambiance brute et immersive, où la proximité entre artistes et public crée une énergie incroyable"],
      location: "Foy's SKZ"
    }
  ];

  return (
    <Container fluid style={{ background: '#0d1c31', padding: '2rem 0 2rem 0' }}>
      <Row className="justify-content-center g-1 w-100">
        {soirees.map((card) => (
          <Col key={card.title} xs={12} md={8} lg={8} xl={5} className="d-flex justify-content-center" style={{ minWidth: 520, maxWidth: 1000, margin: '0 1vw 2.5rem 1vw' }}>
            <Card className="shadow-sm border-0 animation-card" style={{ background: '#00314f', color: '#fff', borderRadius: 18, boxShadow: '0 2px 18px #0002', maxWidth: 1000 }}>
              <Card.Body className="d-flex flex-column">
                <div style={{ marginBottom: '1.2rem' }}>
                  <Card.Title className="mb-3" style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '1px', lineHeight: 1.1 }}>{card.title}</Card.Title>
                  <div style={{ fontSize: '1.05rem', fontWeight: 500, marginTop: 8, marginBottom: 8, lineHeight: 1.7 }}>
                    <div><span role="img" aria-label="lieu">📍</span> {card.location}</div>
                    <div><span role="img" aria-label="date">📅</span> {card.date}</div>
                    <div><span role="img" aria-label="heure">🕒</span> {card.time}</div>
                  </div>
                </div>
                <Card.Text className="flex-grow-1" style={{ color: '#fff'}}>
                  {card.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
