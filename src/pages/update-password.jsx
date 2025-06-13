import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useEffect } from 'react'

function withTimeout(promise, timeout) { // Cette fonciton permet de bypass un await qui ne renvoie rien (et donc bloc le code)
  return Promise.race([                 // C'est le cas de updateUser qui quand il n'y a pas d'erreur change le mdp mais ne passe pas a la suite
    promise,                            // C'est à corriger car si il y a une erreur qui survient après le timeout on ne peut le savoir
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}

export default function UpdatePassword() {
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validatePassword = (password) => {
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasDigit = /\d/.test(password)
    return hasUpper && hasLower && hasDigit
  }

  const handleSubmit = async () => {
    setIsLoading("true")
    setMessage("")

    if (!password1 || !password2) {
      setMessage("Merci de remplir les deux champs.")
      return
    }

    if (password1 !== password2) {
      setMessage("Les mots de passe ne correspondent pas.")
      return
    }

    if (!validatePassword(password1)) {
      setMessage("Ton mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre.")
      return
    }

    try {
      const { data, error } = await withTimeout(
        supabase.auth.updateUser({ password: password1 }),
        4000 // ← Timeout de 4s
      )

      if (error) {
        setMessage(`Erreur lors de la mise à jour du mot de passe : ${error.message}`)
        return
      }

      // succès normal
      navigate("/password-success")
    } catch (err) {
      if (err.message === 'Timeout') {
        //On considère que c'est bon alors que c'est juste un timeout pcq updateUser bloque en cas de succes
        navigate("/password-success")
      } else {
        setMessage("Erreur inattendue : " + err.message)
      }
      setIsLoading("false")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-32 px-6 text-black">
      <h2 className="text-2xl font-semibold mb-6 text-center">🔐 Nouveau mot de passe</h2>
      {message && (
        <div
          className={`mt-4 p-3 rounded text-center font-semibold text-sm bg-red-100 text-red-700 border border-red-300`}
        >
          {message}
        </div>
      )}
      <label className="block mb-2">Nouveau mot de passe</label>
      <input
        type="password"
        value={password1}
        onChange={(e) => setPassword1(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />
      <label className="block mb-2">Confirmer le mot de passe</label>
      <input
        type="password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full py-2 rounded transition ${
          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {isLoading ? "Mise à jour (veuillez patienter)" : "Mettre à jour"}
      </button>
    </div>
  )
}
