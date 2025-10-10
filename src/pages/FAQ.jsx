import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';

const FAQ_DATA = [
	{
		key: '0',
		category: 'Inscription & Identifiant',
		questions: [
			{
				q: 'Comment m’inscrire au voyage de ski ?',
				a: "L’inscription se fait directement sur notre site. Complète le formulaire et procède au paiement de l’acompte pour valider ta place.",
			},
			{
				q: 'Puis-je modifier mes informations personnelles après inscription ?',
				a: "Oui, tu peux modifier certaines informations depuis ton compte. Cependant, les informations relatives à tes packs ne sont modifiables que pendant une semaine à compter de ton paiement d'acompte.",
			},
			{
				q: "Je me suis trompé lors de l'inscription, puis-je corriger mes informations ?",
				a: "Oui, tu peux corriger la plupart de tes informations personnelles (prénom, nom, numéro, tabagn's, etc.) depuis la page 'Mes informations' une fois connecté. Si tu rencontres un blocage, contacte la team SKZ.",
			},
			{
				q: 'Comment retrouver ou réinitialiser mon mot de passe ?',
				a: 'Clique sur “Mot de passe oublié” à la connexion et suis les instructions envoyées par e-mail.',
			},
		],
	},
	{
		key: '1',
		category: 'Paiements SKZ',
		questions: [
			{
				q: 'Quels moyens de paiement acceptez-vous ?',
				a: "Les paiements s’effectuent uniquement par carte bancaire via le site SKZ. Si tu n’as pas la possibilité de payer par CB, contacte directement la team SKZ sur Instagram.",
			},
			{
				q: 'Puis-je payer en plusieurs fois ?',
				a: 'Oui, le paiement de ta semaine se fait uniquement en 3x plus un acompte (voir les modalités sur la page de paiement).',
			},
			{
				q: 'Comment savoir si mon paiement a bien été pris en compte ?',
				a: 'Tu recevras un e-mail de confirmation et tu pourras vérifier le statut dans ton espace personnel.',
			},
			{
				q: 'Que faire si ma transaction est refusée ?',
				a: 'Vérifie tes informations bancaires ou contacte ta banque. Si le problème persiste, contacte nous.',
			},
			{
				q: 'Y a-t-il des frais supplémentaires ou cachés ?',
				a: "Non, le prix indiqué comprend tout ce qui est mentionné dans l’offre. Attention, les paiements se font via la plateforme Helloasso, qui coche par défaut une contribution volontaire. Celle-ci peut toutefois être désactivée lors du paiement.",
			},
			{
				q: 'Puis-je changer le nom du participant après paiement ?',
				a: "Non, les billets sont nominatifs et non transférables. Ils ne peuvent en aucun cas être revendus à un tiers sans l’accord préalable de la team SKZ.",
			},
		],
	},
	{
		key: '2',
		category: 'Annulation et remboursement',
		questions: [
			{
				q: 'Quelles sont les conditions d’annulation ?',
				a: "Les billets ne peuvent malheureusement pas être annulés. Pour toute question ou besoin d’assistance, n’hésitez pas à joindre la team SKZ.",
			},
			{
				q: 'Suis-je remboursé si je ne peux plus venir ?',
				a: 'Non, nous ne pouvons malheureusement pas proposer de remboursement, total ou partiel.',
			},
			{
				q: 'Puis-je souscrire une assurance annulation ?',
				a: 'Oui, des assurances optionnelles sont proposées lors de l’inscription.',
			},
		],
	},
	{
		key: '3',
		category: 'Organisation et logistique',
		questions: [
			{
				q: 'Le transport est-il inclus dans le prix ?',
				a: "Non, le transport n’est pas inclus dans le prix initial, mais des packs transport en bus sont proposés au départ de chaque TBK.",
			},
			{
				q: 'Comment sont attribués les logements ?',
				a: "",
			},
			{
				q: 'Dois-je avoir mon propre matériel de ski ?',
				a: "Non, tu peux louer ton matériel en choisissant un pack de ski adapté à tes besoins et à ton budget.",
			},
			{
				q: 'Y a-t-il des tarifs réduits ou des bourses étudiantes ?',
				a: "Non, la team SKZ ne propose pas de tarif réduit. Cependant, tu peux solliciter de l’aide au sein de ton TBK pour financer ta semaine, ou nous contacter pour discuter de délais de paiement.",
			},
			{
				q: 'Y a-t-il un accès spécifique pour les PMR ?',
				a: "Oui, un accès adapté est prévu pour les personnes à mobilité réduite afin de faciliter leur arrivée et leurs déplacements sur place. Tu peux également nous contacter sur Instagram pour nous décrire ta situation personnelle.",
			},
			{
				q: 'J’ai un régime alimentaire spécifique, comment faire ?',
				a: "Pas d’inquiétude ! Tu peux indiquer tes restrictions alimentaires dès ton inscription sur le site. Si ton cas ne figure pas parmi les options proposées, tu peux contacter la team SKZ sur Instagram afin que des solutions adaptées soient mises en place.",
			},
		],
	},
	{
		key: '4',
		category: 'Sécurité et assurances',
		questions: [
			{
				q: 'Une assurance accident est-elle incluse ?',
				a: 'Non, mais des assurances optionnelles sont proposées lors de l’inscription.',
			},
			{
				q: 'Que faire en cas de blessure sur place ?',
				a: "Un numéro d’urgence te sera communiqué avant le départ et l’encadrement est formé pour intervenir rapidement.",
			},
			{
				q: 'Y a-t-il un encadrement ou un responsable sur place ?',
				a: "Oui, la team SKZ et les référents SKZ de chaque TBK seront présents pour assurer le bon déroulement de ta semaine.",
			},
		],
	},
	{
		key: '5',
		category: 'Activités et soirées',
		questions: [
			{
				q: 'Suis-je sûr(e) d’avoir une animation piste ?',
				a: 'Non, chaque participant n’est pas automatiquement affecté à une animation, cela dépend des places disponibles.',
			},
			{
				q: 'Comment est choisie mon animation piste ?',
				a: 'Selon tes préférences indiquées lors de l’inscription aux animations pistes.',
			},
			{
				q: 'Puis-je annuler mon animation piste ?',
				a: 'Oui, mais uniquement si tu contactes la team SKZ au moins 24h à l’avance, afin de ne pas laisser de places vacantes.',
			},
			{
				q: 'Ai-je accès à toutes les soirées proposées ?',
				a: 'Oui, toutes les soirées sont ouvertes aux participants ayant payé la totalité de leur semaine.',
			},
		],
	},
];

