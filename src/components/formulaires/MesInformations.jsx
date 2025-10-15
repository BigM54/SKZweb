
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Collapse } from 'react-bootstrap';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function MesInformations() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    bucque: '',
    num: '',
    prenom: '',
    nom: '',
    numero: '',
    tabagns: '',
    proms: null,
    peks: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const email = user.primaryEmailAddress?.emailAddress;
      const { data: profil } = await supabase.from('profils').select('*').eq('email', email).single();
      if (profil) {
        setForm({
          bucque: profil.bucque || '',
          num: profil.nums || '',
          prenom: profil.prenom || '',
          nom: profil.nom || '',
          numero: profil.numero || '',
          tabagns: profil.tabagns || '',
          proms: profil.proms || null,
          peks: profil.peks || false
        });
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
    setError(null);
    setSuccess(false);

    // Validation stricte des champs principaux, num devient facultatif
    const { prenom, nom, numero, num, bucque, tabagns, proms, peks } = form;
    const phoneRegex = /^(0[67]\d{8}|\+[\d]{6,15})$/;
    if (!prenom || prenom.length < 2) {
      setError("Prénom invalide.");
      setLoading(false);
      return;
    }
    if (!nom || nom.length < 2) {
      setError("Nom invalide.");
      setLoading(false);
      return;
    }
    if (!phoneRegex.test(numero.replace(/\s/g, ''))) {
      setError("Numéro invalide.");
      setLoading(false);
      return;
    }
    if (!peks) {
      if (num && !/^\d{1,3}(-\d{1,3})*$/.test(num)) {
        setError("Format du champ num invalide. Exemple attendu : 12-234-2-34");
        setLoading(false);
        return;
      }
      const promsInt = parseInt(proms, 10);
      if (isNaN(promsInt)) {
        setError("Le champ Prom's doit être un entier valide (ex: 224).");
        setLoading(false);
        return;
      }
      if (!tabagns) {
        setError("Tabagn's obligatoire.");
        setLoading(false);
        return;
      }
    }


    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const email = user.primaryEmailAddress?.emailAddress;
      // Update profils
      const res1 = await supabase.from('profils').update({
        prenom: form.prenom,
        nom: form.nom,
        numero: form.numero,
        peks: form.peks,
        bucque: form.peks ? null : form.bucque,
        nums: form.peks ? null : form.num,
        proms: form.peks ? null : form.proms,
        tabagns: form.peks ? null : form.tabagns
      }).eq('email', email);
      console.log('Update profils:', res1);

      // Ajout/MAJ des nums dans cousin (format nums1, nums2, ...), num facultatif
      const numsArr = (form.num || '').split('-').filter(Boolean);
      const cousinData = {
        numero: form.numero,
        bucque: form.bucque,
      };
      for (let i = 0; i < 6; i++) {
        cousinData[`nums${i+1}`] = numsArr[i] || '';
      }
      // On update explicitement la bucque aussi
      const { error: cousinError } = await supabase.from('cousin').update(cousinData).eq('email', email);
      if (cousinError) {
        console.error('Supabase cousin update error:', cousinError);
        setError("Erreur lors de l'enregistrement des cousins.");
        setLoading(false);
        return;
      }

      if (res1.error) throw new Error('Erreur lors de la mise à jour.');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (loading) return <Spinner animation="border" variant="primary" />;

  return (
    <div className="full-width mt-4 p-4 border rounded shadow">
      <h2 className="text-center text-primary mb-3">Mes informations</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Modifications enregistrées !</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Prénom <span style={{color:'red'}}>*</span></Form.Label>
          <Form.Control name="prenom" value={form.prenom} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nom <span style={{color:'red'}}>*</span></Form.Label>
          <Form.Control name="nom" value={form.nom} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Numéro <span style={{color:'red'}}>*</span></Form.Label>
          <Form.Control name="numero" value={form.numero} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check type="checkbox" label="Je suis un Pek’s (non-gadz, les .onscrits vous êtes pas Pek's) ?" name="peks" checked={form.peks} onChange={e => setForm(f => ({ ...f, peks: e.target.checked }))} />
        </Form.Group>
        <Collapse in={!form.peks}>
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Bucque <span style={{color:'red'}}>*</span></Form.Label>
              <Form.Control name="bucque" value={form.bucque} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Num's / Fam's <span style={{color:'gray'}}>(facultatif)</span></Form.Label>
                <Form.Control name="num" value={form.num} onChange={handleChange} placeholder="Ex: 12-234-2-34 (facultatif)" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tabagn's (Campus) <span style={{color:'red'}}>*</span></Form.Label>
              <Form.Select name="tabagns" value={form.tabagns} onChange={handleChange} required>
                <option value="">-- Choisir --</option>
                <option value="sibers">Siber's</option>
                <option value="kin">KIN</option>
                <option value="cluns">Clun's</option>
                <option value="p3">P3</option>
                <option value="boquette">Boquette</option>
                <option value="bordels">Bordel's</option>
                <option value="birse">Birse</option>
                <option value="chalons">Chalon's</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prom's (1A : 225, 2A : 224) <span style={{color:'red'}}>*</span></Form.Label>
              <Form.Control type="number" name="proms" value={form.proms} onChange={handleChange} />
            </Form.Group>
          </div>
        </Collapse>
        <Button type="submit" variant="primary" disabled={loading}>Enregistrer</Button>
      </Form>
    </div>
  );
}
