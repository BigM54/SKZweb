
import { Accordion } from 'react-bootstrap';

export default function FAQ() {
  return (
    <div className="full-width my-5">
      <h2 className="text-center mb-4">❓ Foire Aux Questions (FAQ)</h2>
      <Accordion alwaysOpen>
        {/* Inscription & Identifiant */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Inscription & Identifiant</Accordion.Header>
          <Accordion.Body>
            <strong>Comment m’inscrire au voyage de ski ?</strong>
            <div> L’inscription se fait directement sur notre site. Complète le formulaire et procède au paiement de l’acompte pour valider ta place.</div>
            <hr />
            <strong>Puis-je modifier mes informations personnelles après inscription ?</strong>
            <div> Oui, tu peux modifier certaines informations depuis ton compte.</div>
            <hr />
            <strong>Comment retrouver ou réinitialiser mon mot de passe ?</strong>
            <div> Clique sur “Mot de passe oublié” à la connexion et suis les instructions envoyées par e-mail.</div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Paiements SKZ */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Paiements SKZ</Accordion.Header>
          <Accordion.Body>
            <strong>Quels moyens de paiement acceptez-vous ?</strong>
            <div> Les paiements se font uniquement par Carte bancaire depuis le site SKZ. Si tu ne peux pas payer par CB rapproche-toi de la team SKZ.</div>
            <hr />
            <strong>Puis-je payer en plusieurs fois ?</strong>
            <div> Oui, le paiement de ta semaine se fait uniquement en 3x plus un acompte (voir les modalités sur la page de paiement).</div>
            <hr />
            <strong>Comment savoir si mon paiement a bien été pris en compte ?</strong>
            <div> Tu recevras un e-mail de confirmation et tu pourras vérifier le statut dans ton espace personnel.</div>
            <hr />
            <strong>Que faire si ma transaction est refusée ?</strong>
            <div> Vérifie tes informations bancaires ou contacte ta banque. Si le problème persiste, contacte nous.</div>
            <hr />
            <strong>Y a-t-il des frais supplémentaires ou cachés ?</strong>
            <div> Non, le prix indiqué comprend tout ce qui est mentionné dans l’offre. Attention, les paiements se font via la plateforme Helloasso, qui coche par défaut une contribution volontaire. Celle-ci peut toutefois être désactivée lors du paiement.</div>
            <hr />
            <strong>Puis-je changer le nom du participant après paiement ?</strong>
            <div> Non, les billets sont nominatifs et non transférables. Ils ne peuvent en aucun cas être revendus à un tiers sans l’accord préalable de la team SKZ.</div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Annulation et remboursement */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Annulation et remboursement</Accordion.Header>
          <Accordion.Body>
            <strong>Quelles sont les conditions d’annulation ?</strong>
            <div> Les billets ne peuvent malheureusement pas être annulés. Pour toute question ou besoin d’assistance, n’hésitez pas à joindre la team SKZ.</div>
            <hr />
            <strong>Suis-je remboursé si je ne peux plus venir ?</strong>
            <div> Non, nous ne pouvons malheureusement pas proposer de remboursement, total ou partiel.</div>
            <hr />
            <strong>Puis-je souscrire une assurance annulation ?</strong>
            <div> Oui, des assurances optionnelles sont proposées lors de l’inscription.</div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Organisation et logistique */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>Organisation et logistique</Accordion.Header>
          <Accordion.Body>
            <strong>Le transport est-il inclus dans le prix ?</strong>
            <div> Non, le transport n’est pas inclus dans le prix initial, mais des packs transport en bus sont proposés au départ de chaque TBK.</div>
            <hr />
            <strong>Comment sont attribués les logements ?</strong>
            <div></div>
            <hr />
            <strong>Dois-je avoir mon propre matériel de ski ?</strong>
            <div> Non, tu peux louer ton matériel en choisissant un pack de ski adapté à tes besoins et à ton budget. </div>
            <hr />
            <strong>Y a-t-il des tarifs réduits ou des bourses étudiantes ?</strong>
            <div> Non, la team SKZ ne propose pas de tarif réduit. Cependant, tu peux solliciter de l’aide au sein de ton TBK pour financer ta semaine, ou nous contacter pour discuter de délais de paiement.</div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Sécurité et assurances */}
        <Accordion.Item eventKey="4">
          <Accordion.Header>Sécurité et assurances</Accordion.Header>
          <Accordion.Body>
            <strong>Une assurance accident est-elle incluse ?</strong>
            <div> Oui, des assurances optionnelles sont proposées lors de l’inscription.</div>
            <hr />
            <strong>Que faire en cas de blessure sur place ?</strong>
            <div> Un numéro d’urgence te sera communiqué avant le départ et l’encadrement est formé pour intervenir rapidement.</div>
            <hr />
            <strong>Y a-t-il un encadrement ou un responsable sur place ?</strong>
            <div> Oui, la team SKZ et les référents SKZ de chaque TBK seront présents pour assurer le bon déroulement de ta semaine.</div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Activités et soirées */}
        <Accordion.Item eventKey="5">
          <Accordion.Header>Activités et soirées</Accordion.Header>
          <Accordion.Body>
            <strong>Suis-je sûr(e) d’avoir une animation piste ?</strong>
            <div> Non, chaque participant n’est pas automatiquement affecté à une animation, cela dépend des places disponibles.</div>
            <hr />
            <strong>Comment est choisie mon animation piste ?</strong>
            <div> Selon tes préférences indiquées lors de l’inscription aux animations pistes.</div>
            <hr />
            <strong>Puis-je annuler mon animation piste ?</strong>
            <div> Oui, mais uniquement si tu contactes la team SKZ au moins 24h à l’avance, afin de ne pas laisser de places vacantes. </div>
            <hr />
            <strong>Ai-je accès à toutes les soirées proposées ?</strong>
            <div> Oui, toutes les soirées sont ouvertes aux participants ayant payé la totalité de leur semaine.</div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
