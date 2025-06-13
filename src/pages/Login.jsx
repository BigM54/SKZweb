import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleResetPassword = async () => {
    const email = prompt("Entre ton adresse email pour réinitialiser ton mot de passe :")
    if (!email) return

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password' 
    })

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      alert("Un email de réinitialisation a été envoyé si ton mail est dans la base de donnée.")
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { email, password } = formData

    // Validation simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("L'adresse email est invalide.")
      return
    }

    if (!password.trim()) {
      setError("Veuillez entrer votre mot de passe.")
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError("Identifiants incorrects ou utilisateur non inscrit.")
    else navigate('/') // ✅ Redirection après connexion réussie
  }

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError("Erreur de connexion avec " + provider)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Connexion</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
          Tu n’as pas de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Crée un compte ici
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-blue-600 hover:underline cursor-pointer" onClick={handleResetPassword}>
          Mot de passe oublié ?
        </p>
      </form>
    </div>
  )
}
