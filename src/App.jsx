import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordRequest from './pages/password-request';
import Formulaire from './pages/Formulaire';
import Paiements from './pages/Paiements';
import AdminPanel from './pages/AdminPanel';
import FAQ from './pages/FAQ';

import Navbar from './components/Navbar'; // ton composant qui gère Offcanvas + Sidebar

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Bannière */}
      <img
        src="/banniereV2.png"
        alt="Bannière"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />

      {/* Contenu global : sidebar + contenu principal */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar latérale ou Offcanvas */}
        <Navbar />

        {/* Contenu principal */}
        <main style={{ flex: 1, padding: '1rem' }}>
          <Container fluid>
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
          </Container>
        </main>
      </div>
    </div>
  );
}

export default App;
