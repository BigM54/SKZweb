import { useEffect, useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth, useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function ChoixOptions() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modeAffichage, setModeAffichage] = useState(false);
  const {getToken} = useAuth()
  const { user} = useUser();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      const { data, error } = await supabase
        .from('options')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm(data);
        setModeAffichage(true);
      } else {
        setForm({
          pack_location: '',
          materiel_location: '', casque: '', type_forfait: '', assurance: '',
          masque: '', pack_fumeur: '', pack_soiree: '', pack_grand_froid: '',
          pain: '0', croissant: '0', pain_choco: '0', saucisson: '0', fromage: '0', biere: '0', bus: ''})
        setModeAffichage(false);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!modeAffichage && form) {
      const newTotal = calculateTotal();
      console.log('💸 Nouveau total :', newTotal);
      setTotal(newTotal);
    }
  }, [form, modeAffichage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    console.log("oui")
    let total = 459;

    // Matériel de location
    if (form.materiel_location === 'complet') {
      const packPrices = { bronze: 75, argent: 92, or: 112, platine: 147 };
      total += packPrices[form.pack_location] || 0;
    }

    if (form.materiel_location === 'ski' || form.materiel_location === 'snowboard') {
      const packPrices = { bronze: 68, argent: 88, or: 108, platine: 142 };
      total += packPrices[form.pack_location] || 0;
    }

    if (form.materiel_location === 'chaussures') {
      const packPrices = { bronze: 51, argent: 73, or: 94, platine: 127 };
      total += packPrices[form.pack_location] || 0;
    }

    // Casque
    if (form.casque === 'oui') total += 28;

    // Forfait
    if (form.type_forfait === 'étendu') total += 50;

    // Assurance
    const assurancePrices = { zen: 38, skieur: 37, 'zen+skieur': 55 };
    total += assurancePrices[form.assurance] || 0;

    // Goodies
    if (form.masque === 'oui') total += 48;
    if (form.pack_fumeur === 'oui') total += 10;
    if (form.pack_soiree === 'oui') total += 12;
    if (form.pack_grand_froid === 'oui') total += 14;

    // Pack bon vivant
    total += parseInt(form.pain || 0) * 12;
    total += parseInt(form.croissant || 0) * 10;
    total += parseInt(form.pain_choco || 0) * 10;
    total += parseInt(form.saucisson || 0) * 13;
    total += parseInt(form.fromage || 0) * 15;
    total += parseInt(form.biere || 0) * 12;

    // Bus
    const busPrices = { non: 0, sibers: 125, kin: 115, cluns: 105, p3: 115, boquette: 130, bordels: 125, birse: 130,chalons: 120 };
    total += busPrices[form.bus] || 0;

    return total;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.materiel_location === 'aucun') form.pack_location = 'aucun';

    const champsRequis = ['materiel_location', 'casque', 'type_forfait', 'assurance', 'masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid', 'bus'];
    const champsNonRemplis = champsRequis.filter(champ => !form[champ]);
    if (champsNonRemplis.length > 0) {
      alert(`Merci de compléter tous les champs : ${champsNonRemplis.join(', ')}`);
      return;
    }

    const token = await getToken({ template: 'supabase' });
    const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { error } = await supabase.from('options').insert({
      ...form,
      id: user.id
    });

    setLoading(false);
    if (error) {
      alert('Erreur lors de la sauvegarde');
    } else {
      alert('Options enregistrées ✅');
      setModeAffichage(true);
    }
  };

  if (loading || !form) return <Spinner animation="border" variant="primary" />;

  if (modeAffichage) {
    return (
      <>
        <h5 className="mb-3">Récapitulatif de tes choix :</h5>
        {Object.entries(form).map(([cle, val]) => (
          <div key={cle}><strong>{cle}</strong>: {val}</div>
        ))}
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
    <Form onSubmit={handleSubmit}>
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

      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Valider mes choix (DEFINITIF)'}
      </Button>
    </Form>


  );
}
