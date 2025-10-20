import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Accordion } from 'react-bootstrap';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function ChoixOptions() {
  const [form, setForm] = useState(null);
  const [isArchi, setIsArchi] = useState(false);
  const [isPeks, setIsPeks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modeAffichage, setModeAffichage] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();
  const [acomptePaid, setAcomptePaid] = useState(null);
  const [acompteDate, setAcompteDate] = useState(null);
  const [joursRestants, setJoursRestants] = useState(null);
  const [paiement3Montant, setPaiement3Montant] = useState(null);

  // Ajout d'un state pour la liste des bus
  const [busPlaces, setBusPlaces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      if (!user?.primaryEmailAddress?.emailAddress) return;
      const email = user.primaryEmailAddress.emailAddress;

      // Récupère options, acompte, profils et dateShotgun en parallèle
      const [{ data: optionsData }, { data: paiementData }, { data: profilData }, { data: shotgunData }, { data: busPlacesData }] = await Promise.all([
        supabase.from('options').select('*').eq('id', user.id).single(),
        supabase.from('Paiements').select('acompteStatut, dateAcompte, paiement3Montant').eq('email', email).single(),
        supabase.from('profils').select('proms, peks').eq('email', email).single(),
        supabase.from('dateShotgun').select('promsConscrits').single(),
        supabase.from('busPlace').select('tabagns, nbInscrits, place')
      ]);

      // Stocke la liste des bus
      setBusPlaces(busPlacesData || []);

      // Récupère la promo de l'utilisateur depuis profils
      let promoUser = null;
      if (profilData && profilData.proms) promoUser = Number(profilData.proms);
      // Détection archi/peks
      let archi = false, peks = false;
      const promoConscrits = shotgunData?.promsConscrits ? Number(shotgunData.promsConscrits) : null;
      if (promoUser !== null && promoConscrits !== null) {
        if (promoUser <= promoConscrits - 3) archi = true;
        if (profilData?.peks === true) peks = true;
      }
      setIsArchi(archi);
      setIsPeks(peks);

      if (optionsData) {
        setForm(optionsData);
        setModeAffichage(true);
      } else {
        setForm({
          pack_location: '',
          materiel_location: '', casque: '', type_forfait: '', assurance: '',
          masque: '', pack_fumeur: '', pack_soiree: '', pack_grand_froid: '',
          pain: '0', croissant: '0', pain_choco: '0', saucisson: '0', fromage: '0', biere: '', bus: '',
          etudiantArchi: '',
        });
        setModeAffichage(false);
      }
      setAcomptePaid(paiementData?.acompteStatut);
      setAcompteDate(paiementData?.dateAcompte);
      setPaiement3Montant(paiementData?.paiement3Montant || 0);
      setLoading(false);
    };
    fetchData();
  }, [user, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si on change le matériel vers snowboard ou snow + chaussures, et pack_location est bronze ou platine, on le reset
    if (name === 'materiel_location' && (value === 'snowboard' || value === 'snow + chaussures')) {
      setForm(prev => ({
        ...prev,
        [name]: value,
        pack_location: (prev.pack_location === 'bronze' || prev.pack_location === 'platine') ? '' : prev.pack_location
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.materiel_location === 'aucun') form.pack_location = 'aucun';

    const champsRequis = [
      'materiel_location', 'casque', 'type_forfait', 'assurance',
      'masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid', 'bus', 'taille_pull', 'regime', 'biere'
    ];
    // Si archi, le champ étudiant est requis
    if (isArchi) champsRequis.push('etudiantArchi');
    const champsNonRemplis = champsRequis.filter(champ => !form[champ]);
    if (champsNonRemplis.length > 0) {
      alert(`Merci de compléter tous les champs : ${champsNonRemplis.join(', ')}`);
      setLoading(false);
      return;
    }

    // Ajoute pack_archisPeks selon la logique
    let pack_archisPeks = false;
    if (isArchi) pack_archisPeks = form.etudiantArchi;
    if (isPeks) pack_archisPeks = 'oui';

    try {
      const token = await getToken({ template: 'supabase' });

      // Appel Edge Function
      const response = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/functions/v1/update_montant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, pack_archisPeks })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du calcul montant');
      }

      // Recharger le montant à jour depuis Supabase
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const email = user?.primaryEmailAddress?.emailAddress;
      const { data: paiementData } = await supabase.from('Paiements').select('acompteStatut, dateAcompte, paiement3Montant').eq('email', email).single();
      setPaiement3Montant(paiementData?.paiement3Montant || 0);

      setModeAffichage(true);
    } catch (err) {
      console.error('❌ Erreur:', err.message);
      alert('Une erreur est survenue : ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading || !form || acomptePaid === null) return <Spinner animation="border" variant="primary" />;

  if (modeAffichage) {
    // Nouvelle logique : date limite fixe
    const now = new Date();
    const deadline = new Date('2025-10-24T23:59:00.000Z');
    const modifPossible = now <= deadline;
    return (
      <>
        <div className="mb-3">
          <h4>💰 Total : {paiement3Montant + 425} €</h4>
          <p>
            (25€ + 200€ + 200€ + {paiement3Montant}€)
          </p>
        </div>
        {/* Affichage du délai restant ou expiré */}
        {acomptePaid && (
          <div className="mb-3">
            {modifPossible ? (
              <span className="text-success">⏳ Tu peux encore modifier tes options jusqu'au 24 octobre 2025 à 23h59.</span>
            ) : (
              <span className="text-danger">⏰ Délai expiré : tu ne peux plus modifier tes options.</span>
            )}
          </div>
        )}
        <h5 className="mb-3">Récapitulatif de tes choix :</h5>
        {Object.entries(form)
          .filter(([cle]) => cle !== 'Date_boulangerie')
          .map(([cle, val]) => (
            <div key={cle}><strong>{cle}</strong>: {val}</div>
          ))}
        <Button variant="primary" className="mt-3" onClick={() => setModeAffichage(false)} disabled={!modifPossible}>
          Modifier mes options
        </Button>
      </>
    );
  }

  const prixLocation = {
    "ski + chaussures": { bronze: 75, argent: 95, or: 112, platine: 147 },
    "snow + chaussures": { bronze: 75, argent: 95, or: 112, platine: 147 },
    ski: { bronze: 68, argent: 85, or: 108, platine: 142 },
    snowboard: { bronze: 68, argent: 85, or: 108, platine: 142 },
    chaussures: { bronze: 51, argent: 73, or: 94, platine: 127 }
  };

  // Prix pour affichage
  const prixAffichage = {
    pack_location: {
      "ski + chaussures": { bronze: 75, argent: 95, or: 112, platine: 147 },
      "snow + chaussures": { bronze: 75, argent: 95, or: 112, platine: 147 }
    },
    ski: { bronze: 68, argent: 85, or: 108, platine: 142 },
    chaussures: { bronze: 51, argent: 73, or: 94, platine: 127 },
    casque: { oui: 28, non: 0 },
    type_forfait: { standard: 0, étendu: 50 },
    assurance: { aucune: 0, zen: 38, skieur: 37, 'zen+skieur': 55 },
    masque: { oui: 37, non: 0 },
    pack_fumeur: { oui: 8, non: 0 },
    pack_soiree: { oui: 14, non: 0 },
    pack_grand_froid: { oui: 14, non: 0 },
    pack_jeux: { oui: 14, non: 0 },
    pain: 10,
    croissant: 9.5,
    pain_choco: 9.5,
    saucisson: 13,
    fromage: 14,
    biere: {
      'aucun': 0,
      'Blonde + Génép + Myrtille': 9,
      'Blonde + Ambrée + Blanche': 9,
      'Les 2 packs': 17
    },
    bus: {
      non: 0,
      sibers: 120,
      kin: 110,
      cluns: 100,
      p3: 140,
      boquette: 125,
      bordels: 125,
      birse: 125,
      chalons: 110
    }
  };

  const renderSelect = (label, name, options) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Select name={name} value={form[name]} onChange={handleChange}>
        <option value="">-- Choisir --</option>
        {options.map(opt => {
          let prix = '';
          let disabled = false;
          // Désactive bronze et platine si snowboard ou snow + chaussures
          if (name === 'pack_location' && (form.materiel_location === 'snowboard' || form.materiel_location === 'snow + chaussures')) {
            if (opt === 'bronze' || opt === 'platine') disabled = true;
          }
          // Prix total pour les packs à quantité
          if (["pain","croissant","pain_choco","saucisson","fromage"].includes(name)) {
            const n = parseInt(opt);
            prix = n > 0 ? ` (${n * prixAffichage[name]}€)` : '';
          }
          if (name === 'pack_location' && form.materiel_location && prixLocation[form.materiel_location]) {
            prix = prixLocation[form.materiel_location][opt] ? ` (${prixLocation[form.materiel_location][opt]}€)` : '';
          }
          if (name === 'biere') prix = prixAffichage.biere[opt] ? ` (${prixAffichage.biere[opt]}€)` : '';
          if (name === 'casque') prix = prixAffichage.casque[opt] ? ` (${prixAffichage.casque[opt]}€)` : '';
          if (name === 'type_forfait') prix = prixAffichage.type_forfait[opt] ? ` (${prixAffichage.type_forfait[opt]}€)` : '';
          if (name === 'assurance') prix = prixAffichage.assurance[opt] ? ` (${prixAffichage.assurance[opt]}€)` : '';
          if (name === 'masque') prix = prixAffichage.masque[opt] ? ` (${prixAffichage.masque[opt]}€)` : '';
          if (name === 'pack_fumeur') prix = prixAffichage.pack_fumeur[opt] ? ` (${prixAffichage.pack_fumeur[opt]}€)` : '';
          if (name === 'pack_soiree') prix = prixAffichage.pack_soiree[opt] ? ` (${prixAffichage.pack_soiree[opt]}€)` : '';
          if (name === 'pack_grand_froid') prix = prixAffichage.pack_grand_froid[opt] ? ` (${prixAffichage.pack_grand_froid[opt]}€)` : '';
          if (name === 'pack_jeux') prix = prixAffichage.pack_jeux[opt] ? ` (${prixAffichage.pack_jeux[opt]}€)` : '';
          if (name === 'bus') prix = prixAffichage.bus[opt] ? ` (${prixAffichage.bus[opt]}€)` : '';
          return <option key={opt} value={opt} disabled={disabled}>{opt}{prix}</option>;
        })}
      </Form.Select>
    </Form.Group>
  );

  return (
    <Form onSubmit={handleSubmit} className="text-start">
      {!acomptePaid && (
        <div className="mt-2 text-danger">
          ⚠️ Tu peux tester les options mais pas enregistrer tant que tu n'as pas payé l'acompte.
        </div>
      )}
      {modifPossible ? (
        <span className="text-success">⏳ Tu peux encore modifier tes options jusqu'au 24 octobre 2025 à 23h59.</span>
      ) : (
        <span className="text-danger">⏰ Délai expiré : tu ne peux plus modifier tes options.</span>
      )}
      {isArchi && (
        <Form.Group className="mb-3">
          <Form.Label>Es-tu toujours étudiant ? <span style={{color:'red'}}>*</span></Form.Label>
          <Form.Select name="etudiantArchi" value={form.etudiantArchi || ''} onChange={handleChange} required>
            <option value="">-- Choisir --</option>
            <option value="oui">Oui (carte étudiante demandée)</option>
            <option value="non">Non</option>
          </Form.Select>
        </Form.Group>
      )}
      {renderSelect("🎿 Quel matos tu veux louer ?", "materiel_location", ["aucun","ski + chaussures","snow + chaussures", "ski","snowboard", "chaussures"])}
      {form.materiel_location !== 'aucun' ? (
        <Form.Group className="mb-3">
          {renderSelect("📦 Choisis ton pack location (qualité du matos)", "pack_location", ["bronze", "argent", "or", "platine"])}
        </Form.Group>
      ) : (
        <Form.Group className="mb-3">
          <Form.Label>📦 Choisis ton pack location (qualité du matos)</Form.Label>
          <Form.Control disabled placeholder='Pas de location'/>
        </Form.Group>
      )}
      {renderSelect("🪖 Tu veux louer un casque ?", "casque", ["oui", "non"])}
      {renderSelect("⛷️ Quel forfait veux-tu ? (Accès aux pistes)", "type_forfait", ["standard", "étendu (+ 200km)"])}

      {/* Accordéons explicatifs pour les assurances */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>🛡️ Assurance Zen — Qu'est-ce que c'est ?</Accordion.Header>
          <Accordion.Body>
            Cette assurance te protège financièrement si tu ne peux pas participer au séjour ou si tu dois l’écourter. Elle rembourse les frais que tu as déjà payés lorsque tu es contraint d’annuler pour une raison sérieuse comme une maladie, un accident, un décès dans la famille ou des dommages importants à ton domicile. Elle couvre aussi certaines situations spécifiques liées au séjour, comme la perte ou le vol de ton forfait de ski, la fermeture des remontées mécaniques ou un accident de ski qui t’empêche de pratiquer. En cas de retour anticipé, les jours non utilisés du séjour peuvent également être remboursés. Cette assurance est donc utile si tu veux sécuriser ton argent en cas d’imprévu avant ou pendant le départ.<br/>
            <a href="/public/Assurance_Annulation.pdf" target="_blank" rel="noopener noreferrer">Voir le contrat Assurance Annulation (PDF)</a>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>🛡️ Assurance Skieur — Qu'est-ce que c'est ?</Accordion.Header>
          <Accordion.Body>
            En plus du remboursement en cas d’interruption, elle prend en charge les frais médicaux à l’étranger, organise et paie un rapatriement si nécessaire, et t’assure si tu blesses quelqu’un ou causes des dégâts matériels grâce à la responsabilité civile. Elle prévoit aussi une indemnisation en cas d’accident grave ou de décès (individuelle accident) et propose une assistance complète : aide en cas de perte ou vol de papiers, prolongation du séjour pour raisons médicales, visite d’un proche à l’hôpital, véhicule de remplacement, frais de recherche et secours, ainsi qu’une prise en charge spécifique en cas de COVID (quarantaine, modification ou achat d’un billet retour, poursuite du voyage). C’est la formule la plus complète pour voyager sereinement, car elle te couvre avant le départ, pendant le séjour et dans toutes les situations d’urgence.<br/>
            <a href="/public/Assurance_Multirisques.pdf" target="_blank" rel="noopener noreferrer">Voir le contrat Assurance Multirisques (PDF)</a>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      {renderSelect("🛡️ Quelle assurance tu prends ?", "assurance", ["aucune", "zen", "skieur", "zen+skieur"])}
      {renderSelect("😎 Tu veux un masque SKZ stylé ?", "masque", ["oui", "non"])}
      {renderSelect("🚬 Pack fumeur : tu fumes ? (zippo gravé / cendar de poche)", "pack_fumeur", ["oui", "non"])}
      {renderSelect("🎉 Tu veux le pack soirée ? (jeu de carte / Flasque gravé / Banane)", "pack_soiree", ["oui", "non"])}
      {renderSelect("🧣 Tu veux le pack grand froid ? (chaussettes / Bonnet / cache cou)", "pack_grand_froid", ["oui", "non"])}
      {renderSelect("🥖 Combien de baguettes par jour ?", "pain", ['0', '1', '2', '3'])}
      {renderSelect("🥐 Combien de croissants par jour ?", "croissant", ['0', '1', '2', '3'])}
      {renderSelect("🍫 Combien de pains au choco par jour ?", "pain_choco", ['0', '1', '2', '3'])}
      {renderSelect("🥓 Pack Saucissons (3 x 180g) ?", "saucisson", ['0', '1', '2', '3'])}
      {renderSelect("🧀 Pack Fromages (3 x 200g) ?", "fromage", ['0', '1', '2', '3'])}
      {renderSelect("🍺 Choisis ton pack bière :", "biere", [
        'aucun',
        'Blonde + Génép + Myrtille',
        'Blonde + Ambrée + Blanche',
        'Les 2 packs'
      ])}
      {renderSelect("🚌 Tu veux un bus (train pour P3) ? D'où tu pars ?", "bus", ['non', 'sibers', 'kin', 'cluns', 'p3', 'boquette', 'bordels', 'birse','chalons'])}
      {/* Message d'alerte si le bus sélectionné est plein */}
      {form.bus && form.bus !== 'non' && (() => {
        const bus = busPlaces.find(b => b.tabagns === form.bus);
        return bus && bus.nbInscrits >= bus.place;
      })() && (
        <div className="mt-2 text-danger">
          Le nombre de place max est atteint pour ce bus mais des places peuvent se débloquer, nous te tiendrons au courant
        </div>
      )}
      {renderSelect("👕 Taille du pull ?", "taille_pull", ["S", "M", "L", "XL", "XXL"])}
      {renderSelect("🥗 Régime alimentaire ?", "regime", ["normal", "vege", "halal"])}
      
      {!acomptePaid && (
        <div className="mt-2 text-danger">
          ⚠️ Tu dois d'abord payer l'acompte pour valider tes choix d'options.
        </div>
      )}
      <Button className={"mt-2"} variant="primary" type="submit" disabled={!acomptePaid}>
        {loading ? 'Enregistrement...' : 'Valider mes choix'}
      </Button>
    </Form>
  );
}
