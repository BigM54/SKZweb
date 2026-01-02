import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const PARTNERS = {
  dc: {
    key: 'dc',
    name: 'DC Shoes',
    logo: '/DC.png',
    recruitUrl: 'https://dcshoes.co.th/en/about-corporate?srsltid=AfmBOopTjtHqmruczzdeNBxIegCFs5HnnZd9l3PEAldULGp8vwAnDmlj',
    text: `Travailler pour DC, c'est bien plus que gérer une marque ; c'est se voir confier les clés de la mythologie moderne. C'est intégrer une maison où la créativité n'a pas de limite et où les histoires que vous façonnez résonnent dans le monde entier, de la page de comics au grand écran.

Pourquoi votre place est parmi nous ?
Gérer un patrimoine culturel mondial : Batman, Wonder Woman, Superman... Vous ne travaillez pas sur des "produits", mais sur des icônes qui inspirent des générations entières. Vous aurez la responsabilité de faire vivre et évoluer cet héritage unique.
Au carrefour des médias : Rejoindre DC, c'est naviguer dans un écosystème fascinant qui croise l'édition, le cinéma, le jeu vidéo et le merchandising. C'est l'école ultime du "Transmedia Storytelling" et du marketing de marque global.
La passion comme moteur : Vous évoluerez dans un environnement stimulant, entouré de créatifs et de stratèges passionnés. Ici, l'imagination est la compétence la plus précieuse, et chaque jour est une opportunité de repousser les frontières du possible.
Rejoindre DC, c'est accepter une mission héroïque : inspirer le monde par la force des histoires. Are you in?`
  },
  ey: {
    key: 'ey',
    name: 'EY',
    logo: '/EY.png',
    recruitUrl: 'https://www.rejoindre-ey.com',
    text: `Choisir EY, c'est décidé d'accélérer votre développement professionnel dès le premier jour. Dans un environnement stimulant et en perpétuelle évolution, vous allez acquérir une expertise qui sera le socle de toute votre carrière.

Vos atouts en rejoignant EY :
Un apprentissage continu : Grâce à des formations de pointe et un mentorat actif, vous développerez des compétences rares, de la stratégie financière à la transformation digitale.
La diversité des missions : Pas de routine chez EY. Vous accompagnerez aussi bien des start-ups prometteuses que des multinationales sur leurs enjeux les plus critiques.
Un réseau puissant : Vous collaborez avec des talents exceptionnels et intégrerez un réseau mondial qui vous ouvrira des portes tout au long de votre vie.
Chez EY, "The exceptional EY experience. It’s yours to build." Venez construire le monde du travail de demain, à votre image.`
  },
  loreal: {
    key: 'loreal',
    name: "L'Oréal",
    logo: '/loreal.png',
    recruitUrl: 'https://careers.loreal.com/en_US/content?utm_source=loreal_corporate_com&utm_medium=direct&utm_campaign=menu_cta_loreal_corporate',
    text: `L'Oréal : Entreprenez votre Carrière chez le Leader Mondial

Rejoindre L'Oréal, c'est vivre le meilleur des deux mondes : la puissance du numéro 1 de la beauté et l'agilité d'une start-up. Ici, nous ne cherchons pas des employés, mais des personnalités prêtes à bousculer les codes.

Pourquoi choisir L'Oréal ?
Au cœur de la Beauty Tech : Vous travaillerez sur des innovations qui façonnent l'avenir, alliant science verte, intelligence artificielle et réalité augmentée.
La liberté d'oser : Notre culture encourage la prise d'initiative et l'intrapreneuriat. Vous avez une idée ? On vous donne les moyens de la tester et de la réaliser.
Une carrière sans frontières : Avec des marques iconiques et une présence dans 150 pays, les possibilités d'évolution sont infinies.
Ne cherchez pas juste un poste, venez trouver votre vocation et avoir un impact réel sur le quotidien de millions de personnes.`
  }
};

export default function PartnersGallery() {
  const { state } = useLocation();
  const initial = state?.partner || null;
  const [selected, setSelected] = useState(initial);

  useEffect(() => {
    if (initial) setSelected(initial);
  }, [initial]);

  return (
    <Container className="py-4">
      <h3 className="mb-3">Nos partenaires — Opportunités</h3>

      <Row className="mb-4">
        {Object.values(PARTNERS).map(p => (
          <Col key={p.key} xs={6} md={4} className="d-flex justify-content-center mb-3">
            <button onClick={() => setSelected(p.key)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label={`Voir ${p.name}`}>
              <img src={p.logo} alt={p.name} style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }} />
            </button>
          </Col>
        ))}
      </Row>

      {selected ? (
        <Card>
          <Card.Body>
            <h4>{PARTNERS[selected].name}</h4>
            <p style={{ whiteSpace: 'pre-line' }}>{PARTNERS[selected].text}</p>
            <div>
              <a href={PARTNERS[selected].recruitUrl} target="_blank" rel="noopener noreferrer">
                <img src={PARTNERS[selected].logo} alt={`${PARTNERS[selected].name} logo`} style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 6, cursor: 'pointer' }} />
              </a>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <p>Sélectionnez un partenaire pour voir ses offres de recrutement et opportunités.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
