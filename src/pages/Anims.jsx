import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';

export default function Animations() {
  const [filters, setFilters] = useState({
    type: { ski: true, snowboard: true, autres: true },
    difficulte: { debutant: true, intermediaire: true, avance: true, expert: true, initiation: true }
  });

  const animations = [
    {
      id: 1,
      title: "Cours de Ski - Débutant",
      description: "Apprends les bases du ski avec nos moniteurs qualifiés. Parfait pour ceux qui n'ont jamais chaussé de skis !",
      niveau: "Débutant",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "debutant",
      category: "cours",
      image: "/baniere-lowres.jpeg",
      color: "success"
    },
    {
      id: 2,
      title: "Cours de Ski - Intermédiaire",
      description: "Perfectionne ta technique et découvre de nouvelles pistes avec plus de confiance.",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      category: "cours",
      image: "/baniere-lowres.jpeg",
      color: "warning"
    },
    {
      id: 3,
      title: "Cours de Ski - Avancé",
      description: "Maîtrise les techniques avancées et explore les pistes les plus challenging.",
      niveau: "Avancé",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "avance",
      category: "cours",
      image: "/baniere-lowres.jpeg",
      color: "danger"
    },
    {
      id: 4,
      title: "Cours de Snowboard - Débutant",
      description: "Découvre l'univers du snowboard avec nos instructeurs passionnés. Premier contact avec la planche garantie fun !",
      niveau: "Débutant",
      type: "snowboard",
      typeIcon: "🏂",
      difficulty: "debutant",
      category: "cours",
      image: "/baniere-lowres.jpeg",
      color: "success"
    },
    {
      id: 5,
      title: "Cours de Snowboard - Intermédiaire",
      description: "Développe ton style et apprends de nouveaux tricks sur les pistes bleues et rouges.",
      niveau: "Intermédiaire",
      type: "snowboard",
      typeIcon: "🏂",
      difficulty: "intermediaire",
      category: "cours",
      image: "/baniere-lowres.jpeg",
      color: "warning"
    },
    {
      id: 6,
      title: "Cours de Snowboard - Avancé",
      description: "Maîtrise les techniques avancées de carving et explore le hors-piste.",
      niveau: "Avancé",
      type: "snowboard",
      typeIcon: "🏂",
      difficulty: "avance",
      category: "cours",
      image: "/baniere-lowres.jpeg",
      color: "danger"
    },
    {
      id: 7,
      title: "Initiation Freestyle",
      description: "Découvre l'univers du freestyle : sauts, rails, boxes. Apprends tes premiers tricks en toute sécurité !",
      niveau: "Initiation",
      type: "autres",
      typeIcon: "🎢",
      difficulty: "initiation",
      category: "cours",
      image: "/baniere-lowres.jpeg",
      color: "info"
    },
    {
      id: 8,
      title: "Compétition Freestyle",
      description: "Pour les riders expérimentés qui veulent repousser leurs limites et participer aux compétitions.",
      niveau: "Expert",
      type: "autres",
      typeIcon: "🏆",
      difficulty: "expert",
      category: "competition",
      image: "/baniere-lowres.jpeg",
      color: "dark"
    },
    {
      id: 9,
      title: "Slalom",
      description: "Apprends la précision et la vitesse avec nos sessions de slalom. Technique et adrénaline garanties !",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      category: "competition",
      image: "/baniere-lowres.jpeg",
      color: "primary"
    },
    {
      id: 10,
      title: "Bordercross",
      description: "Course en groupe sur un parcours avec obstacles, virages relevés et sauts. Pure adrénaline !",
      niveau: "Avancé",
      type: "snowboard",
      typeIcon: "🏂",
      difficulty: "avance",
      category: "competition",
      image: "/baniere-lowres.jpeg",
      color: "danger"
    }
  ];

  const handleFilterChange = (filterType, filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: {
        ...prev[filterType],
        [filterKey]: !prev[filterType][filterKey]
      }
    }));
  };

  const filteredAnimations = animations.filter(anim => {
    return filters.type[anim.type] && filters.difficulte[anim.difficulty];
  });

  const getCategoryIcon = (category) => {
    return category === 'cours' ? '🎓' : '🏆';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      debutant: '🟢',
      intermediaire: '🟡', 
      avance: '🔴',
      expert: '🟣',
      initiation: '🔵'
    };
    return icons[difficulty] || '⚪';
  };

  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">🎿 Nos Animations</h1>
        <p className="lead text-muted">
          Découvre toutes les activités proposées pendant le séjour Skioz'Arts 2026 !
          <br />
          Des cours pour tous les niveaux aux activités freestyle et compétitions.
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-4 p-3 bg-light rounded w-100" style={{ maxWidth: '800px' }}>
        <h5 className="mb-3">🔍 Filtres</h5>
        <Row>
          <Col md={6}>
            <h6>Type d'activité :</h6>
            <div className="d-flex gap-3 flex-wrap mb-3">
              <Form.Check
                type="checkbox"
                id="ski-filter"
                label="⛷️ Ski"
                checked={filters.type.ski}
                onChange={() => handleFilterChange('type', 'ski')}
              />
              <Form.Check
                type="checkbox"
                id="snowboard-filter"
                label="🏂 Snowboard"
                checked={filters.type.snowboard}
                onChange={() => handleFilterChange('type', 'snowboard')}
              />
              <Form.Check
                type="checkbox"
                id="autres-filter"
                label="🎢 Autres"
                checked={filters.type.autres}
                onChange={() => handleFilterChange('type', 'autres')}
              />
            </div>
          </Col>
          <Col md={6}>
            <h6>Difficulté :</h6>
            <div className="d-flex gap-2 flex-wrap">
              <Form.Check
                type="checkbox"
                id="debutant-filter"
                label="🟢 Débutant"
                checked={filters.difficulte.debutant}
                onChange={() => handleFilterChange('difficulte', 'debutant')}
              />
              <Form.Check
                type="checkbox"
                id="intermediaire-filter"
                label="🟡 Intermédiaire"
                checked={filters.difficulte.intermediaire}
                onChange={() => handleFilterChange('difficulte', 'intermediaire')}
              />
              <Form.Check
                type="checkbox"
                id="avance-filter"
                label="🔴 Avancé"
                checked={filters.difficulte.avance}
                onChange={() => handleFilterChange('difficulte', 'avance')}
              />
              <Form.Check
                type="checkbox"
                id="expert-filter"
                label="🟣 Expert"
                checked={filters.difficulte.expert}
                onChange={() => handleFilterChange('difficulte', 'expert')}
              />
              <Form.Check
                type="checkbox"
                id="initiation-filter"
                label="🔵 Initiation"
                checked={filters.difficulte.initiation}
                onChange={() => handleFilterChange('difficulte', 'initiation')}
              />
            </div>
          </Col>
        </Row>
      </div>

      <Row className="justify-content-center g-4 w-100">
        {filteredAnimations.map((anim) => (
          <Col key={anim.id} xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 520 }}>
            <Card className="shadow-sm border-0 animation-card">
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <Card.Img 
                  variant="top" 
                  src={anim.image} 
                  alt={anim.title}
                  style={{ 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <div className="mb-2">
                  <Card.Title className="h5 mb-2">{anim.title}</Card.Title>
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    <Badge bg="primary" className="d-flex align-items-center gap-1">
                      {anim.typeIcon} {anim.type.charAt(0).toUpperCase() + anim.type.slice(1)}
                    </Badge>
                    <Badge bg="secondary" className="d-flex align-items-center gap-1">
                      {getDifficultyIcon(anim.difficulty)} {anim.niveau}
                    </Badge>
                    <Badge bg="info" className="d-flex align-items-center gap-1">
                      {getCategoryIcon(anim.category)} {anim.category.charAt(0).toUpperCase() + anim.category.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Card.Text className="text-muted flex-grow-1">
                  {anim.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredAnimations.length === 0 && (
        <div className="text-center mt-4">
          <p className="text-muted">Aucune animation ne correspond aux filtres sélectionnés.</p>
        </div>
      )}
    </Container>
  );
}
