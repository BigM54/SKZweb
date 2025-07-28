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
  const [total, setTotal] = useState(0);
  const [acomptePaid, setAcomptePaid] = useState(null);

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
        supabase.from('Paiements').select('acompteStatut').eq('email', email).single(),
      ]);

      if (optionsData) {
        setForm(optionsData);
        setModeAffichage(true);
      } else {
        setForm({
          pack_location: '',
          materiel_location: '', casque: '', type_forfait: '', assurance: '',
          masque: '', pack_fumeur: '', pack_soiree: '', pack_grand_froid: '',
          pain: '0', croissant: '0', pain_choco: '0', saucisson: '0', fromage: '0', biere: '0', bus: ''
        });
        setModeAffichage(false);
      }
      setAcomptePaid(paiementData?.acompteStatut);
      setLoading(false);
    };
    fetchData();
  }, [user, getToken]);

  useEffect(() => {
    if (form) {
      const newTotal = calculateTotal();
      setTotal(newTotal);
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const prix = {
      pack_location: { snowboard: { bronze: 68, argent: 88, or: 108, platine: 142 }, ski: { bronze: 68, argent: 88, or: 108, platine: 142 }, chaussures: { bronze: 51, argent: 73, or: 94, platine: 127 }, complet: { bronze: 75, argent: 92, or: 112, platine: 147 } },
      casque: { oui: 28, non: 0 },
      type_forfait: { standard: 0, étendu: 50 },
      assurance: { aucune: 0, zen: 38, skieur: 37, 'zen+skieur': 55 },
      masque: { oui: 48, non: 0 },
      pack_fumeur: { oui: 10, non: 0 },
      pack_soiree: { oui: 12, non: 0 },
      pack_grand_froid: { oui: 14, non: 0 },
      pain: 12, croissant: 10, pain_choco: 13,
      saucisson: 13, fromage: 15, biere: 12,
      bus: { non: 0, sibers: 125, kin: 115, cluns: 105, p3: 115, boquette: 130, bordels: 125, birse: 130, chalons: 120 }
    };

    const total =
      459+
      (prix.pack_location[form.materiel_location]?.[form.pack_location] || 0) +
      (prix.casque[form.casque] || 0) +
      (prix.type_forfait[form.type_forfait] || 0) +
      (prix.assurance[form.assurance] || 0) +
      (prix.masque[form.masque] || 0) +
      (prix.pack_fumeur[form.pack_fumeur] || 0) +
      (prix.pack_soiree[form.pack_soiree] || 0) +
      (prix.pack_grand_froid[form.pack_grand_froid] || 0) +
      (parseInt(form.pain || '0') * prix.pain) +
      (parseInt(form.croissant || '0') * prix.croissant) +
      (parseInt(form.pain_choco || '0') * prix.pain_choco) +
      (parseInt(form.saucisson || '0') * prix.saucisson) +
      (parseInt(form.fromage || '0') * prix.fromage) +
      (parseInt(form.biere || '0') * prix.biere) +
      (prix.bus[form.bus] || 0);

    return total;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ← Important de le mettre en haut

    // Si pas de location, on force pack_location à 'aucun'
    if (form.materiel_location === 'aucun') form.pack_location = 'aucun';

    // Vérification des champs requis
    const champsRequis = [
      'materiel_location', 'casque', 'type_forfait', 'assurance',
      'masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid', 'bus'
    ];
    const champsNonRemplis = champsRequis.filter(champ => !form[champ]);
    if (champsNonRemplis.length > 0) {
      alert(`Merci de compléter tous les champs : ${champsNonRemplis.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const token = await getToken({ template: 'supabase' });

      // Appel de l’Edge Function pour mettre à jour le montant
      const response = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/functions/v1/update_montant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du calcul montant');
      }

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
          <h4>💰 Total : {total} €</h4>
          <p>
            (50€ + 200€ + 200€ + {total-450}€)
          </p>
        </div>
        <h5 className="mb-3">Récapitulatif de tes choix :</h5>
        {Object.entries(form)
          .filter(([cle]) => cle !== 'Date_boulangerie')
          .map(([cle, val]) => (
            <div key={cle}><strong>{cle}</strong>: {val}</div>
          ))}
        <Button variant="primary" className="mt-3" onClick={() => setModeAffichage(false)}>
          Modifier mes options
        </Button>
      </>
    );
  }

  const renderSelect = (label, name, options) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Select name={name} value={form[name]} onChange={handleChange}>
        <option value="">-- Choisir --</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </Form.Select>
    </Form.Group>
  );

  return (
    <Form onSubmit={handleSubmit} className="text-start">
      {!acomptePaid && (
        <div className="mt-2 text-danger">
          ⚠️ Tu peux tester les options mais pas enregistrer tant que tu n'as pas payer l'acompte.
        </div>
      )}
      {renderSelect("🎿 Quel matos tu veux louer ?", "materiel_location", ["aucun","complet", "ski","snowboard", "chaussures"])}
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
      {renderSelect("⛷️ Quel forfait veux-tu ? (Accès aux pistes)", "type_forfait", ["standard", "étendu"])}
      {renderSelect("🛡️ Quelle assurance tu prends ?", "assurance", ["aucune", "zen", "skieur", "zen+skieur"])}
      {renderSelect("😎 Tu veux un masque SKZ stylé ?", "masque", ["oui", "non"])}
      {renderSelect("🚬 Pack fumeur : tu fumes ?", "pack_fumeur", ["oui", "non"])}
      {renderSelect("🎉 Tu veux le pack soirée ?", "pack_soiree", ["oui", "non"])}
      {renderSelect("🧣 Tu veux le pack grand froid ?", "pack_grand_froid", ["oui", "non"])}
      {renderSelect("🥖 Combien de baguettes par jour ?", "pain", ['0', '1', '2', '3'])}
      {renderSelect("🥐 Combien de croissants par jour ?", "croissant", ['0', '1', '2', '3'])}
      {renderSelect("🍫 Combien de pains au choco par jour ?", "pain_choco", ['0', '1', '2', '3'])}
      {renderSelect("🥓 Combien de saucissons (par 3) ?", "saucisson", ['0', '1', '2', '3'])}
      {renderSelect("🧀 Combien de fromages (par 3) ?", "fromage", ['0', '1', '2', '3'])}
      {renderSelect("🍺 Combien de bières (par 3) ?", "biere", ['0', '1', '2', '3'])}
      {renderSelect("🚌 Tu veux un bus ? D'où tu pars ?", "bus", ['non', 'sibers', 'kin', 'cluns', 'p3', 'boquette', 'bordels', 'birse','chalons'])}
      
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          zIndex: 1050,
          boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <strong>💰 Total : {total} €</strong>
      </div>
      {!acomptePaid && (
        <div className="mt-2 text-danger">
          ⚠️ Tu dois d'abord payer l'acompte pour valider tes choix d'options.
        </div>
      )}
      <Button className={"mt-2"} variant="primary" type="submit">
        {loading ? 'Enregistrement...' : 'Valider mes choix (DEFINITIF)'}
      </Button>
    </Form>
  );
}
