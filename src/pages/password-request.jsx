import React, { useState } from 'react';
import {
  Container, Form, FormGroup, Label, Input, Button, Alert, Spinner
} from 'reactstrap';
import { supabase } from '../supabaseClient';

export default function PasswordRequest() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-update`, // page de redirection après changement
    });

    setLoading(false);

    if (error) {
      setStatus('error');
      setMessage("Erreur lors de l'envoi de l'e-mail. Vérifie l'adresse.");
    } else {
      setStatus('success');
      setMessage("📧 Si tu es inscrit, un e-mail de réinitialisation a été envoyé !");
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 500 }}>
      <h3 className="text-center mb-4">Mot de passe oublié</h3>

      {status && (
        <Alert color={status === 'success' ? 'success' : 'danger'}>
          {message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="email">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@domaine.com"
          />
        </FormGroup>

        <Button color="primary" type="submit" disabled={loading} block>
          {loading ? <Spinner size="sm" /> : "Envoyer le lien"}
        </Button>
      </Form>
    </Container>
  );
}
