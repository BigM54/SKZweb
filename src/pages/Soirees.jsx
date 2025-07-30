import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

export default function Soirees() {
  const soirees = [
    {
      id: 1,
      title: "Soirée d'Ouverture",
      date: "Vendredi 7 Février",
      time: "20h00 - 02h00",
      theme: "Welcome Party",
      description: "Lancement officiel du SKZ 2026 ! Une soirée pour se rencontrer, faire connaissance et commencer cette aventure ensemble.",
      highlights: ["DJ Set", "Cocktails de bienvenue", "Animation surprise"],
      image: "/baniere-lowres.jpeg",
      location: "Grande salle du village",
      dress: "Tenue décontractée"
    },
    {
      id: 2,
      title: "Soirée Années 80",
      date: "Samedi 8 Février",
      time: "21h00 - 03h00",
      theme: "Retro Night",
      description: "Remontez le temps avec une soirée 100% années 80 ! Musique, ambiance et costumes d'époque au programme.",
      highlights: ["Playlist 80's", "Concours de déguisements", "Karaoké vintage"],
      image: "/baniere-lowres.jpeg",
      location: "Club du village",
      dress: "Costume années 80 obligatoire !"
    },
    {
      id: 3,
      title: "Soirée Blanche",
      date: "Dimanche 9 Février",
      time: "19h30 - 01h00",
      theme: "White Party",
      description: "Élégance et raffinement pour cette soirée entièrement en blanc. Dîner gastronomique suivi d'une soirée dansante.",
      highlights: ["Dîner 3 services", "DJ professionnel", "Bar à champagne"],
      image: "/baniere-lowres.jpeg",
      location: "Restaurant panoramique",
      dress: "Tenue blanche chic"
    },
    {
      id: 4,
      title: "Soirée Tyrolienne",
      date: "Lundi 10 Février",
      time: "20h00 - 02h00",
      theme: "Oktoberfest en montagne",
      description: "Ambiance bavaroise au cœur des Alpes ! Bière, musique traditionnelle et ambiance chaleureuse garanties.",
      highlights: ["Musique folk", "Spécialités bavaroises", "Concours de yodel"],
      image: "/baniere-lowres.jpeg",
      location: "Chalet traditionnel",
      dress: "Dirndl & Lederhosen recommandés"
    },
    {
      id: 5,
      title: "Soirée Electro",
      date: "Mardi 11 Février",
      time: "22h00 - 04h00",
      theme: "Electronic Night",
      description: "Pour les amateurs de musique électronique ! Une soirée avec des DJ sets endiablés et une ambiance survoltée.",
      highlights: ["DJ invités", "Light show", "Dancefloor géant"],
      image: "/baniere-lowres.jpeg",
      location: "Nightclub du resort",
      dress: "Tenue de soirée tendance"
    },
    {
      id: 6,
      title: "Soirée de Clôture",
      date: "Mercredi 12 Février",
      time: "19h00 - 03h00",
      theme: "Grand Finale",
      description: "La dernière soirée pour finir en beauté ! Remise des prix, spectacle final et moments inoubliables.",
      highlights: ["Remise des prix", "Spectacle surprise", "Feu d'artifice"],
      image: "/baniere-lowres.jpeg",
      location: "Esplanade centrale",
      dress: "Tenue de gala"
    }
  ];

  const getThemeColor = (theme) => {
    const colors = {
      "Welcome Party": "primary",
      "Retro Night": "warning",
      "White Party": "light",
      "Oktoberfest en montagne": "success",
      "Electronic Night": "dark",
      "Grand Finale": "danger"
    };
    return colors[theme] || "secondary";
  };

  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="justify-content-center w-100">
        <Col lg={10}>
          {/* En-tête de la page */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-4">🎉 Les Soirées SKZ 2026</h1>
            <p className="lead text-muted">
              Six soirées exceptionnelles pour vivre des moments inoubliables ! 
              Chaque soir, une ambiance différente vous attend pour faire de votre séjour une expérience unique.
            </p>
          </div>

          {/* Liste des soirées */}
          <Row className="g-4">
            {soirees.map((soiree, index) => (
              <Col key={soiree.id} md={6}>
                <Card className="h-100 shadow-sm border-0 animation-card">
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <Card.Img 
                      variant="top" 
                      src={soiree.image} 
                      alt={soiree.title}
                      style={{ 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <Badge bg={getThemeColor(soiree.theme)} className="mb-2">
                        {soiree.theme}
                      </Badge>
                      <Card.Title className="h5">{soiree.title}</Card.Title>
                      <div className="text-muted mb-2">
                        <small>📅 {soiree.date}</small><br />
                        <small>⏰ {soiree.time}</small><br />
                        <small>📍 {soiree.location}</small>
                      </div>
                    </div>
                    
                    <Card.Text className="flex-grow-1">
                      {soiree.description}
                    </Card.Text>
                    
                    <div className="mt-auto">
                      <div className="mb-3">
                        <h6 className="fw-bold text-primary">🎯 Au programme :</h6>
                        <ul className="list-unstyled mb-0">
                          {soiree.highlights.map((highlight, idx) => (
                            <li key={idx} className="text-muted">
                              <small>• {highlight}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-2 bg-light rounded">
                        <small className="text-muted">
                          <strong>👗 Dress code :</strong> {soiree.dress}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Information complémentaire */}
          <div className="mt-5 p-4 bg-light rounded">
            <Row>
              <Col md={6}>
                <h5 className="text-primary">📝 Informations pratiques</h5>
                <ul className="list-unstyled">
                  <li>• Toutes les soirées sont incluses dans votre forfait</li>
                  <li>• Les boissons alcoolisées sont en supplément</li>
                  <li>• Respect du dress code obligatoire</li>
                  <li>• Accès libre pour tous les participants SKZ</li>
                </ul>
              </Col>
              <Col md={6}>
                <h5 className="text-primary">🎫 Réservations spéciales</h5>
                <ul className="list-unstyled">
                  <li>• Dîner gastronomique (Soirée Blanche)</li>
                  <li>• Tables VIP disponibles</li>
                  <li>• Service de navettes nocturnes</li>
                  <li>• Vestiaire sécurisé inclus</li>
                </ul>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
