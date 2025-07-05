import { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

export default function PasswordRequest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) navigate('/');
  }, [isSignedIn]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('reset');
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message);
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        navigate('/');
      } else if (res.status === 'needs_second_factor') {
        setError('⚠️ La double authentification est requise (non gérée ici).');
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="full-width mt-5">
      <Card className="p-4 shadow mx-auto" style={{ maxWidth: 480 }}>
        <Card.Body>
          <h3 className="text-center mb-4">🔐 Réinitialisation du mot de passe</h3>
          {error && <Alert variant="danger">{error}</Alert>}

          {step === 'request' ? (
            <Form onSubmit={handleRequest}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ex: tonmail@mail.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Envoyer le code"}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleReset}>
              <Form.Group className="mb-3">
                <Form.Label>Code reçu par email</Form.Label>
                <Form.Control
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nouveau mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Réinitialiser"}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
