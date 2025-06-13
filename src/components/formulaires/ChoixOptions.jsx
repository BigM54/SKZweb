import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function ChoixOptions() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modeAffichage, setModeAffichage] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session?.user) {
        alert("Non connecté")
        return
      }
      const { data, error: fetchError } = await supabase
        .from('options')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setForm(data)
        setModeAffichage(true)
      } else {
        // Pas de données -> mode édition
        setForm({
          type_place: '', forfait_bouffe_seul: '', pack_location: '',
          materiel_location: '', casque: '', type_forfait: '', assurance: '',
          masque : '', pack_fumeur : '', pack_soiree : '', pack_grand_froid : '',
          pain : '0', croissant : '0', pain_choco : '0', saucisson : '0', fromage : '0', biere : '0', bus : ''
        })
        setModeAffichage(false)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }


 const handleSubmit = async (e) => {
  e.preventDefault()

  // Champs requis
  const champsRequis = [
    'type_place',
    'pack_location',
    'materiel_location',
    'forfait_bouffe_seul',
    'casque',
    'type_forfait',
    'assurance',
    'masque',
    'pack_fumeur',
    'pack_soiree',
    'pack_grand_froid',
    'bus'
  ]

  const champsNonRemplis = champsRequis.filter((champ) => !form[champ])
  if (champsNonRemplis.length > 0) {
    alert(`Merci de compléter tous les champs : ${champsNonRemplis.join(', ')}`)
    return
  }

  setLoading(true)

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session || !session.user) {
    alert("Pas connecté")
    setLoading(false)
    return
  }

  const payload = {
    id: session.user.id,
    ...form
  }


  const { error } = await supabase
    .from('options')
    .insert(payload)

  setLoading(false)

  if (error) {
    console.error("Erreur Supabase :", error)
    alert('Erreur lors de la sauvegarde')
  } else {
    alert('Options enregistrées ✅')
    setModeAffichage(true)
  }
}

if (loading || !form) return <p className="text-black">Chargement...</p>

if (modeAffichage) {
  return (
      <div className="text-black space-y-2">
        <h2 className="text-lg font-bold">Récapitulatif de tes choix :</h2>
        {Object.entries(form).map(([cle, val]) => (
          <p key={cle}><strong>{cle} :</strong> {val}</p>
        ))}
      </div>
    )
  }

    return(

        <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
            <label className="block mb-1 font-medium text-black">Tu es :</label>
            <select name="type_place" value={form.type_place} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Sélectionner --</option>
            <option value="PGs">PGs</option>
            <option value="Archi">Archi</option>
            <option value="Pek’ss">Pek’ss</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Tu souhaite uniquement le pack bouffe ou le forfait</label>
            <select name="forfait_bouffe_seul" value={form.forfait_bouffe_seul} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Sélectionner --</option>
            <option value="Pack bouffe seulement (PAS DE FORFAIT)">Pack bouffe seulement (PAS DE FORFAIT)</option>
            <option value="Forfait seulement (PAS DE BOUFFE)">Forfait seulement (PAS DE BOUFFE)</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Pack location</label>
            <select name="pack_location" value={form.pack_location} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="bronze">Bronze</option>
            <option value="argent">Argent</option>
            <option value="or">Or</option>
            <option value="platine">Platine</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Matériel</label>
            <select name="materiel_location" value={form.materiel_location} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="complet">Complet</option>
            <option value="ski">Ski seuls</option>
            <option value="chaussures">Chaussures seules</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Tu veux louer un casque ?</label>
            <select name="casque" value={form.casque} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Choisi ton forfait (Standard ou Etendu)</label>
            <select name="type_forfait" value={form.type_forfait} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="standard">Standard</option>
            <option value="étendu">Étendu</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Quels assurance veux tu prendre ?</label>
            <select name="assurance" value={form.assurance} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="aucune">Aucune</option>
            <option value="zen">Zen</option>
            <option value="skieur">Skieur</option>
            <option value="zen+skieur">Zen + Skieur</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Veux-tu un masque SKZ ?</label>
            <select name="masque" value={form.masque} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="oui">Oui (Trop la classe)</option>
            <option value="non">Non (bien guez le S)</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Ah batard tu fumes ? (pack fumeur)</label>
            <select name="pack_fumeur" value={form.pack_fumeur} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Pack Soirée (uniquement si t'es un gros golem)</label>
            <select name="pack_soiree" value={form.pack_soiree} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Pack Grand froid</label>
            <select name="pack_grand_froid" value={form.pack_grand_froid} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
            </select>
        </div>


        <div>
            <label className="block mb-1 font-medium text-black">Combien tu veux de baguette par jour mon gaté ?</label>
            <select name="pain" value={form.pain} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Combien tu veux de croissant par jour mon gaté ?</label>
            <select name="croissant" value={form.croissant} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Combien tu veux de pain au chocolat par jour mon gaté ?</label>
            <select name="pain_choco" value={form.pain_choco} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Combien tu veux de saucisson vilain franchouillard ?</label>
            <select name="saucisson" value={form.saucisson} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3 (gros gourmand)</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Combien tu veux de fromage vilain franchouillard ?</label>
            <select name="fromage" value={form.fromage} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Combien tu veux de bière grosse poche ?</label>
            <select name="biere" value={form.biere} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3 (ah ouais mais t'es completement barjo j'ai juré)</option>
            </select>
        </div>

        <div>
            <label className="block mb-1 font-medium text-black">Tu veux un bus ? Dis nous d'où tu pars !</label>
            <select name="bus" value={form.bus} onChange={handleChange} className="w-full border p-2 rounded text-black">
            <option value="">-- Choisir --</option>
            <option value='non'>Pas besoin, je viens par mes propres moyens</option>
            <option value='sibers'>Siber's</option>
            <option value='kin'>KIN</option>
            <option value='cluns'>Clun's</option>
            <option value='p3'>P3</option>
            <option value='boquette'>Boquette</option>
            <option value='bordels'>Bordel's</option>
            <option value='birse'>Birse</option>
            </select>
        </div>


        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Enregistrement...' : 'Valider mes choix (DEFINITIF)'}
        </button>
        </form>
  )
}


