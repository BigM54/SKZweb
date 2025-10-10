import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function ChoixOptions() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modeAffichage, setModeAffichage] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();
  const [acomptePaid, setAcomptePaid] = useState(null);
  const [acompteDate, setAcompteDate] = useState(null);
  const [joursRestants, setJoursRestants] = useState(null);
  const [paiement3Montant, setPaiement3Montant] = useState(null);

  // Récupère d'un coup les données options et paiements
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      if (!user?.primaryEmailAddress?.emailAddress) return;
      const email = user.primaryEmailAddress.emailAddress;

      // Récupère options et acompte en parallèle
      const [{ data: optionsData }, { data: paiementData }] = await Promise.all([
        supabase.from('options').select('*').eq('id', user.id).single(),
        supabase.from('Paiements').select('acompteStatut, dateAcompte, paiement3Montant').eq('email', email).single(),
      ]);

      if (optionsData) {
        setForm(optionsData);
        setModeAffichage(true);
      } else {
        setForm({
          pack_location: '',
          materiel_location: '', casque: '', type_forfait: '', assurance: '',
          masque: '', pack_fumeur: '', pack_soiree: '', pack_grand_froid: '',
          pain: '0', croissant: '0', pain_choco: '0', saucisson: '0', fromage: '0', biere: '', bus: ''
        });
        setModeAffichage(false);
      }
      setAcomptePaid(paiementData?.acompteStatut);
      setAcompteDate(paiementData?.dateAcompte);
      setPaiement3Montant(paiementData?.paiement3Montant || 0);
      // Calcul du temps restant
      if (paiementData?.dateAcompte) {
        const acompteDateObj = new Date(paiementData.dateAcompte);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - acompteDateObj.getTime()) / (1000 * 60 * 60 * 24));
        setJoursRestants(Math.max(0, 7 - diffDays));
      }
      setLoading(false);
    };
    fetchData();
  }, [user, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.materiel_location === 'aucun') form.pack_location = 'aucun';

    const champsRequis = [
      'materiel_location', 'casque', 'type_forfait', 'assurance',
      'masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid', 'bus', 'taille_pull', 'regime', 'biere'
    ];
    const champsNonRemplis = champsRequis.filter(champ => !form[champ]);
    if (champsNonRemplis.length > 0) {
      alert(`Merci de compléter tous les champs : ${champsNonRemplis.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const token = await getToken({ template: 'supabase' });

      // Appel Edge Function
      const response = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/functions/v1/update_montant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form })
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
    return (
      <>
        <div className="mb-3">
          <h4>💰 Total : {paiement3Montant + 425} €</h4>
          <p>
            (25€ + 200€ + 200€ + {paiement3Montant}€)
          </p>
        </div>
        {/* Affichage du délai restant ou expiré */}
        {acomptePaid && acompteDate && (
          <div className="mb-3">
            {joursRestants > 0 ? (
              <span className="text-success">⏳ Il te reste <strong>{joursRestants} jour{joursRestants > 1 ? 's' : ''}</strong> pour modifier tes options.</span>
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
        <Button variant="primary" className="mt-3" onClick={() => setModeAffichage(false)} disabled={joursRestants === 0}>
          Modifier mes options
        </Button>
      </>
    );
  }

  // Prix pour affichage
  const prixAffichage = {
    pack_location: {
      bronze: 75, argent: 95, or: 112, platine: 147
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
      p3: 120,
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
          // Prix total pour les packs à quantité
          if (["pain","croissant","pain_choco","saucisson","fromage"].includes(name)) {
            const n = parseInt(opt);
            prix = n > 0 ? ` (${n * prixAffichage[name]}€)` : '';
          }
          if (name === 'pack_location') prix = prixAffichage.pack_location[opt] ? ` (${prixAffichage.pack_location[opt]}€)` : '';
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
          return <option key={opt} value={opt}>{opt}{prix}</option>;
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
      {renderSelect("🚌 Tu veux un bus ? D'où tu pars ?", "bus", ['non', 'sibers', 'kin', 'cluns', 'p3', 'boquette', 'bordels', 'birse','chalons'])}
      {renderSelect("👕 Taille du pull ?", "taille_pull", ["S", "M", "L", "XL", "XXL"])}
      {renderSelect("🥗 Régime alimentaire ?", "regime", ["normal", "vege", "halal"])}
      
      {!acomptePaid && (
        <div className="mt-2 text-danger">
          ⚠️ Tu dois d'abord payer l'acompte pour valider tes choix d'options.
        </div>
      )}
      {acomptePaid && acompteDate && (
        <div className="mt-2">
          {joursRestants > 0 ? (
            <span className="text-success">⏳ Il te reste <strong>{joursRestants} jour{joursRestants > 1 ? 's' : ''}</strong> pour modifier tes options.</span>
          ) : (
            <span className="text-danger">⏰ Délai expiré : tu ne peux plus modifier tes options.</span>
          )}
        </div>
      )}
      <Button className={"mt-2"} variant="primary" type="submit" disabled={acomptePaid && acompteDate && joursRestants === 0}>
        {loading ? 'Enregistrement...' : 'Valider mes choix'}
      </Button>
    </Form>
  );
}
