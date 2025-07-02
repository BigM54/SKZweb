import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Loader from './components/Loader';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PasswordRequest = lazy(() => import('./pages/password-request'));
const Formulaire = lazy(() => import('./pages/Formulaire'));
const Paiements = lazy(() => import('./pages/Paiements'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const FAQ = lazy(() => import('./pages/FAQ'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <img
          src="/banniereV2.png"
          alt="Bannière"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        <div style={{ display: 'flex', flex: 1 }}>
          <Navbar />
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
    </Suspense>
  );
}

export default App;