export default function FAQ() {
	const [search, setSearch] = useState('');

	// Filtrage des catégories/questions/réponses
	const filteredFaq = FAQ_DATA.map(cat => {
		const filteredQuestions = cat.questions.filter(
			qr =>
				qr.q.toLowerCase().includes(search.toLowerCase()) ||
				qr.a.toLowerCase().includes(search.toLowerCase())
		);
		return filteredQuestions.length > 0 ? { ...cat, questions: filteredQuestions } : null;
	}).filter(Boolean);

	return (
		<div className="faq-page faq-small-text" style={{ maxWidth: '1700px', margin: '0 auto', padding: '2rem 0' }}>
			<h1 className="mb-4">FAQ</h1>
			<input
				type="text"
				className="form-control mb-3"
				placeholder="Rechercher une question ou un mot clé..."
				value={search}
				onChange={e => setSearch(e.target.value)}
			/>
			<Accordion alwaysOpen={false} flush>
				{filteredFaq.map(cat => (
					<Accordion.Item eventKey={cat.key} key={cat.key}>
						<Accordion.Header>
							<span style={{ fontWeight: 600 }}>{cat.category}</span>
						</Accordion.Header>
						<Accordion.Body>
							{cat.questions.map((qr, idx) => (
								<div key={idx} className="mb-3">
									<b>{qr.q}</b>
									<br />
									{qr.a}
								</div>
							))}
						</Accordion.Body>
					</Accordion.Item>
				))}
			</Accordion>
		</div>
	);
}