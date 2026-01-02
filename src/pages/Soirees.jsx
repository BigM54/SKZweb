import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

export default function Soirees() {
  const soirees = [
    {
      id: 1,
      title: "FEST'KZ",
      poster: '/festkz.jpeg',
      date: "Dimanche 18 janvier",
      time: "20h30 - 00h30",
      description: "Le FestKZ est l’événement à ne pas rater de la semaine SKZ. Une soirée digne d’un festival avec une Line up internationale, une scène gigantesque et un système son incroyable.",
      highlights: ["Une scène unique au milieu des montagnes", "Une line-up d’artistes avec des DJ’s internationaux.", "La soirée festival de SKZ."],
      location: "Village SKZ"
    },
    {
      id: 2,
      title: "Soirée Em’ss",
      poster: '/ems.jpeg',
      date: "Lundi 19 janvier",
      time: "20h30 - 00h30",
      description: "Premiere soirée au foy’s ou les groupes de musiques de chaque TBK’s vont partager un moment musical en montrant aux autres le savoir faire de leur Tabagn’s.",
      highlights: ["La soirée d’ouverture du foy’s.", "7 groupes de musiques.", "Ambiance rock/jazz"],
      location: "Foy's SKZ"
    },
    {
      id: 3,
      title: "Soirée Fluo",
      poster: '/fluo_party.jpeg',
      date: "Mardi 20 janvier",
      time: "20h30 - 00h30",
      description: "Skioz'Arts ne serait pas complet sans sa mythique Soirée Fluo !.",
      highlights: ["Une soirée haute en couleurs où tout brille sous les lumières UV. Vous êtes invités à venir vêtus de tenues fluorescentes et à profiter du bar à maquillage fluo pour compléter votre look avant de rejoindre la piste de danse."],
      location: "Foy's SKZ"
    },
    {
      id: 4,
      title: "Soirée Boiler Room",
      poster: '/boiler_room.jpeg',
      date: "Jeudi 22 janvier",
      time: "20h30 - 00h30",
      description: "Une des nouveautés de cette année : La Boiler Room, un concept mondialement reconnu qui fait vibrer les clubs les plus emblématiques et qui s’installe exceptionnellement au foy’ss.",
      highlights: ["La disposition du Foy’ss modifiée pour la soirée", "Un DJ booth au centre du public, fidèle à l’esprit Boiler Room", "Ambiance brute et immersive, où la proximité entre artistes et public crée une énergie incroyable"],
      location: "Foy's SKZ"
    }
    ,
    {
      id: 5,
      title: "Soirée Grotte du Yéti",
      poster: '/grotte.jpeg',
      date: "Mercredi 21 janvier 2026",
      time: "21h30 - 01h30",
      description: "Une des nouveautés de cette année : Le partenariat avec la Grotte du Yéti, une chaîne de bar d’afterski d’altitude présente aux 2 Alpes, Risoul, Les Arcs et cette année pour la première fois à La Plagne, avec des offres inédites.",
      highlights: ["DJ contest dans la Grotte du Yéti", "Tarifs préférentiels avec la carte grotte et la beer card (voir Instagram)", "Ambiance brute et immersive, le lieu est fait pour faire la fête"],
      location: "La Grotte du Yéti"
    }
  ];

  return (
    <Container fluid style={{ background: '#0d1c31', padding: '2rem 0 2rem 0' }}>
      <Row className="justify-content-center g-1 w-100">
        {soirees.map((card) => (
          <Col key={card.title} xs={12} md={8} lg={8} xl={5} className="d-flex justify-content-center" style={{ minWidth: 520, maxWidth: 1000, margin: '0 1vw 2.5rem 1vw' }}>
            <Card className="shadow-sm border-0 animation-card" style={{ background: '#00314f', color: '#fff', borderRadius: 18, boxShadow: '0 2px 18px #0002', maxWidth: 1000 }}>
                  {card.poster && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                      <img src={card.poster} alt={`${card.title} poster`} style={{ width: '350px', height: '510px', objectFit: 'cover', borderRadius: 10, boxShadow: '0 2px 10px #0006' }} />
                    </div>
                  )}
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
