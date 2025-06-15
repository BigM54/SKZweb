import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Formulaire from './pages/Formulaire';
import Paiements from './pages/Paiements';
import Navbar from './components/Navbar'; 
import AdminPanel from './pages/AdminPanel';
import PasswordRequest from './pages/password-request';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

  return (
    <>
      <Navbar />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
