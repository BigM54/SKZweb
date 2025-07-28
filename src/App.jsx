import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Container, Image} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // pour les animations
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Partenaires = lazy(() => import('./pages/Partenaires'))
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PasswordRequest = lazy(() => import('./pages/password-request'));
const Formulaire = lazy(() => import('./pages/Formulaire'));
const Paiements = lazy(() => import('./pages/Paiements'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Infos = lazy(() => import('./pages/Infos'));
const Contact = lazy(() => import('./pages/Contact'));
const Anims = lazy(() => import('./pages/Anims'));

function App() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/skz_logo.png';
    img.onload = () => {
      setTimeout(() => setLogoLoaded(true), 2000); // délai pour laisser l'animation jouer
    };
  }, []);

  if (!logoLoaded) {
    return (
      <Container
        fluid
        className="d-flex flex-column justify-content-center align-items-center vh-100"
      >
      <img
        src="/skz_logo.png"
        alt="Logo"
        width={400}
        className="animated-logo"
      />
      </Container>
    );
  }

  return (
    <Suspense fallback={null}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Bannière tout en haut */}
        <img
          src="/banniereV2.png"
          alt="Bannière"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* La navbar horizontale en dessous de la bannière */}
        <Navbar />

        {/* Le contenu principal en dessous */}
        <div style={{ flex: 1 }}>
          <main className="p-0 m-0 w-100">
            <Container fluid className="p-0 m-0 w-100">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/password-request" element={<PasswordRequest />} />
                <Route path="/paiements" element={<Paiements />} />
                <Route path="/formulaire" element={<Formulaire />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/partenaires" element={<Partenaires />} />
                <Route path='/infos' element={<Infos />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/anims" element={<Anims />} />
              </Routes>
            </Container>
          </main>
        </div>
      </div>
    </Suspense>
  );
}

export default App;
