import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';

export default function ChoixAnims() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [choices, setChoices] = useState({});
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0);
  const [orderedFavorites, setOrderedFavorites] = useState([]);
  const [modeAffichage, setModeAffichage] = useState(false);
  const [recapFavorites, setRecapFavorites] = useState([]);
  const [readOnlyRecap, setReadOnlyRecap] = useState(false);
  const [closedNoChoice, setClosedNoChoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingRedirect, setLoadingRedirect] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // milliseconds until open

  const animations = [
    { id: 1, title: "Slalom", description: "Slalom-géant chronométré organisé par l’ESF", niveau: "Intermédiaire", type: "ski", typeIcon: "⛷️", difficulty: "intermediaire", category: "competition", image: "/slalom.png", color: "primary" },
    { id: 2, title: "Derby", description: "Dévale une piste fermée le plus rapidement possible", niveau: "Intermédiaire", type: "ski", typeIcon: "⛷️", difficulty: "intermediaire", typeLabel: "Ski-Snow", category: "competition", image: "/derby.jpeg", color: "info" },
    { id: 3, title: "Boarder Cross", description: "Course sur une piste avec des bosses, virages et sauts", niveau: "Intermédiaire", type: "ski", typeIcon: "⛷️", difficulty: "intermediaire", category: "competition", image: "/boarder_cross.png", color: "danger" },
    { id: 4, title: "Compétition Freestyle (Big Air)", description: "Réalise ton plus beau tricks sur une bosse avec un Big Air", niveau: "Intermédiaire", type: "ski", typeIcon: "⛷️", difficulty: "intermediaire", typeLabel: "Ski-Snow", category: "competition", image: "/competition_freestyle(bigair).webp", color: "primary" },
    { id: 5, title: "First Track", description: "Réalise l’ouverture des pistes avec les pisteurs", niveau: "Tout niveau", type: "ski", typeIcon: "⛷️", difficulty: "tout", typeLabel: "Ski-Snow", category: "decouverte", image: "/first_track.jpg", color: "info" },
    { id: 6, title: "Last Track", description: "Réalise la fermeture des pistes avec les pisteurs", niveau: "Tout niveau", type: "ski", typeIcon: "⛷️", difficulty: "tout", typeLabel: "Ski-Snow", category: "decouverte", image: "/last_track.jpg", color: "info" },
    { id: 7, title: "ARVA Gourmand", description: "Formation au DVA avec des dégustations", niveau: "Tout niveau", type: "autres", typeIcon: "🧭", difficulty: "tout", category: "decouverte", image: "/arva_gourmand.jpg", color: "warning" },
    { id: 8, title: "Descente aux flambeaux", description: "Descend une piste de nuit avec un flambeau", niveau: "Tout niveau", type: "ski", typeIcon: "⛷️", difficulty: "tout", category: "event", image: "/descente_aux_flambeaux.jpg", color: "info" },
    { id: 9, title: "Visite remontée mécanique", description: "Visite de la mécanique derrière les remontées mécaniques", niveau: "Tout niveau", type: "autres", typeIcon: "🚡", difficulty: "tout", category: "decouverte", image: "/visite_remontee_mecanique.jpg", color: "info" },
    { id: 10, title: "Visite usine à neige", description: "Visite de la mécanique derrière la fabrication de neige", niveau: "Tout niveau", type: "autres", typeIcon: "❄️", difficulty: "tout", category: "decouverte", image: "/visite_usine_a_neige.webp", color: "info" },
    { id: 11, title: "Visite fromagerie", description: "Visite d’une fromagerie", niveau: "Tout niveau", type: "autres", typeIcon: "🧀", difficulty: "tout", category: "decouverte", image: "/visite_fromagerie.avif", color: "info" },
    { id: 12, title: "Découverte de la station", description: "Visite et tuysses sur la station", niveau: "Tout niveau", type: "autres", typeIcon: "🏔️", difficulty: "tout", category: "decouverte", image: "/decouverte_station.jpg", color: "info" },
    { id: 13, title: "Initiation Freeride", description: "Sorties en hors-piste encadrées par l’ESF", niveau: "Avancé", type: "ski", typeIcon: "⛷️", difficulty: "avance", typeLabel: "Ski-Snow", category: "cours", image: "/initiation_freeride.webp", color: "danger" },
    { id: 14, title: "Initiation Freestyle", description: "Initiations aux modules du snowpark encadrées par l’ESF", niveau: "Intermédiaire", type: "ski", typeIcon: "⛷️", difficulty: "intermediaire", typeLabel: "Ski-Snow", category: "cours", image: "/initiation_freestyle.webp", color: "warning" },
    { id: 15, title: "Rando Raquette", description: "Sorties en raquettes encadrées par l’ESF", niveau: "Tout niveau", type: "autres", typeIcon: "🥾", difficulty: "tout", category: "cours", image: "/rando_raquette.jpg", color: "success" },
    { id: 16, title: "Cours de Ski Débutant-Intermédiaire", description: "Leçons de ski encadrées par l’ESF pour les débutants et les intermédiaires", niveau: "Débutant-Intermédiaire", type: "ski", typeIcon: "⛷️", difficulty: "debutant", category: "cours", image: "/cours_ski.jpg", color: "success" },
    { id: 17, title: "Cours de Snow", description: "Leçons de snow encadrées par l’ESF pour les débutants", niveau: "Débutant", type: "snowboard", typeIcon: "🏂", difficulty: "debutant", category: "cours", image: "/cours_snow.png", color: "success" }
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

  // Countdown gating: page opens on 2025-11-20 09:30 (local time)
  useEffect(() => {
    const target = new Date('2025-11-19T12:30:00');
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setIsOpen(true);
        setTimeLeft(0);
        return true;
      }
      setTimeLeft(diff);
      return false;
    };

    // initial check
    if (tick()) return;

    const id = setInterval(() => {
      if (tick()) {
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formatCountdown = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return { days, hours, mins, secs };
  };

  // Hooks that must run on every render — keep them before any early returns
  const isCompleted = currentAnimIndex >= animations.length;
  const currentAnim = animations[currentAnimIndex];
  const progress = ((currentAnimIndex + 1) / animations.length) * 100;

  const navigate = useNavigate();

  // Met à jour l'ordre des favoris à la fin de la sélection
  useEffect(() => {
    if (isCompleted) {
      const favorites = Object.entries(choices)
        .filter(([_, choice]) => choice === 'yes')
        .map(([animId, _]) => parseInt(animId));
      setOrderedFavorites(favorites);
    }
  }, [isCompleted]);

  // Effet pour charger le récapitulatif si une ligne existe
  useEffect(() => {
    async function fetchRecap() {
      if (!isLoaded || !user) return;
      setLoading(true);
      try {
        const token = await getToken({ template: 'supabase' });
        const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
          global: { headers: { Authorization: `Bearer ${token}` } }
        });
        const { data } = await supabase
          .from('anims')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          // Collect all numeric keys from the saved row (handles more than 10 fields)
          const numericKeys = Object.keys(data).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
          const favorites = [];
          const favoriteIds = [];
          for (const key of numericKeys) {
            const title = data[key];
            if (!title) continue;
            const animObj = animations.find(a => a.title === title);
            if (animObj) {
              favorites.push(animObj);
              favoriteIds.push(animObj.id);
            }
          }
          if (favorites.length > 0) {
            // User had previously saved choices — show recap but read-only (choix fermés)
            setRecapFavorites(favorites);
            setOrderedFavorites(favoriteIds);
            const initChoices = {};
            animations.forEach(a => { initChoices[a.id] = favoriteIds.includes(a.id) ? 'yes' : 'no'; });
            setChoices(initChoices);
            setReadOnlyRecap(true);
            setModeAffichage(true);
          } else {
            // No saved choices: mark that choices are closed and user did not participate
            setClosedNoChoice(true);
          }
        }
      } catch (e) {
        // Optionnel: gestion d'erreur
      } finally {
        setLoading(false);
      }
    }
    fetchRecap();
  }, [isLoaded, user]);

  // If not open yet, show countdown UI only
  if (!isOpen) {
    const { days, hours, mins, secs } = formatCountdown(timeLeft);
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
        <Card className="text-center p-4" style={{ maxWidth: 700 }}>
          <Card.Body>
            <Card.Title className="mb-3">Accès au shotgun anim's</Card.Title>
            <Card.Text className="mb-3">Le shotgun sera disponible le 19/11/2025 à 12:30.</Card.Text>
            <div style={{ fontSize: '1.6rem', fontWeight: 600 }}>
              {days}j {String(hours).padStart(2, '0')}h {String(mins).padStart(2, '0')}m {String(secs).padStart(2, '0')}s
            </div>
            <div className="text-muted mt-3">Patiente jusqu'à l'ouverture.</div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

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


  const onDragEnd = (result) => {
    if (!result.destination) return;
    const arr = Array.from(orderedFavorites);
    const [removed] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, removed);
    setOrderedFavorites(arr);
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


  // Handler de validation avec redirection
  const handleValidate = async () => {
    setErrorMsg("");
    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      // Construction de l'objet à insérer dans la table anims
      const insertData = { id: user.id };
      orderedFavorites.forEach((animId, idx) => {
        const anim = animations.find(a => a.id === animId);
        insertData[(idx + 1).toString()] = anim.title;
      });
      // Ensure remaining slots up to the maximum are cleared when user reduces choices
      const MAX_SLOTS = animations.length;
      for (let i = orderedFavorites.length + 1; i <= MAX_SLOTS; i++) {
        insertData[i.toString()] = null;
      }
      // Insère ou met à jour la ligne pour cet utilisateur
      const { error } = await supabase
        .from('anims')
        .upsert([insertData], { onConflict: ['id'] });
      if (error) {
        setErrorMsg("Erreur lors de l'enregistrement : " + error.message);
      } else {
        // On passe directement en mode récap avec les choix courants
        setRecapFavorites(orderedFavorites.map(animId => animations.find(a => a.id === animId)).filter(Boolean));
        setModeAffichage(true);
      }
    } catch (e) {
      setErrorMsg("Erreur lors de l'enregistrement : " + e.message);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><span className="visually-hidden">Chargement...</span><div className="spinner-border text-primary" role="status"></div></div>;

  if (loadingRedirect) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Redirection...</span>
      </div>
    );
  }

  if (modeAffichage) {
    // Read-only recap when choices are closed
    return (
      <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <Row className="justify-content-center w-100">
          <Col sm={12} lg={10} xl={8}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="display-5 fw-bold text-success mb-0">🎉 Récapitulatif de tes choix</h2>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/')}>Accueil</Button>
              </div>
            </div>
            <div className="text-center mb-3">
              <ul className="list-group list-group-flush">
                {recapFavorites.map((anim, idx) => (
                  <li key={anim.id} className="list-group-item">
                    <strong>{idx + 1}.</strong> {anim.title}
                  </li>
                ))}
              </ul>
            </div>
            <Alert variant="info">Le choix des animations est désormais fermé. Tu ne peux plus modifier tes choix.</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // If the page is open but the user never saved choices, inform that it's too late
  if (isOpen && closedNoChoice) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
        <Card className="text-center p-4" style={{ maxWidth: 700 }}>
          <Card.Body>
            <Card.Title className="mb-3">Choix des animations</Card.Title>
            <Card.Text className="mb-3">Le choix des animations est fermé et tu n'as pas participé au shotgun. Il est trop tard pour sélectionner des animations.</Card.Text>
            <Button variant="primary" onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

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
                    // Return to selection mode and clear choices/order so the user restarts from zero
                    setModeAffichage(false);
                    setCurrentAnimIndex(0);
                    setChoices({});
                    setOrderedFavorites([]);
                  }}
                >
                  🔄 Recommencer
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => { setModeAffichage(false); setCurrentAnimIndex(0); }}
                >
                  ← Modifier mes choix
                </Button>
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={handleValidate}
                >
                  ✅ Valider mes choix
                </Button>
              </div>

              {/* Message d'erreur */}
              {errorMsg && (
                <div className="mt-4 alert alert-danger">
                  {errorMsg}
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
