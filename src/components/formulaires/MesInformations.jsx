import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function MesInformations() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    bucque: '',
    nums: '',
    numero: '',
    tabagns: ''
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
          nums: profil.nums || '',
          numero: profil.numero || '',
          tabagns: profil.tabagns || ''
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

    // Validation stricte des 4 champs
    const { numero, nums, bucque, tabagns } = form;
    const phoneRegex = /^(0[67]\d{8}|\+[\d]{6,15})$/;
    if (!phoneRegex.test(numero.replace(/\s/g, ''))) {
      setError("Numéro invalide.");
      setLoading(false);
      return;
    }
    if (!bucque || bucque.length < 2) {
      setError("Bucque invalide.");
      setLoading(false);
      return;
    }
    if (!nums || !/^\d{1,3}(-\d{1,3})*$/.test(nums)) {
      setError("Format du champ num invalide. Exemple attendu : 12-234-2-34");
      setLoading(false);
      return;
    }


    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const email = user.primaryEmailAddress?.emailAddress;
      // Update profils
      const res1 = await supabase.from('profils').update({
        bucque: form.bucque,
        nums: form.nums,
        numero: form.numero,
        tabagns: form.tabagns
      }).eq('email', email);
      console.log('Update profils:', res1);

      // Ajout/MAJ des nums dans cousin (format nums1, nums2, ...)
      const numsArr = form.nums.split('-');
      const cousinData = {
        numero: form.numero,
        bucque: form.bucque,
      };
      numsArr.forEach((n, i) => {
        cousinData[`nums${i+1}`] = n;
      });
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
          <Form.Label>Bucque</Form.Label>
          <Form.Control name="bucque" value={form.bucque} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Num'ss</Form.Label>
          <Form.Control name="nums" value={form.nums} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Numéro</Form.Label>
          <Form.Control name="numero" value={form.numero} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tabagn's</Form.Label>
          <Form.Select name="tabagns" value={form.tabagns} onChange={handleChange}>
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
        <Button type="submit" variant="primary" disabled={loading}>Enregistrer</Button>
      </Form>
    </div>
  );
}
