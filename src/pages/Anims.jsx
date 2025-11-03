import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';

export default function Animations() {
  const [filters, setFilters] = useState({
    type: { ski: true, snowboard: true, autres: true },
    difficulte: { debutant: true, intermediaire: true, avance: true }
  });

  const animations = [
    // Animations avec descriptions fournies
    {
      id: 1,
      title: "Slalom",
      description: "Slalom-géant chronométré organisé par l’ESF",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      category: "competition",
      image: "/slalom.png",
      color: "primary"
    },
    {
      id: 2,
      title: "Derby",
      description: "Dévale une piste fermée le plus rapidement possible",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      typeLabel: "Ski-Snow",
      category: "competition",
      image: "/derby.jpeg",
      color: "info"
    },
    {
      id: 3,
      title: "Boarder Cross",
      description: "Course sur une piste avec des bosses, virages et sauts",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      typeLabel: "Ski-Snow",
      category: "competition",
      image: "/boarder_cross.png",
      color: "danger"
    },
    {
      id: 4,
      title: "Olympiades ESF x Biathlon",
      description: "Course mêlant plusieurs disciplines (ski, luge, raquette…) avec du tir à la carabine",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "competition",
      image: "/olympiadeESF_Biathlon.jpg",
      color: "warning"
    },
    {
      id: 5,
      title: "Compétition Freestyle (Big Air)",
      description: "Réalise ton plus beau tricks sur une bosse avec un Big Air",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      typeLabel: "Ski-Snow",
      category: "competition",
      image: "/competition_freestyle(bigair).webp",
      color: "primary"
    },
    {
      id: 6,
      title: "First Track",
      description: "Réalise l’ouverture des pistes avec les pisteurs",
      niveau: "Tout niveau",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "tout",
      typeLabel: "Ski-Snow",
      category: "decouverte",
      image: "/first_track.jpg",
      color: "info"
    },
    {
      id: 7,
      title: "Last Track",
      description: "Réalise la fermeture des pistes avec les pisteurs",
      niveau: "Tout niveau",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "tout",
      typeLabel: "Ski-Snow",
      category: "decouverte",
      image: "/last_track.jpg",
      color: "info"
    },
    {
      id: 8,
      title: "ARVA Gourmand",
      description: "Formation au DVA avec des dégustations",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🧭",
      difficulty: "tout",
      category: "decouverte",
      image: "/arva_gourmand.jpg",
      color: "warning"
    },
    {
      id: 9,
      title: "Descente aux flambeaux",
      description: "Descend une piste de nuit avec un flambeau",
      niveau: "Tout niveau",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "tout",
      category: "event",
      image: "/descente_aux_flambeaux.jpg",
      color: "info"
    },
    {
      id: 10,
      title: "Visite remontée mécanique",
      description: "Visite de la mécanique derrière les remontées mécaniques",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🚡",
      difficulty: "tout",
      category: "decouverte",
      image: "/visite_remontee_mecanique.jpg",
      color: "info"
    },
    {
      id: 11,
      title: "Visite usine à neige",
      description: "Visite de la mécanique derrière la fabrication de neige",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "❄️",
      difficulty: "tout",
      category: "decouverte",
      image: "/visite_usine_a_neige.webp",
      color: "info"
    },
    {
      id: 12,
      title: "Visite fromagerie",
      description: "Visite d’une fromagerie",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🧀",
      difficulty: "tout",
      category: "decouverte",
      image: "/visite_fromagerie.avif",
      color: "info"
    },
    {
      id: 13,
      title: "Découverte de la station",
      description: "Visite et tuysses sur la station",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "decouverte",
      image: "/decouverte_station.jpg",
      color: "info"
    },
    {
      id: 14,
      title: "Cours de Ski Débutant-Intermédiaire",
      description: "Leçons de ski encadrées par l’ESF pour les débutants et les intermédiaires",
      niveau: "Débutant-Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "debutant",
      category: "cours",
      image: "/cours_ski.jpg",
      color: "success"
    },
    {
      id: 15,
      title: "Cours de Snow",
      description: "Leçons de snow encadrées par l’ESF pour les débutants",
      niveau: "Débutant",
      type: "snowboard",
      typeIcon: "🏂",
      difficulty: "debutant",
      category: "cours",
      image: "/cours_snow.png",
      color: "success"
    },
    {
      id: 16,
      title: "Initiation Freeride",
      description: "Sorties en hors-piste encadrées par l’ESF",
      niveau: "Avancé",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "avance",
      typeLabel: "Ski-Snow",
      category: "cours",
      image: "/initiation_freeride.webp",
      color: "danger"
    },
    {
      id: 17,
      title: "Initiation Freestyle",
      description: "Initiations aux modules du snowpark encadrées par l’ESF",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      typeLabel: "Ski-Snow",
      category: "cours",
      image: "/initiation_freestyle.webp",
      color: "warning"
    },
    {
      id: 18,
      title: "Rando Raquette",
      description: "Sorties en raquettes encadrées par l’ESF",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🥾",
      difficulty: "tout",
      category: "cours",
      image: "/rando_raquette.jpg",
      color: "success"
    },
    {
      id: 19,
      title: "BBQ",
      description: "Barbecue entre les différents tabagn’sss",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🍖",
      difficulty: "tout",
      category: "event",
      image: "/bbq.jpg",
      color: "info"
    },
    {
      id: 20,
      title: "Caisson à savon",
      description: "Compétition de caisse à savon entre les tabagn’sss",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🛷",
      difficulty: "tout",
      category: "competition",
      image: "/caisse_a_savon.jpg",
      color: "info"
    },
    {
      id: 21,
      title: "Défis Monthey Valley",
      description: "Réalise de nombreux défis afin de gagner des produits DC",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🎯",
      difficulty: "tout",
      category: "defi",
      image: "/defi_monthey_valley.webp",
      color: "warning"
    }
  ];

  // Adapter le filtrage pour inclure "tout niveau" dans toutes les difficultés cochées
  const filteredAnimations = animations.filter(anim => {
    // Si la difficulté de l'anim est "tout", elle passe toujours
    if (anim.difficulty === "tout") return true;
    return filters.type[anim.type] && filters.difficulte[anim.difficulty];
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cours': return '🎓';
      case 'competition': return '🏆';
      case 'defi': return '🎯';
      case 'decouverte': return '🗺️';
      case 'event': return '🎉';
      default: return '❄️';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      debutant: '🟢',
      intermediaire: '🟡',
      avance: '🔴',
      tout: '⚪'
    };
    return icons[difficulty] || '⚪';
  };

  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh', background: '#0d1c31', color: 'white', padding: 0, maxWidth: '100vw', width: '100vw' }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3" style={{ color: 'white' }}>Les Anim's</h1>
        <p className="lead" style={{ color: 'white' }}>
          Découvre toutes les anim's pistes proposées pendant le séjour Skioz'Arts 2026 !
          <br />
          Des cours pour tous les niveaux aux activités freestyle et compétitions.
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-4 p-3 rounded w-100" style={{ maxWidth: '800px', background: '#00314f', color: 'white' }}>
        <h5 className="mb-3" style={{ color: 'white' }}>🔍 Filtres</h5>
        <Row>
          <Col md={6}>
            <h6 style={{ color: 'white' }}>Type d'activité :</h6>
            <div className="d-flex gap-3 flex-wrap mb-3">
              <Form.Check
                type="checkbox"
                id="ski-filter"
                label={<span style={{ color: 'white' }}>⛷️ Ski</span>}
                checked={filters.type.ski}
                onChange={() => handleFilterChange('type', 'ski')}
                style={{ color: 'white' }}
              />
              <Form.Check
                type="checkbox"
                id="snowboard-filter"
                label={<span style={{ color: 'white' }}>🏂 Snowboard</span>}
                checked={filters.type.snowboard}
                onChange={() => handleFilterChange('type', 'snowboard')}
                style={{ color: 'white' }}
              />
              <Form.Check
                type="checkbox"
                id="autres-filter"
                label={<span style={{ color: 'white' }}>🎢 Autres</span>}
                checked={filters.type.autres}
                onChange={() => handleFilterChange('type', 'autres')}
                style={{ color: 'white' }}
              />
            </div>
          </Col>
          <Col md={6}>
            <h6 style={{ color: 'white' }}>Difficulté :</h6>
            <div className="d-flex gap-2 flex-wrap">
              <Form.Check
                type="checkbox"
                id="debutant-filter"
                label={<span style={{ color: 'white' }}>🟢 Débutant</span>}
                checked={filters.difficulte.debutant}
                onChange={() => handleFilterChange('difficulte', 'debutant')}
                style={{ color: 'white' }}
              />
              <Form.Check
                type="checkbox"
                id="intermediaire-filter"
                label={<span style={{ color: 'white' }}>🟡 Intermédiaire</span>}
                checked={filters.difficulte.intermediaire}
                onChange={() => handleFilterChange('difficulte', 'intermediaire')}
                style={{ color: 'white' }}
              />
              <Form.Check
                type="checkbox"
                id="avance-filter"
                label={<span style={{ color: 'white' }}>🔴 Avancé</span>}
                checked={filters.difficulte.avance}
                onChange={() => handleFilterChange('difficulte', 'avance')}
                style={{ color: 'white' }}
              />
            </div>
          </Col>
        </Row>
      </div>

      <Row className="justify-content-center g-4 w-100">
        {filteredAnimations.map((anim) => (
          <Col key={anim.id} xs={12} md={8} lg={6} xl={4} className="d-flex justify-content-center" style={{ minWidth: 320 }}>
            <Card className="shadow-sm border-0 animation-card" style={{ background: '#00314f', color: 'white' }}>
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
                  onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.target.style.transform = 'scale(1)'}
                />
              </div>
              <Card.Body className="d-flex flex-column" style={{ color: 'white' }}>
                <div className="mb-2">
                  <Card.Title className="h5 mb-2" style={{ color: 'white' }}>{anim.title}</Card.Title>
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    <Badge bg="primary" className="d-flex align-items-center gap-1" style={{ color: 'white' }}>
                      {anim.typeIcon} {(anim.typeLabel || (anim.type.charAt(0).toUpperCase() + anim.type.slice(1)))}
                    </Badge>
                    <Badge bg="secondary" className="d-flex align-items-center gap-1" style={{ color: 'white' }}>
                      {getDifficultyIcon(anim.difficulty)} {anim.niveau}
                    </Badge>
                    <Badge bg="info" className="d-flex align-items-center gap-1" style={{ color: 'white' }}>
                      {getCategoryIcon(anim.category)} {anim.category.charAt(0).toUpperCase() + anim.category.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Card.Text className="flex-grow-1" style={{ color: 'white' }}>
                  {anim.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredAnimations.length === 0 && (
        <div className="text-center mt-4">
          <p style={{ color: 'white' }}>Aucune anim's ne correspond aux filtres sélectionnés.</p>
        </div>
      )}
    </Container>
  );

  function handleFilterChange(filterType, filterKey) {
    setFilters(prev => ({
      ...prev,
      [filterType]: {
        ...prev[filterType],
        [filterKey]: !prev[filterType][filterKey]
      }
    }));
  }
}
