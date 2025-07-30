import React from 'react';
import { Container, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';

export default function Village() {
  const zones = [
    {
      id: 1,
      title: "🏠 Zone Hébergement",
      description: "Des chalets confortables au cœur des montagnes",
      features: [
        "Chalets 4-8 personnes tout équipés",
        "Literie de qualité hôtelière",
        "Cuisinette avec réfrigérateur",
        "Salle de bain privative",
        "Terrasse avec vue montagne",
        "Wifi haut débit gratuit"
      ],
      image: "/baniere-lowres.jpeg",
      color: "success"
    },
    {
      id: 2,
      title: "🍽️ Zone Restauration",
      description: "Une expérience culinaire variée et savoureuse",
      features: [
        "Restaurant principal 300 places",
        "Snack-bar d'altitude",
        "Bar à tapas en soirée",
        "Food trucks spécialisés",
        "Cuisine locale et internationale",
        "Options végétariennes/vegan"
      ],
      image: "/baniere-lowres.jpeg",
      color: "warning"
    },
    {
      id: 3,
      title: "🎿 Zone Sports d'Hiver",
      description: "Tout l'équipement pour profiter des pistes",
      features: [
        "Location skis/snowboard",
        "Magasin de sport complet",
        "Réparation matériel express",
        "Vestiaires chauffés",
        "Consignes à skis sécurisées",
        "École de ski partenaire"
      ],
      image: "/baniere-lowres.jpeg",
      color: "primary"
    },
    {
      id: 4,
      title: "🎭 Zone Animation",
      description: "Le cœur de la vie sociale du village",
      features: [
        "Salle de spectacle 400 places",
        "Club de nuit avec DJ",
        "Salles de jeux et billard",
        "Espace karaoké",
        "Terrasse d'animation",
        "Scène extérieure"
      ],
      image: "/baniere-lowres.jpeg",
      color: "danger"
    },
    {
      id: 5,
      title: "💪 Zone Bien-être",
      description: "Détente et récupération après l'effort",
      features: [
        "Spa avec sauna et hammam",
        "Piscine chauffée couverte",
        "Jacuzzi extérieur",
        "Salle de fitness équipée",
        "Massages et soins",
        "Espace relaxation"
      ],
      image: "/baniere-lowres.jpeg",
      color: "info"
    },
    {
      id: 6,
      title: "🛍️ Zone Services",
      description: "Tous les services pour un séjour parfait",
      features: [
        "Supérette de proximité",
        "Pharmacie et infirmerie",
        "Bureau d'information",
        "Service de conciergerie",
        "Laverie automatique",
        "Point poste et banque"
      ],
      image: "/baniere-lowres.jpeg",
      color: "secondary"
    }
  ];

  const activites = [
    { icon: "⛷️", title: "Ski alpin", description: "200km de pistes tous niveaux" },
    { icon: "🏂", title: "Snowboard", description: "Snowpark et halfpipe" },
    { icon: "🛷", title: "Luge", description: "Piste de luge de 2km" },
    { icon: "❄️", title: "Raquettes", description: "Sentiers balisés en forêt" },
    { icon: "🧗", title: "Escalade sur glace", description: "Mur d'escalade naturel" },
    { icon: "🚁", title: "Héliski", description: "Sorties hors-piste exceptionnelles" },
    { icon: "🎣", title: "Pêche sur glace", description: "Lac gelé équipé" },
    { icon: "🏔️", title: "Randonnée glaciaire", description: "Avec guide haute montagne" }
  ];

  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="justify-content-center w-100">
        <Col lg={11}>
          {/* En-tête de la page */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-4">🏔️ Le Village SKZ 2026</h1>
            <p className="lead text-muted">
              Découvrez notre village exclusif niché au cœur des Alpes. Un lieu unique pensé pour votre confort et votre plaisir, 
              avec toutes les infrastructures nécessaires pour un séjour d'exception.
            </p>
          </div>

          {/* Vue d'ensemble */}
          <Card className="mb-5 shadow-sm border-0">
            <Row className="g-0">
              <Col md={6}>
                <img 
                  src="/baniere-lowres.jpeg" 
                  alt="Vue d'ensemble du village"
                  style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                />
              </Col>
              <Col md={6}>
                <Card.Body className="h-100 d-flex flex-column justify-content-center">
                  <h3 className="text-primary mb-3">🎯 Notre concept</h3>
                  <p>
                    Le Village SKZ 2026 est un resort complet de 15 hectares situé à 1800m d'altitude. 
                    Conçu spécialement pour accueillir notre communauté, il combine l'authenticité montagnarde 
                    avec le confort moderne.
                  </p>
                  <div className="mt-3">
                    <Badge bg="primary" className="me-2">Altitude 1800m</Badge>
                    <Badge bg="success" className="me-2">500 lits</Badge>
                    <Badge bg="warning" className="me-2">15 hectares</Badge>
                    <Badge bg="info">6 zones thématiques</Badge>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>

          {/* Les zones du village */}
          <div className="mb-5">
            <h2 className="text-center mb-4 text-primary">🗺️ Les Zones du Village</h2>
            <Row className="g-4">
              {zones.map((zone) => (
                <Col key={zone.id} lg={6}>
                  <Card className="h-100 shadow-sm border-0 animation-card">
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <Card.Img 
                        variant="top" 
                        src={zone.image} 
                        alt={zone.title}
                        style={{ 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Card.Title className="h5 mb-0">{zone.title}</Card.Title>
                        <Badge bg={zone.color}>Zone {zone.id}</Badge>
                      </div>
                      <Card.Text className="text-muted mb-3">
                        {zone.description}
                      </Card.Text>
                      <ListGroup variant="flush">
                        {zone.features.map((feature, idx) => (
                          <ListGroup.Item key={idx} className="px-0 py-1 border-0">
                            <small className="text-muted">✓ {feature}</small>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Activités disponibles */}
          <div className="mb-5">
            <h2 className="text-center mb-4 text-primary">🎯 Activités au Village</h2>
            <Row className="g-3">
              {activites.map((activite, index) => (
                <Col key={index} sm={6} lg={3}>
                  <Card className="h-100 text-center border-0 shadow-sm animation-card">
                    <Card.Body>
                      <div style={{ fontSize: '2.5rem' }} className="mb-2">
                        {activite.icon}
                      </div>
                      <Card.Title className="h6">{activite.title}</Card.Title>
                      <Card.Text className="text-muted small">
                        {activite.description}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Informations pratiques */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">📋 Informations Pratiques</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6 className="text-primary">🚗 Accès</h6>
                  <ul className="list-unstyled small">
                    <li>• Navettes depuis la gare</li>
                    <li>• Parking gratuit 300 places</li>
                    <li>• Transfert aéroport organisé</li>
                    <li>• GPS : Coordonnées fournies</li>
                  </ul>
                </Col>
                <Col md={4}>
                  <h6 className="text-primary">🕐 Horaires</h6>
                  <ul className="list-unstyled small">
                    <li>• Accueil 24h/24</li>
                    <li>• Restaurant 7h-23h</li>
                    <li>• Spa 9h-21h</li>
                    <li>• Animations 20h-2h</li>
                  </ul>
                </Col>
                <Col md={4}>
                  <h6 className="text-primary">📞 Services</h6>
                  <ul className="list-unstyled small">
                    <li>• Conciergerie disponible</li>
                    <li>• Infirmerie sur place</li>
                    <li>• Service technique 24h/24</li>
                    <li>• Wifi gratuit partout</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
