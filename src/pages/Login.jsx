import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Container,
} from 'react-bootstrap'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { //redirection en cas d'user deja co
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { email, password } = formData

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("L'adresse email est invalide.")
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Veuillez entrer votre mot de passe.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) setError("Identifiants incorrects ou utilisateur non inscrit.")
    else navigate('/')
  }

  return (
    <Container style={{ maxWidth: 450 }} className="mt-5">
      <Card className="p-4 shadow">
        <Card.Body>
          <h2 className="text-center mb-4 text-primary">Connexion</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez votre email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mot de passe"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <span className="text-dark">Tu n’as pas de compte ? </span>
            <Card.Link href="/register">
              Crée un compte ici
            </Card.Link>
          </div>

          <div className="text-center mt-2">
            <Card.Link href="/password-request">
              Mot de passe oublié ?
            </Card.Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}
