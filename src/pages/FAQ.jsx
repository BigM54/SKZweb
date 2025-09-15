
import React from 'react';
import Accordion from 'react-bootstrap/Accordion';

export default function FAQ() {
  return (
    <div className="faq-page container py-4 faq-small-text">
      <h1 className="mb-4">FAQ</h1>
      <Accordion defaultActiveKey="0" alwaysOpen={false} flush>
        <Accordion.Item eventKey="0">
          <Accordion.Header><span style={{fontWeight:600}}>Inscription & Identifiant</span></Accordion.Header>
          <Accordion.Body>
            <b>Comment m’inscrire au voyage de ski ?</b><br/>
            L’inscription se fait directement sur notre site. Complète le formulaire et procède au paiement de l’acompte pour valider ta place.<br/><br/>
            <b>Puis-je modifier mes informations personnelles après inscription ?</b><br/>
            Oui, tu peux modifier certaines informations depuis ton compte. Cependant, les informations relatives à tes packs ne sont modifiables qu’à partir d’une semaine après le shotgun.<br/><br/>
            <b>Comment retrouver ou réinitialiser mon mot de passe ?</b><br/>
            Clique sur “Mot de passe oublié” à la connexion et suis les instructions envoyées par e-mail.<br/>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header><span style={{fontWeight:600}}>Paiements SKZ</span></Accordion.Header>
          <Accordion.Body>
            <b>Quels moyens de paiement acceptez-vous ?</b><br/>
            Les paiements s’effectuent uniquement par carte bancaire via le site SKZ. Si tu n’as pas la possibilité de payer par CB, contacte directement la team SKZ sur Instagram.<br/><br/>
            <b>Puis-je payer en plusieurs fois ?</b><br/>
            Oui, le paiement de ta semaine se fait uniquement en 3x plus un acompte (voir les modalités sur la page de paiement).<br/><br/>
            <b>Comment savoir si mon paiement a bien été pris en compte ?</b><br/>
            Tu recevras un e-mail de confirmation et tu pourras vérifier le statut dans ton espace personnel.<br/><br/>
            <b>Que faire si ma transaction est refusée ?</b><br/>
            Vérifie tes informations bancaires ou contacte ta banque. Si le problème persiste, contacte nous.<br/><br/>
            <b>Y a-t-il des frais supplémentaires ou cachés ?</b><br/>
            Non, le prix indiqué comprend tout ce qui est mentionné dans l’offre. Attention, les paiements se font via la plateforme Helloasso, qui coche par défaut une contribution volontaire. Celle-ci peut toutefois être désactivée lors du paiement.<br/><br/>
            <b>Puis-je changer le nom du participant après paiement ?</b><br/>
            Non, les billets sont nominatifs et non transférables. Ils ne peuvent en aucun cas être revendus à un tiers sans l’accord préalable de la team SKZ.<br/>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header><span style={{fontWeight:600}}>Annulation et remboursement</span></Accordion.Header>
          <Accordion.Body>
            <b>Quelles sont les conditions d’annulation ?</b><br/>
            Les billets ne peuvent malheureusement pas être annulés. Pour toute question ou besoin d’assistance, n’hésitez pas à joindre la team SKZ.<br/><br/>
            <b>Suis-je remboursé si je ne peux plus venir ?</b><br/>
            Non, nous ne pouvons malheureusement pas proposer de remboursement, total ou partiel.<br/><br/>
            <b>Puis-je souscrire une assurance annulation ?</b><br/>
            Oui, des assurances optionnelles sont proposées lors de l’inscription.<br/>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header><span style={{fontWeight:600}}>Organisation et logistique</span></Accordion.Header>
          <Accordion.Body>
            <b>Le transport est-il inclus dans le prix ?</b><br/>
            Non, le transport n’est pas inclus dans le prix initial, mais des packs transport en bus sont proposés au départ de chaque TBK.<br/><br/>
            <b>Comment sont attribués les logements ?</b><br/>
            Les logements sont attribués par la team SKZ en fonction des groupes et des disponibilités.<br/><br/>
            <b>Dois-je avoir mon propre matériel de ski ?</b><br/>
            Non, tu peux louer ton matériel en choisissant un pack de ski adapté à tes besoins et à ton budget.<br/><br/>
            <b>Y a-t-il des tarifs réduits ou des bourses étudiantes ?</b><br/>
            Non, la team SKZ ne propose pas de tarif réduit. Cependant, tu peux solliciter de l’aide au sein de ton TBK pour financer ta semaine, ou nous contacter pour discuter de délais de paiement.<br/><br/>
            <b>Y a-t-il un accès spécifique pour les PMR ?</b><br/>
            Oui, un accès adapté est prévu pour les personnes à mobilité réduite afin de faciliter leur arrivée et leurs déplacements sur place. Tu peux également nous contacter sur Instagram pour nous décrire ta situation personnelle.<br/><br/>
            <b>J’ai un régime alimentaire spécifique, comment faire ?</b><br/>
            Pas d’inquiétude ! Tu peux indiquer tes restrictions alimentaires dès ton inscription sur le site. Si ton cas ne figure pas parmi les options proposées, tu peux contacter la team SKZ sur Instagram afin que des solutions adaptées soient mises en place.<br/>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header><span style={{fontWeight:600}}>Sécurité et assurances</span></Accordion.Header>
          <Accordion.Body>
            <b>Une assurance accident est-elle incluse ?</b><br/>
            Oui, des assurances optionnelles sont proposées lors de l’inscription.<br/><br/>
            <b>Que faire en cas de blessure sur place ?</b><br/>
            Un numéro d’urgence te sera communiqué avant le départ et l’encadrement est formé pour intervenir rapidement.<br/><br/>
            <b>Y a-t-il un encadrement ou un responsable sur place ?</b><br/>
            Oui, la team SKZ et les référents SKZ de chaque TBK seront présents pour assurer le bon déroulement de ta semaine.<br/>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="5">
          <Accordion.Header><span style={{fontWeight:600}}>Activités et soirées</span></Accordion.Header>
          <Accordion.Body>
            <b>Suis-je sûr(e) d’avoir une animation piste ?</b><br/>
            Non, chaque participant n’est pas automatiquement affecté à une animation, cela dépend des places disponibles.<br/><br/>
            <b>Comment est choisie mon animation piste ?</b><br/>
            Selon tes préférences indiquées lors de l’inscription aux animations pistes.<br/><br/>
            <b>Puis-je annuler mon animation piste ?</b><br/>
            Oui, mais uniquement si tu contactes la team SKZ au moins 24h à l’avance, afin de ne pas laisser de places vacantes.<br/><br/>
            <b>Ai-je accès à toutes les soirées proposées ?</b><br/>
            Oui, toutes les soirées sont ouvertes aux participants ayant payé la totalité de leur semaine.<br/>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}