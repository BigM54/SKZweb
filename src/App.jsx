import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './supabaseClient'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Formulaire from './pages/Formulaire'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import RequireAuth from './components/RequireAuth'
import UpdatePassword from './pages/update-password'
import PasswordSuccess from './pages/password-success'

function App() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { email, id, user_metadata } = session.user

          // Vérifie si l'utilisateur a déjà un profil
          const { data: profil, error } = await supabase
            .from('profils')
            .select('id')
            .eq('email', email)
            .maybeSingle()

          if (!profil && !error) {
            const { prenom, nom, numero, nums, tabagns, proms, bucque, peks} = user_metadata
            console.log(user_metadata)
            console.log(id)
            await supabase.from('profils').insert({
              id : id,
              email: email,
              prenom,
              nom,
              numero,
              nums: nums,
              bucque: bucque,
              proms : proms,
              tabagns : tabagns,
              peks : peks
            })
          }
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow p-4 md:ml-64 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/password-success" element={<PasswordSuccess />} />
          <Route path="/formulaire" element={<RequireAuth>
                                                <Formulaire />
                                              </RequireAuth>
                                            } />
        </Routes>
      </main>
    </div>
  )
}
export default App