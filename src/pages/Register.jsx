import React, { useState, useEffect } from 'react';
import {
  Container, Form, FormGroup, Label, Input, Button, Alert, Spinner, Collapse
} from 'reactstrap';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        navigate('/');
      }
    });
  }, [navigate]);

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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { email, password, confirmPassword, prenom, nom, numero, peks } = formData;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Adresse email invalide.");
      setLoading(false);
      return;
    }

    const phoneRegex = /^(0[67]\d{8}|\+[\d]{6,15})$/;

    if (!phoneRegex.test(numero.replace(/\s/g, ''))) {
      setError("Numéro invalide. Accepte 06/07XXXXXXXX ou un format international comme +33612345678.");
      setLoading(false);
      return;
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!pwdRegex.test(password) || password.length < 8) {
      setError("Mot de passe invalide (au moins 8 caractères, majuscule, minuscule, chiffre).");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email,
          numero,
          prenom,
          nom,
          peks,
          num: peks ? null : formData.num,
          bucque: peks ? null : formData.bucque,
          proms: peks ? null : formData.proms,
          tabagns: peks ? null : formData.tabagns,
        }
      }
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Container className="mt-4 p-4 border rounded shadow" style={{ maxWidth: 600 }}>
        <h2 className="text-center text-primary mb-3">Créer un compte</h2>
        {error && <Alert color="danger">{error}</Alert>}
        {success && (
          <Alert color="success">
            🎉 Compte créé ! Un email de confirmation a été envoyé à {formData.email}.<br />
            🕐 Tu as <strong>1 heure</strong> pour vérifier ton adresse avant expiration.
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <FormGroup check className="mb-3 d-flex align-items-center gap-2">
            <Input
              type="checkbox"
              name="peks"
              checked={formData.peks}
              onChange={handleChange}
              style={{ width: '1.5rem', height: '1.5rem' }}
            />
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
  <FormGroup><Label>Numéro de téléphone</Label><Input type="tel" name="numero" value={formData.numero} onChange={handleChange} required/>
  </FormGroup>

          <FormGroup><Label>Mot de passe</Label><Input type="password" name="password" value={formData.password} onChange={handleChange} required /></FormGroup>
          <FormGroup><Label>Confirmer le mot de passe</Label><Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></FormGroup>

          <Button color="primary" type="submit" block disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Créer mon compte'}
          </Button>
        </Form>
      </Container>
    </div>
  );
}
