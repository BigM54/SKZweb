import React from 'react';
import { Container, Card } from 'react-bootstrap';

export default function VSS() {
  return (
    <Container className="py-4">
      <h3 className="mb-3">Prévention des Violences Sexistes et Sexuelles (VSS)</h3>

      <Card className="mb-3">
        <Card.Body>
          <p>Skioz'Arts est un événement de rassemblement, dans lequel chacun et chacune doit pouvoir se sentir à l’aise et en sécurité.</p>
          <p>À ce titre, l’équipe SKZ s’engage à garantir un environnement sûr, respectueux et inclusif pour toutes et tous.</p>
          <p>Aucune forme de violence sexiste ou sexuelle n’est tolérée, qu’elle soit verbale, physique, psychologique ou sexuelle. L’alcool n’excuse jamais un comportement inapproprié.</p>
          <p>Sans oui clair et explicite, il n’y a pas de consentement. Un oui est révocable à tout moment.</p>
          <p>Tout comportement déplacé, non consenti, insistant ou discriminant fera l’objet d’une prise en charge immédiate et de mesures adaptées pouvant aller jusqu’à l’exclusion de la communauté.</p>
        </Card.Body>
      </Card>

      <h4 className="mt-3">Référent·es VSS</h4>
      <Card className="mb-3">
        <Card.Body>
          <p>Des référent·es formé·es sont disponibles à tout moment pendant nos événements. Tu peux les contacter :</p>
          <ul>
            <li>Soit par leur numéro de téléphone perso :</li>
          </ul>
          <ul>
            <li>Antoine CHEDOR : <strong><a href="tel:0678778214" aria-label="Appeler Antoine CHEDOR">06 78 77 82 14</a></strong></li>
            <li>Margaux PERRET : <strong><a href="tel:0682222214" aria-label="Appeler Margaux PERRET">06 82 22 22 14</a></strong></li>
            <li>Maelys VACHAUD : <strong><a href="tel:0782623554" aria-label="Appeler Maelys VACHAUD">07 82 62 35 54</a></strong></li>
          </ul>
          <p>Tu peux également t’adresser à la ME² : Eloïse Dumet (ME2) - <strong>07.66.49.49.03</strong> - <a href="mailto:me.ue@gadz.org">me.ue@gadz.org</a></p>
          <p>N’hésitez jamais à les contacter, pour vous ou pour quelqu’un d’autre. Si vous observez une situation qui vous paraît anormale, vous pouvez vous rapprocher d’un membre de la team SKZ présent sur l’événement qui saura vous accompagner.</p>
        </Card.Body>
      </Card>

      <h4 className="mt-3">Numéros d’aide nationaux</h4>
      <Card className="mb-3">
        <Card.Body>
          <ul>
            <li><strong><a href="tel:3919">3919</a></strong> – Violences Femmes Info (Gratuit, anonyme, 24h/24 – 7j/7)</li>
            <li><strong><a href="tel:17">17</a></strong> – Police / Gendarmerie (urgence)</li>
            <li><strong><a href="tel:112">112</a></strong> – Numéro d'urgence européen</li>
            <li><strong><a href="tel:0800005696">0 800 005 696</a></strong> – Violences LGBTphobes</li>
          </ul>
          <p>Ensemble, faisons de Skioz'Arts un espace sûr pour toutes et tous. Si vous avez un doute, un malaise ou une question : parlez-en.</p>
        </Card.Body>
      </Card>
    </Container>
  );
}
