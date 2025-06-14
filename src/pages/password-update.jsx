import React, { useState, useEffect } from 'react';
import {
  Container, Form, FormGroup, Label, Input, Button, Alert, Spinner
} from 'reactstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function withTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

export default function UpdatePassword() {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInvalid, setUrlInvalid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifie que l'URL contient bien un token de récupération
  useEffect(() => {


    if (success) {
      const timeout = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate,location]);

  const validatePassword = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    return hasUpper && hasLower && hasDigit;
  };

  const handleSubmit = async () => {
    if (isLoading || urlInvalid) return;
    setIsLoading(true);
    setMessage("");

    if (!password1 || !password2) {
      setMessage("Merci de remplir les deux champs.");
      setIsLoading(false);
      return;
    }

    if (password1 !== password2) {
      setMessage("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password1)) {
      setMessage("Ton mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await withTimeout(
        supabase.auth.updateUser({ password: password1 }),
        4000
      );

      if (error) {
        setMessage(`Erreur lors de la mise à jour du mot de passe : ${error.message}`);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      if (err.message === 'Timeout') {
        setSuccess(true);
      } else {
        setMessage("Erreur inattendue : " + err.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 500 }}>
      <h2 className="text-center mb-4">🔐 Nouveau mot de passe</h2>

      {urlInvalid && (
        <Alert color="danger" className="text-center">
          ❌ Ce lien n’est plus valide ou a déjà été utilisé. Merci de redemander une réinitialisation.
        </Alert>
      )}

      {message && !urlInvalid && (
        <Alert color="danger" className="text-center">
          {message}
        </Alert>
      )}

      {success && (
        <Alert color="success" className="text-center">
          ✅ Ton mot de passe a été mis à jour !<br />
          🔄 Redirection vers l'accueil dans 2 secondes...
        </Alert>
      )}

      {!success && !urlInvalid && (
        <Form>
          <FormGroup>
            <Label for="password1">Nouveau mot de passe</Label>
            <Input
              id="password1"
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label for="password2">Confirmer le mot de passe</Label>
            <Input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </FormGroup>

          <Button
            color="primary"
            block
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? <><Spinner size="sm" /> Mise à jour...</> : 'Mettre à jour'}
          </Button>
        </Form>
      )}
    </Container>
  );
}
