import { useState, useRef } from 'react';
import {
  Container, Form, FormGroup, Label, Input, Button, Alert, Spinner, Collapse
} from 'reactstrap';
import { useSignUp, useAuth} from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';

export default function RegisterAndVerify() {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  const userMetadataRef = useRef(null);
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [formData, setFormData] = useState({
    bucque: '',
    num: '',
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    numero: '',
    tabagns: '',
    proms: 0,
    peks: false
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { email, password, confirmPassword, prenom, nom, numero, peks } = formData;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return setLoading(false);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Adresse email invalide.");
      return setLoading(false);
    }

    const phoneRegex = /^(0[67]\d{8}|\+[\d]{6,15})$/;
    if (!phoneRegex.test(numero.replace(/\s/g, ''))) {
      setError("Numéro invalide.");
      return setLoading(false);
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!pwdRegex.test(password) || password.length < 8) {
      setError("Mot de passe invalide.");
      return setLoading(false);
    }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          email,
          numero,
          prenom,
          nom,
          peks,
          num: peks ? null : formData.num,
          bucque: peks ? null : formData.bucque,
          proms: peks ? null : formData.proms,
          tabagns: peks ? null : formData.tabagns,
        },
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      userMetadataRef.current = {
        prenom,
        nom,
        numero,
        peks,
        num: peks ? null : formData.num,
        bucque: peks ? null : formData.bucque,
        proms: peks ? null : formData.proms,
        tabagns: peks ? null : formData.tabagns,
      };
      setStep('verify');
    } catch (err) {
      console.error("Erreur brut Clerk:", err);
      const fallback =
        typeof err === 'string' ? err :
        err?.errors?.[0]?.message ||
        err?.message ||
        JSON.stringify(err, null, 2) ||
        "Erreur inconnue";

      setError(fallback);
    }

    setLoading(false);
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: result.createdSessionId });

      // 🔐 Récupération du token Clerk
      const token = await getToken({ template: 'supabase' });

      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const metadata = userMetadataRef.current;
      const {
        prenom, nom, numero, num: nums, tabagns, proms, bucque, peks,
      } = metadata;

      const { error: insertError } = await supabase.from('profils').insert([{
        prenom,
        nom,
        numero,
        nums,
        bucque,
        proms,
        tabagns,
        peks,
      }]);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        setError("Erreur lors de l'enregistrement du profil.");
        setLoading(false);
        return;
      }

      setStep('done');
      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      console.error("Clerk verification error:", err);
      const msg = err?.errors?.[0]?.message || err?.message || 'Erreur lors de la vérification.';
      setError(msg);
    }

    setLoading(false);
  };




    

  if (!isLoaded) return null;

  return (
    <Container className="mt-4 p-4 border rounded shadow" style={{ maxWidth: 600 }}>
      <h2 className="text-center text-primary mb-3">
        {step === 'register' ? 'Créer un compte' : 'Vérifie ton email'}
      </h2>

      {error && <Alert color="danger">{error}</Alert>}

      {step === 'register' && (
        <Form onSubmit={handleRegister}>
          <FormGroup check className="mb-3 d-flex align-items-center gap-2">
            <Input type="checkbox" name="peks" checked={formData.peks} onChange={handleChange} style={{ width: '1.5rem', height: '1.5rem' }} />
            <Label check>Je suis un Pek’s (non-gadz) ?</Label>
          </FormGroup>

          <FormGroup><Label>Prénom</Label><Input name="prenom" value={formData.prenom} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Nom</Label><Input name="nom" value={formData.nom} onChange={handleChange} required /></FormGroup>

          <Collapse isOpen={!formData.peks}>
            <FormGroup><Label>Bucque</Label><Input name="bucque" value={formData.bucque} onChange={handleChange} required={!formData.peks} /></FormGroup>
            <FormGroup><Label>Num'ss</Label><Input name="num" value={formData.num} onChange={handleChange} required={!formData.peks} /></FormGroup>
            <FormGroup>
              <Label>Tabagn's</Label>
              <Input type="select" name="tabagns" value={formData.tabagns} onChange={handleChange} required={!formData.peks}>
                <option value="">-- Choisir --</option>
                <option value="sibers">Siber's</option>
                <option value="kin">KIN</option>
                <option value="cluns">Clun's</option>
                <option value="p3">P3</option>
                <option value="boquette">Boquette</option>
                <option value="bordels">Bordel's</option>
                <option value="birse">Birse</option>
              </Input>
            </FormGroup>
            <FormGroup><Label>Prom's</Label><Input type="number" name="proms" value={formData.proms} onChange={handleChange} required={!formData.peks} /></FormGroup>
          </Collapse>

          <FormGroup><Label>Email</Label><Input type="email" name="email" value={formData.email} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Numéro</Label><Input type="tel" name="numero" value={formData.numero} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Mot de passe</Label><Input type="password" name="password" value={formData.password} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Confirmer</Label><Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></FormGroup>

          <Button color="primary" type="submit" block disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Créer mon compte'}
          </Button>
        </Form>
      )}
      {step === 'verify' && (
        <Form onSubmit={handleVerification}>
          <p>Un code a été envoyé à <strong>{formData.email}</strong>. Vérifie ta boîte mail.</p>
          <FormGroup>
            <Label>Code reçu</Label>
            <Input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: 123456" required />
          </FormGroup>
          <Button type="submit" color="primary" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Vérifier le code'}
          </Button>
        </Form>
      )}
      {step === 'done' && (
        <Alert color="success" className="text-center">
          ✅ Ton email a été vérifié avec succès. <br />
          🔄 Redirection en cours...
        </Alert>
      )}
    </Container>
  );
}
