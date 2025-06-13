import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PasswordSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center text-black px-4">
      <div className="bg-green-100 border border-green-300 text-green-800 rounded p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">✅ Mot de passe changé avec succès !</h1>
        <p className="text-sm">Redirection vers l’accueil...</p>
      </div>
    </div>
  )
}
