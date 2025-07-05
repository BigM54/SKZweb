import { Accordion, Container } from 'react-bootstrap';

export default function FAQ() {
  return (
    <div className="full-width my-5">
      <h2 className="text-center mb-4">❓ Foire Aux Questions (FAQ)</h2>
      <Accordion alwaysOpen>
        {/* Rubrique Paiements */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Paiements</Accordion.Header>
          <Accordion.Body>
            <Accordion flush>
              <Accordion.Item eventKey="0-1">
                <Accordion.Header>Comment puis-je payer l'acompte ?</Accordion.Header>
                <Accordion.Body>
                  Tu peux régler ton acompte via HelloAsso avec un lien personnalisé reçu par email ou depuis ton espace Skioz'Arts.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="0-2">
                <Accordion.Header>Puis-je payer en plusieurs fois ?</Accordion.Header>
                <Accordion.Body>
                  Oui, le paiement est fractionné en plusieurs étapes visibles dans la rubrique Mes Paiements.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>

        {/* Rubrique Inscriptions */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Inscriptions</Accordion.Header>
          <Accordion.Body>
            <Accordion flush>
              <Accordion.Item eventKey="1-1">
                <Accordion.Header>Qui peut s'inscrire ?</Accordion.Header>
                <Accordion.Body>
                  Tous les étudiants gadz et non-gadz peuvent s'inscrire via le formulaire en ligne.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1-2">
                <Accordion.Header>Comment modifier mes informations ?</Accordion.Header>
                <Accordion.Body>
                  Il est possible de modifier certaines données jusqu'à une date limite, en te connectant à ton espace personnel.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>

        {/* Rubrique Contact */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Contact</Accordion.Header>
          <Accordion.Body>
            <Accordion flush>
              <Accordion.Item eventKey="2-1">
                <Accordion.Header>Comment joindre l’équipe organisatrice ?</Accordion.Header>
                <Accordion.Body>
                  Tu peux nous contacter par mail à skiozarts@ueam.fr ou directement via le formulaire de contact en bas de page.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2-2">
                <Accordion.Header>Y a-t-il une page pour suivre les actus ?</Accordion.Header>
                <Accordion.Body>
                  Oui, toutes les infos sont disponibles sur notre compte Instagram @skiozarts et sur Discord.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
