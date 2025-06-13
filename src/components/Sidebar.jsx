import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(true)
  const [session, setSession] = useState(null)
  const [profil, setProfil] = useState(null)

  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/') // ✅ redirection après déconnexion
  }

useEffect(() => {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    setSession(session)

    if (session?.user) {
      const { data: profil } = await supabase
        .from('profils')
        .select('prenom')
        .eq('id', session.user.id)
      setProfil(profil)
    }
  })

  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
    setSession(session)
    if (session?.user) {
      const { data: profil } = await supabase
        .from('profils')
        .select('prenom')
        .eq('id', session.user.id)
        .single()
      setProfil(profil)
    } else {
      setProfil(null)
    }
  })

  return () => listener.subscription.unsubscribe()
}, [])


  const links = [
    { to: '/', label: 'Accueil', protected: false },
    { to: '/login', label: 'Connexion', protected: false, hideIfAuth: true },
    { to: '/register', label: 'Inscription', protected: false, hideIfAuth: true },
    { to: '/formulaire', label: 'Mes Choix', protected: true }
  ]

  return (
    <>
      {/* Bouton burger mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
      >
        {open ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-md w-92 p-6 transition-transform z-40 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <h1 className="text-2xl font-bold text-blue-600 mb-6">⛷️Skioz'Arts</h1>
        {profil?.prenom && (
          <p className="text-gray-500 text-sm mb-4">👋 Bienvenue, <span className="font-semibold">{profil.prenom}</span></p>
        )}
        <nav className="space-y-3">
          {links
            .filter(link => {
              if (link.protected && !session) return false
              if (link.hideIfAuth && session) return false
              return true
            })
            .map(({ to, label }) => {

            const isActive = pathname === to
            return (
              <Link
                key={to}
                to={to}
                onClick={() => {
                  if (window.innerWidth < 768) setOpen(false)
                }}
                className={`block px-4 py-2 rounded text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 !text-white'
                    : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
              {/* ✅ BOUTON SE DÉCONNECTER — en bas du bandeau */}
        {session && (
          <div className="absolute bottom-6 left-6 w-[calc(100%-3rem)]">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>

    </>
  )
}
