import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup } from 'react-bootstrap';

export default function ChoixAnims() {
  const [choices, setChoices] = useState({});
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0);

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

  const handleChoice = (animId, choice) => {
    setChoices(prev => ({
      ...prev,
      [animId]: choice
    }));
    
    // Passer automatiquement à l'animation suivante
    if (currentAnimIndex < animations.length - 1) {
      setTimeout(() => {
        setCurrentAnimIndex(prev => prev + 1);
      }, 500); // Petit délai pour voir le choix
    }
  };

  const goToNext = () => {
    if (currentAnimIndex < animations.length - 1) {
      setCurrentAnimIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentAnimIndex > 0) {
      setCurrentAnimIndex(prev => prev - 1);
    }
  };

  const isCompleted = currentAnimIndex >= animations.length;
  const currentAnim = animations[currentAnimIndex];
  const progress = ((currentAnimIndex + 1) / animations.length) * 100;

  const getChoiceVariant = (animId, choice) => {
    const currentChoice = choices[animId];
    if (currentChoice === choice) {
      switch (choice) {
        case 'interesse': return 'warning';
        case 'absolument': return 'success';
        case 'pas_interesse': return 'danger';
        default: return 'outline-secondary';
      }
    }
    return 'outline-secondary';
  };

  const getChoiceIcon = (choice) => {
    switch (choice) {
      case 'interesse': return '🤔';
      case 'absolument': return '😍';
      case 'pas_interesse': return '😐';
      default: return '';
    }
  };

  const getChoiceLabel = (choice) => {
    switch (choice) {
      case 'interesse': return 'Intéressé';
      case 'absolument': return 'Absolument faire';
      case 'pas_interesse': return 'Pas intéressé';
      default: return '';
    }
  };

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
      {!isCompleted ? (
        // Mode sélection d'animation
        <Row className="justify-content-center w-100">
          <Col lg={8} xl={6}>
            {/* Barre de progression */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="mb-0">🎿 Choisis tes animations</h2>
                <span className="text-muted">
                  {currentAnimIndex + 1} / {animations.length}
                </span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                ></div>
              </div>
            </div>

            {/* Animation actuelle */}
            <Card className="shadow-lg border-0 mb-4">
              <div style={{ height: '250px', overflow: 'hidden' }}>
                <Card.Img 
                  variant="top" 
                  src={currentAnim.image} 
                  alt={currentAnim.title}
                  style={{ 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                />
              </div>
              <Card.Body>
                <div className="mb-3">
                  <Card.Title className="h4 mb-3">{currentAnim.title}</Card.Title>
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <Badge bg="primary" className="d-flex align-items-center gap-1">
                      {currentAnim.typeIcon} {currentAnim.type.charAt(0).toUpperCase() + currentAnim.type.slice(1)}
                    </Badge>
                    <Badge bg="secondary" className="d-flex align-items-center gap-1">
                      {getDifficultyIcon(currentAnim.difficulty)} {currentAnim.niveau}
                    </Badge>
                    <Badge bg="info" className="d-flex align-items-center gap-1">
                      {getCategoryIcon(currentAnim.category)} {currentAnim.category.charAt(0).toUpperCase() + currentAnim.category.slice(1)}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted mb-4">
                    {currentAnim.description}
                  </Card.Text>
                </div>
                
                {/* Boutons de choix */}
                <div className="d-grid gap-2">
                  <Button
                    size="lg"
                    variant={getChoiceVariant(currentAnim.id, 'absolument')}
                    onClick={() => handleChoice(currentAnim.id, 'absolument')}
                    className="py-3"
                  >
                    {getChoiceIcon('absolument')} Absolument faire !
                  </Button>
                  <Button
                    size="lg"
                    variant={getChoiceVariant(currentAnim.id, 'interesse')}
                    onClick={() => handleChoice(currentAnim.id, 'interesse')}
                    className="py-3"
                  >
                    {getChoiceIcon('interesse')} Intéressé
                  </Button>
                  <Button
                    size="lg"
                    variant={getChoiceVariant(currentAnim.id, 'pas_interesse')}
                    onClick={() => handleChoice(currentAnim.id, 'pas_interesse')}
                    className="py-3"
                  >
                    {getChoiceIcon('pas_interesse')} Pas intéressé
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Navigation */}
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary"
                onClick={goToPrevious}
                disabled={currentAnimIndex === 0}
              >
                ← Précédent
              </Button>
              
              <div className="d-flex gap-2">
                {choices[currentAnim.id] && (
                  <Button 
                    variant="outline-primary"
                    onClick={goToNext}
                    disabled={currentAnimIndex >= animations.length - 1}
                  >
                    Suivant →
                  </Button>
                )}
                
                {currentAnimIndex === animations.length - 1 && choices[currentAnim.id] && (
                  <Button 
                    variant="success"
                    onClick={() => setCurrentAnimIndex(animations.length)}
                  >
                    Voir le récapitulatif →
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        // Mode récapitulatif
        <Row className="justify-content-center w-100">
          <Col lg={8}>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-success mb-3">🎉 Félicitations !</h2>
              <p className="lead text-muted">
                Tu as terminé la sélection de tes animations. Voici ton récapitulatif :
              </p>
            </div>

            {/* Récapitulatif par catégorie */}
            {['absolument', 'interesse', 'pas_interesse'].map(category => {
              const animsInCategory = Object.entries(choices)
                .filter(([_, choice]) => choice === category)
                .map(([animId, _]) => animations.find(a => a.id === parseInt(animId)));

              if (animsInCategory.length === 0) return null;

              return (
                <Card key={category} className="mb-4 shadow-sm">
                  <Card.Header className={`bg-${category === 'absolument' ? 'success' : category === 'interesse' ? 'warning' : 'danger'} text-white`}>
                    <h5 className="mb-0">
                      {getChoiceIcon(category)} {getChoiceLabel(category)} ({animsInCategory.length})
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      {animsInCategory.map(anim => (
                        <Col key={anim.id} md={6}>
                          <div className="d-flex align-items-center p-2 border rounded">
                            <img 
                              src={anim.image} 
                              alt={anim.title}
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                              className="me-3"
                            />
                            <div>
                              <div className="fw-bold">{anim.title}</div>
                              <div className="d-flex gap-1 mt-1">
                                <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                                  {anim.typeIcon} {anim.type}
                                </Badge>
                                <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                                  {getDifficultyIcon(anim.difficulty)} {anim.niveau}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}

            {/* Actions finales */}
            <div className="text-center mt-5">
              <div className="d-flex gap-3 justify-content-center">
                <Button 
                  variant="outline-primary"
                  onClick={() => {
                    setCurrentAnimIndex(0);
                    setChoices({});
                  }}
                >
                  🔄 Recommencer
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => setCurrentAnimIndex(animations.length - 1)}
                >
                  ← Modifier mes choix
                </Button>
                <Button variant="success" size="lg">
                  ✅ Valider mes choix
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  💡 Ces informations nous aideront à mieux organiser les activités pendant ton séjour !
                </small>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
