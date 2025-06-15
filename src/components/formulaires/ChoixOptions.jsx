import { useEffect, useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { supabase } from '../../supabaseClient';

export default function ChoixOptions() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modeAffichage, setModeAffichage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getuser();
      const { data, error: fetchError } = await supabase
        .from('options')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm(data);
        setModeAffichage(true);
      } else {
        setForm({
          type_place: '', forfait_bouffe_seul: '', pack_location: '',
          materiel_location: '', casque: '', type_forfait: '', assurance: '',
          masque: '', pack_fumeur: '', pack_soiree: '', pack_grand_froid: '',
          pain: '0', croissant: '0', pain_choco: '0', saucisson: '0', fromage: '0', biere: '0', bus: ''
        });
        setModeAffichage(false);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getuser();

    if (form.materiel_location == 'aucun') form.pack_location = 'aucun' 
    const champsRequis = ['type_place', 'pack_location', 'materiel_location', 'forfait_bouffe_seul', 'casque', 'type_forfait', 'assurance', 'masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid', 'bus'];
    const champsNonRemplis = champsRequis.filter(champ => !form[champ]);
    if (champsNonRemplis.length > 0) {
      alert(`Merci de compléter tous les champs : ${champsNonRemplis.join(', ')}`);
      return;
    }

    const { error } = await supabase.from('options').insert({ id: user.id, ...form });
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
      {renderSelect("Tu es :", "type_place", ["PGs", "Archi", "Pek’ss"])}
      {renderSelect("Tu souhaite uniquement le pack bouffe ou le forfait", "forfait_bouffe_seul", ["Je veux les 2", "Pack bouffe seulement (PAS DE FORFAIT)", "Forfait seulement (PAS DE BOUFFE)"])}
      {renderSelect("Matériel", "materiel_location", ["aucun","complet", "ski", "chaussures"])}
      {form.materiel_location !== 'aucun' ? (
        <Form.Group className="mb-3">
          {renderSelect("Pack location", "pack_location", ["bronze", "argent", "or", "platine"])}
        </Form.Group>
      ) : (
        <Form.Group className="mb-3">
          <Form.Label>Pack location</Form.Label>
          <Form.Control disabled placeholder='Pas de location'/>
        </Form.Group>
      )
      }
      {renderSelect("Tu veux louer un casque ?", "casque", ["oui", "non"])}
      {renderSelect("Choisi ton forfait", "type_forfait", ["standard", "étendu"])}
      {renderSelect("Quels assurance veux tu prendre ?", "assurance", ["aucune", "zen", "skieur", "zen+skieur"])}
      {renderSelect("Veux-tu un masque SKZ ?", "masque", ["oui", "non"])}
      {renderSelect("Ah batard tu fumes ? (pack fumeur)", "pack_fumeur", ["oui", "non"])}
      {renderSelect("Pack Soirée", "pack_soiree", ["oui", "non"])}
      {renderSelect("Pack Grand froid", "pack_grand_froid", ["oui", "non"])}
      {renderSelect("Combien tu veux de baguette par jour ?", "pain", ['0', '1', '2', '3'])}
      {renderSelect("Combien tu veux de croissant ?", "croissant", ['0', '1', '2', '3'])}
      {renderSelect("Combien tu veux de pain choco ?", "pain_choco", ['0', '1', '2', '3'])}
      {renderSelect("Combien de saucisson ?", "saucisson", ['0', '1', '2', '3'])}
      {renderSelect("Combien de fromage ?", "fromage", ['0', '1', '2', '3'])}
      {renderSelect("Combien de bière ?", "biere", ['0', '1', '2', '3'])}
      {renderSelect("Tu veux un bus ? Dis nous d'où tu pars", "bus", ['non', 'sibers', 'kin', 'cluns', 'p3', 'boquette', 'bordels', 'birse'])}
      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Valider mes choix (DEFINITIF)'}
      </Button>
    </Form>
  );
}
