import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function ChoixAnims() {
  const [choices, setChoices] = useState({});
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0);
  const [orderedFavorites, setOrderedFavorites] = useState([]);

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

  // Met à jour l'ordre des favoris à la fin de la sélection
  React.useEffect(() => {
    if (isCompleted) {
      const favorites = Object.entries(choices)
        .filter(([_, choice]) => choice === 'yes')
        .map(([animId, _]) => parseInt(animId));
      setOrderedFavorites(favorites);
    }
  }, [isCompleted]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const arr = Array.from(orderedFavorites);
    const [removed] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, removed);
    setOrderedFavorites(arr);
  };

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
          <Col sm={12} lg={8} xl={6}>
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
                  style={{ height: '100%', objectFit: 'cover' }}
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
                
                {/* Sélection par coeur/croix */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <Button
                    variant={choices[currentAnim.id] === 'no' ? 'danger' : 'outline-secondary'}
                    size="lg"
                    className="px-4 py-2"
                    onClick={() => handleChoice(currentAnim.id, 'no')}
                  >
                    ❌
                  </Button>
                  <Button
                    variant={choices[currentAnim.id] === 'yes' ? 'success' : 'outline-secondary'}
                    size="lg"
                    className="px-4 py-2"
                    onClick={() => handleChoice(currentAnim.id, 'yes')}
                  >
                    ❤️
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
        // Mode récapitulatif avec classement drag & drop des anims aimées et anims non choisies
        <Row className="justify-content-center w-100">
          <Col sm={12} lg={10} xl={8}>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-success mb-3">🎉 Félicitations !</h2>
              <p className="lead text-muted">
                Tu as terminé la sélection de tes animations. Glisse pour classer tes anims préférées :
              </p>
            </div>

            {/* Classement drag & drop des anims aimées */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">❤️ Tes anims préférées (glisse pour classer)</h5>
              </Card.Header>
              <Card.Body>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="favorites-list" direction="vertical">
                    {(provided) => (
                      <ul className="list-group list-group-flush" ref={provided.innerRef} {...provided.droppableProps}>
                        {orderedFavorites.map((animId, idx) => {
                          const anim = animations.find(a => a.id === animId);
                          return (
                            <Draggable key={anim.id} draggableId={String(anim.id)} index={idx}>
                              {(provided, snapshot) => (
                                <li
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`list-group-item d-flex align-items-center ${snapshot.isDragging ? 'bg-light' : ''}`}
                                  style={{ ...provided.draggableProps.style, cursor: 'grab' }}
                                >
                                  <span className="me-3">{idx + 1}.</span>
                                  <img src={anim.image} alt={anim.title} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} className="me-3" />
                                  <span className="fw-bold flex-grow-1">{anim.title}</span>
                                  <span style={{ fontSize: '1.5rem' }}>❤️</span>
                                </li>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </Card.Body>
            </Card>

            {/* Anims non choisies */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">❌ Anims non choisies</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-group list-group-flush">
                  {Object.entries(choices)
                    .filter(([_, choice]) => choice === 'no')
                    .map(([animId, _]) => {
                      const anim = animations.find(a => a.id === parseInt(animId));
                      return (
                        <li key={anim.id} className="list-group-item d-flex align-items-center">
                          <img src={anim.image} alt={anim.title} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} className="me-3" />
                          <span className="fw-bold flex-grow-1">{anim.title}</span>
                          <span style={{ fontSize: '1.5rem' }}>❌</span>
                        </li>
                      );
                    })}
                </ul>
              </Card.Body>
            </Card>

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
