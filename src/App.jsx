import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Formulaire from './pages/Formulaire';
import UpdatePassword from './pages/password-update';
import PasswordSuccess from './pages/password-success';
import PasswordRequest from './pages/password-request';
import Paiements from './pages/Paiements';
import Navbar from './components/Navbar'; 
import AdminPanel from './pages/AdminPanel';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { email, id, user_metadata } = session.user;
          const { data: profil, error } = await supabase
            .from('profils')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (!profil && !error) {
            const { prenom, nom, numero, nums, tabagns, proms, bucque, peks } = user_metadata;
            await supabase.from('profils').insert({
              id,
              email,
              prenom,
              nom,
              numero,
              nums,
              bucque,
              proms,
              tabagns,
              peks
            });
          }
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-update" element={<UpdatePassword />} />
          <Route path="/password-success" element={<PasswordSuccess />} />
          <Route path="/password-request" element={<PasswordRequest />} />
          <Route path='/paiements' element={<Paiements/>} />
          <Route path="/formulaire" element={<Formulaire/>} />
          <Route path="/admin" element={<AdminPanel/>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
