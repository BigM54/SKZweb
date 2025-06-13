import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    bucque: '',
    num: '',
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword : '',
    numero: '',
    tabagns: '',
    proms: 0,
    peks: false
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    const { email, password, confirmPassword, prenom, nom, numero, peks} = formData
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email : email,
          numero : numero,
          prenom: prenom,
          nom: nom,
          peks: peks,
          num: formData.peks ? null : form.num,
          bucque: formData.peks ? null : form.bucque,
          proms: formData.peks ? null : form.proms,
          tabagns: formData.peks ? null : form.tabagns,
        }
      }
    })

    if (error) setError(error.message)
    else {
      setSuccess(true)
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Adresse email invalide.")
      return
    }

    if (!prenom.trim() || !nom.trim()) {
    setError("Prénom, nom, bucque et num'ss sont obligatoires.")
    return
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
    if (!pwdRegex.test(password)) {
      setError("Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.")
      return
    }

    if (password.length < 8) {
    setError("Le mot de passe doit faire au moins 8 caractères.")
    return
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Créer un compte</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mb-4">
          🎉 Compte créé ! Un email de confirmation a été envoyé à {formData.email}.<br />
          🕐 Tu as <strong>1 heure</strong> pour vérifier ton adresse avant expiration.
        </p>
)}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="inline-flex items-center">
            <span className="block text-sm font-medium text-gray-700">Tu es un Pek’s (non-gadz) ?</span>
            <input
              type="checkbox"
              name="peks"
              checked={formData.peks}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, peks: e.target.checked }))
              }
              className="form-checkbox scale-150 text-blue-600 ml-2"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            className="w-full border border-gray-300 rounded-md p-2 text-black"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            className="w-full border border-gray-300 rounded-md p-2 text-black"
            onChange={handleChange}
            required
          />
        </div>


        <div // DEBUT ZONE GADZ
          className={`transition-all duration-300 ease-in-out overflow-hidden grid gap-4 ${
            formData.peks
              ? 'max-h-0 opacity-0 scale-y-0 pointer-events-none'
              : 'max-h-[1000px] opacity-100 scale-y-100'
          }`}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Bucque</label>
            <input
              type="text"
              name="bucque"
              value={formData.bucque}
              className="w-full border border-gray-300 rounded-md p-2 text-black"
              onChange={handleChange}
              required={!formData.peks}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Num'ss</label>
            <input
              type="text"
              name="num"
              value={formData.num}
              className="w-full border border-gray-300 rounded-md p-2 text-black"
              onChange={handleChange}
              required={!formData.peks}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tabagn's</label>
            <select
              name="tabagns"
              value={formData.tabagns}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 text-black"
              required={!formData.peks}
            >
              <option value="">-- Choisir --</option>
              <option value="sibers">Siber's</option>
              <option value="kin">KIN</option>
              <option value="cluns">Clun's</option>
              <option value="p3">P3</option>
              <option value="boquette">Boquette</option>
              <option value="bordels">Bordel's</option>
              <option value="birse">Birse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prom's</label>
            <input
              type="number"
              name="proms"
              value={formData.proms}
              className="w-full border border-gray-300 rounded-md p-2 text-black"
              onChange={handleChange} // Fin zone Gad'z
              required={!formData.peks}
            />
          </div> 
        </div> 



        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            className="w-full border border-gray-300 rounded-md p-2 text-black"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-black">Numéro de téléphone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="06XXXXXXXX"
            className="w-full border p-2 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            className="w-full border border-gray-300 rounded-md p-2 text-black"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            className="w-full border border-gray-300 rounded-md p-2 text-black"
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Créer mon compte
        </button>
      </form>
    </div>
  )
}
