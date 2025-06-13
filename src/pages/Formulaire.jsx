import { useState } from 'react'
import ChoixOptions from '../components/formulaires/ChoixOptions'
import ChoixAnims from '../components/formulaires/ChoixAnims'
import ChoixRes from '../components/formulaires/ChoixRes'

const onglets = ['Options', "Anim's", "Res'"]

export default function Formulaires() {
  const [ongletActif, setOngletActif] = useState('Options')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Onglets centrés en haut */}
      <div className="bg-white shadow">
        <div className="flex justify-center space-x-2 sm:space-x-4 py-4">
          {onglets.map((nom) => (
            <button
              key={nom}
              onClick={() => setOngletActif(nom)}
              className={`px-4 py-2 rounded-t-md border-b-2 transition ${
                ongletActif === nom
                  ? 'border-blue-600 text-white font-semibold bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-white hover:border-blue-300'
              }`}
            >
              {nom}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu dynamique */}
      <div className="p-6 max-w-3xl mx-auto bg-white mt-2 rounded shadow-md">
        {ongletActif === 'Options' && <ChoixOptions />}
        {ongletActif === "Anim's" && <ChoixAnims />}
        {ongletActif === "Res'" && <ChoixRes />}
      </div>
    </div>
  )
}
