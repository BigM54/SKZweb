import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordRequest from './pages/password-request';
import Formulaire from './pages/Formulaire';
import Paiements from './pages/Paiements';
import AdminPanel from './pages/AdminPanel';
import FAQ from './pages/FAQ';
import Navbar from './components/Navbar'; // Assure-toi qu’il ne soit pas `position: absolute`

function App() {
  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
      {/* Bannière en haut */}
      <img
        src="/baniere.jpeg"
        alt="Bannière"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />

      {/* Navbar sous la bannière */}
      <Navbar />

      {/* Contenu principal */}
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-request" element={<PasswordRequest />} />
          <Route path="/paiements" element={<Paiements />} />
          <Route path="/formulaire" element={<Formulaire />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
