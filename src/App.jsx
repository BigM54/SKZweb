import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Container, Image} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // pour les animations
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
const Soirees = lazy(() => import('./pages/Soirees'));
const Village = lazy(() => import('./pages/Village'));
const QrCodePage = lazy(() => import('./pages/QrCode'));
const MesCousins = lazy(() => import('./pages/MesCousins'));
const MesInformations = lazy(() => import('./components/formulaires/MesInformations'));
const TestRLS = lazy(() => import('./pages/TestRLS'));
const Tarifs = lazy(() => import('./pages/Tarifs'));

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
        {/* La navbar horizontale en haut */}
        <Navbar />

        {/* Le contenu principal en dessous, sans Container ni marges/paddings */}
        <div style={{ flex: 1, margin: 0, padding: 0, width: '100vw', minWidth: '100vw', maxWidth: '100vw' }}>
          <main style={{ margin: 0, padding: 0, width: '100vw', minWidth: '100vw', maxWidth: '100vw' }}>
            <Container fluid style={{ padding: 0, margin: 0 }}>
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
                <Route path="/soirees" element={<Soirees />} />
                <Route path="/village" element={<Village />} />
                <Route path="/qrcode" element={<QrCodePage />} />
                <Route path="/mescousins" element={<MesCousins />} />
                <Route path="/mesinfos" element={<MesInformations />} />
                <Route path="/tarifs" element={<Tarifs />} />
                <Route path="/testrls" element={<TestRLS />} />
              </Routes>
            </Container>
          </main>

        </div>
        <Footer />
      </div>
    </Suspense>
  );
}

export default App;
