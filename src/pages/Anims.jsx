import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';

export default function Animations() {
  const [filters, setFilters] = useState({
    type: { ski: true, snowboard: true, autres: true },
    difficulte: { debutant: true, intermediaire: true, avance: true },
    selectedDates: []
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
      ,
      competition: true,
      sponso: 'EY',
      date: 'mardi 20 janvier',
      time: '9h15',
      rdv: "Stade de slalom Belle Plagne (stade du dahu) - RDV au sommet du stage du Dahu",
      duration: '3h'
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
      ,
      competition: true,
      sponso: null,
      date: 'mercredi 21 janvier',
      time: '13h15',
      rdv: "Piste bleu : Puy du Fou - RDV en haut du télésiège Colorado (La plagne Centre)",
      duration: '3h'
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
      ,
      competition: true,
      sponso: null,
      date: 'jeudi 22 janvier',
      time: '13h15',
      rdv: "RDV Poste de Secours - Le Bijolin (Snowpark : 'Riders Nation')",
      duration: '3h'
    },
    {
      id: 4,
      title: "Olympiades ESF x Skz",
      description: "Course mêlant plusieurs disciplines (ski, luge, raquette…) avec du tir à la carabine",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "competition",
      image: "/olympiadeESF_Biathlon.jpg",
      color: "warning"
      ,
      competition: true,
      sponso: null,
      date: 'mardi 20 janvier',
      time: '16h45',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
    },
    {
      id: 5,
      title: "Compétition Freestyle (Slopestyle)",
      description: "Réalise ton plus beau tricks sur des bosses et des rails",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      typeLabel: "Ski-Snow",
      category: "competition",
      image: "/competition_freestyle.jpeg",
      color: "primary"
      ,
      competition: true,
      sponso: null,
      date: 'vendredi 23 janvier',
      time: '13h15',
      rdv: "RDV Poste de Secours - Le Bijolin (Snowpark : 'Riders Nation')",
      duration: '2h30'
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
      ,
      competition: false,
      sponso: null,
      date: 'jeudi 22 janvier',
      time: '7h45',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '1h45'
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
      ,
      competition: false,
      sponso: null,
      date: 'jeudi 22 janvier',
      time: '15h30',
      rdv: 'RDV : HAUT de la télécabine Roche de Mio',
      duration: '1h15'
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
      ,
      competition: false,
      sponso: null,
      date: 'mercredi 21 janvier',
      time: '16h45',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'vendredi 23 janvier',
      time: '16h45',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'mercredi 21 janvier',
      time: '16h45',
      rdv: "RDV : en bas de la télécabine Roche de Mio, (au pied des pistes)",
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'lundi 19 janvier',
      time: '8h45',
      rdv: "RDV : en bas de la télécabine Roche de Mio, (au pied des pistes)",
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'mardi 20 janvier',
      time: '9h15',
      rdv: 'RDV : parking de la rez',
      duration: '3h'
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
      ,
      competition: false,
      sponso: null,
      date: 'dimanche 18 janvier',
      time: '9h45',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'dimanche 18 janvier / lundi 19 janvier / mardi 20 janvier',
      time: '9h30',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'dimanche 18 janvier / lundi 19 janvier / mardi 20 janvier',
      time: '9h30',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'jeudi 22 janvier / vendredi 23 janvier',
      time: '8h45',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '3h'
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
      ,
      competition: false,
      sponso: null,
      date: 'dimanche 18 janvier / lundi 19 janvier / mardi 20 janvier',
      time: '14h',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'mercredi 21 janvier / jeudi 22 janvier',
      time: '8h45',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '3h'
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
      ,
      competition: false,
      sponso: null,
      date: 'lundi 19 janvier',
      time: '12h',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'jeudi 22 janvier',
      time: '15h30',
      rdv: 'RDV Tapis des oursons (La Plagne Bellcote)',
      duration: '2h'
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
      ,
      competition: false,
      sponso: null,
      date: 'jeudi 22 janvier / vendredi 23 janvier',
      time: '21h',
      rdv: 'RDV Village SKZ (La Plagne Bellcote)',
      duration: '22h'
    },
    {
      id: 22,
      title: "Slalom paralèlle en relais",
      description: "2 équipes de 4 s’affrontent en slalom parallèle en relais",
      niveau: "Intermédiaire",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "intermediaire",
      category: "competition",
      image: "/slalom_parallele_relais.webp",
      color: "warning"
      ,
      competition: true,
      sponso: "L'Oréal",
      date: 'mercredi 21 janvier',
      time: '9h15',
      rdv: "Stade de slalom Belle Plagne (stade du dahu) - RDV au sommet du stage du Dahu",
      duration: '3h'
    },
    {
      id: 23,
      title: "Derby Luge",
      description: "Monter une piste privatisée puis la descendre le plus rapidement possible. Tout est autorisé !",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "competition",
      image: "/derby_luge.png",
      color: "danger",
      competition: true,
      sponso: "Red Bull",
      date: "lundi 19 janvier",
      time: "16h45",
      rdv: "RDV Village SKZ (La Plagne Bellcote)",
      duration: "1h30"
    },
    {
      id: 24,
      title: "Compétition Débutant",
      description: "Mini compétition chronométrée en slalom parallèle pour les débutants",
      niveau: "Débutant",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "debutant",
      typeLabel: "Ski-Snow",
      category: "competition",
      image: "/competition_debutant.png",
      color: "primary",
      competition: true,
      sponso: "L'Oréal",
      date: "jeudi 22 janvier",
      time: "12h45",
      rdv: "RDV Tapis des oursons (La Plagne Bellcote)",
      duration: "2h"
    },
    {
      id: 25,
      title: "Jeu de piste",
      description: "Résolution d'énigmes en équipe pour réussir le parcours le plus vite possible",
      niveau: "Tout niveau",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "tout",
      typeLabel: "Ski-Snow",
      category: "competition",
      image: "/jeu_de_piste.png",
      color: "info",
      competition: true,
      sponso: null,
      date: "lundi 19 janvier",
      time: "à partir de 9h jusqu'à 10h30",
      rdv: "RDV Village SKZ (La Plagne Bellcote)",
      duration: "1h30"
    },
    {
      id: 26,
      title: "HandiSki",
      description: "Découverte de nouvelles sensations et sensibilisation au handiski / ski fauteuil",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "decouverte",
      image: "/handiski.png",
      color: "warning",
      competition: false,
      sponso: null,
      date: "dimanche 18 janvier",
      time: "8h45/9H45/10h45 - 13h45/14h45/15h45",
      rdv: "RDV Village SKZ (La Plagne Bellcote)",
      duration: "1h"
    },
    {
      id: 27,
      title: "Cérémonie d'ouverture",
      description: "Cérémonie unique à ne pas louper pour lancer la semaine",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "decouverte",
      image: "/ouverture.png",
      color: "primary",
      competition: false,
      sponso: null,
      date: "dimanche 18 janvier",
      time: "18h",
      rdv: "RDV Village SKZ (La Plagne Bellcote)",
      duration: "1h"
    },
    {
      id: 28,
      title: "Cérémonie de fermeture",
      description: "Cérémonie qui conclue cette semaine inoubliable",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "decouverte",
      image: "/fermeture.png",
      color: "danger",
      competition: false,
      sponso: null,
      date: "vendredi 23 janvier",
      time: "19h30",
      rdv: "RDV Village SKZ (La Plagne Bellcote)",
      duration: "1h"
    },
    {
      id: 29,
      title: "Monome",
      description: "Le plus grand mônome Gadzarique. Les trad's moürons !",
      niveau: "Tout niveau",
      type: "autres",
      typeIcon: "🏔️",
      difficulty: "tout",
      category: "decouverte",
      image: "/monome.png",
      color: "info",
      competition: false,
      sponso: null,
      date: "mardi 20 janvier",
      time: "20h15",
      rdv: "RDV Village SKZ (La Plagne Bellcote)",
      duration: "30 min"
    },
    {
      id: 30,
      title: "Descente musicale",
      description: "Une dernière descente ensemble accompagnée des meilleures musiques",
      niveau: "Tout niveau",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "tout",
      typeLabel: "Ski-Snow",
      category: "decouverte",
      image: "/descente_musicale.png",
      color: "primary",
      competition: false,
      sponso: null,
      date: "vendredi 23 janvier",
      time: "16h00",
      rdv: "RDV : HAUT de la télécabine Roche de Mio",
      duration: "45min"
    },
    {
      id: 31,
      title: "Défis - La Plagne Explorer",
      description: "Retrouvez les lieux cachés, relevez le défi et tentez de gagner des récompenses",
      niveau: "Tout niveau",
      type: "ski",
      typeIcon: "⛷️",
      difficulty: "tout",
      typeLabel: "Ski-Snow",
      category: "competition",
      image: "/explorer.png",
      color: "info",
      competition: true,
      sponso: null,
      date: "Toute la semaine",
      time: "Libre",
      rdv: "Station La Plagne",
      duration: "Libre"
    }
  ];

  // build unique dates list for timeline filter and sort chronologically
  const parseFrenchDate = (txt) => {
    // expects strings like 'mardi 20 janvier' or '21 janvier'
    const months = {
      janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
      juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11
    };
    const m = txt.toLowerCase();
    const dayMatch = m.match(/(\d{1,2})/);
    const monthMatch = Object.keys(months).find(k => m.includes(k));
    if (!dayMatch || !monthMatch) return null;
    const day = Number(dayMatch[1]);
    const month = months[monthMatch];
    // assume year 2026
    return new Date(2026, month, day);
  };

  const rawDates = animations.flatMap(a => (a.date || '').split('/').map(d => d.trim()).filter(Boolean));
  const uniqDates = Array.from(new Set(rawDates));
  const allDates = uniqDates.sort((a, b) => {
    const da = parseFrenchDate(a);
    const db = parseFrenchDate(b);
    if (!da || !db) return a.localeCompare(b);
    return da - db;
  });

  function toggleDateFilter(d) {
    setFilters(prev => {
      const sel = prev.selectedDates || [];
      const exists = sel.includes(d);
      const next = exists ? sel.filter(x => x !== d) : [...sel, d];
      return { ...prev, selectedDates: next };
    });
  }

  // Détermine les types logiques pour le filtrage (Ski-Snow => ski et snowboard)
  const getAnimLogicalTypes = (anim) => {
    const label = (anim.typeLabel || '').toLowerCase();
    const isMixedSkiSnow = label.includes('ski') && (label.includes('snow') || label.includes('snowboard'));
    if (isMixedSkiSnow) return ['ski', 'snowboard'];
    return [anim.type];
  };

  // Filtrage: "tout" passe pour la difficulté; type mixte passe si ski OU snowboard est coché
  const filteredAnimations = animations.filter(anim => {
    // difficulty and type (existing behaviour)
    const passesDifficulty = anim.difficulty === 'tout' || !!filters.difficulte[anim.difficulty];
    const logicalTypes = getAnimLogicalTypes(anim);
    const passesType = logicalTypes.some(t => !!filters.type[t]);

    if (!(passesDifficulty && passesType)) return false;

    // date timeline: if any date selected, require animation to match at least one selected date
    const selected = filters.selectedDates || [];
    if (selected.length > 0) {
      const animDates = (anim.date || '').split('/').map(d => d.trim()).filter(Boolean);
      const matchesDate = animDates.some(d => selected.includes(d));
      if (!matchesDate) return false;
    }

    return true;
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
        <Row className="mt-3">
          <Col md={12}>
            <h6 style={{ color: 'white' }}>Dates</h6>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {allDates.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDateFilter(d)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: filters.selectedDates.includes(d) ? '2px solid #fff' : '1px solid #ccc',
                    background: filters.selectedDates.includes(d) ? '#fff' : 'transparent',
                    color: filters.selectedDates.includes(d) ? '#00314f' : '#fff',
                    cursor: 'pointer'
                  }}
                >{d}</button>
              ))}
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

                <div className="d-flex justify-content-between align-items-center mt-3" style={{ fontSize: 24 }}>
                  <div style={{ color: '#eaeaea' }}>
                    {anim.date && <span style={{ marginRight: 10 }}>📅 {anim.date}</span>}
                    {anim.time && <span>🕒 {anim.time}</span>}
                  </div>
                  <div>
                    {anim.sponso && <Badge bg="light" text="dark">{anim.sponso}</Badge>}
                  </div>
                </div>
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
