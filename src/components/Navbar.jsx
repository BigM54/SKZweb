import { useEffect, useState } from 'react';
import { Nav, Button, Offcanvas } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import useIsAdmin from '../hooks/useIsAdmin';
import { createClient } from '@supabase/supabase-js';

export default function NavBarComponent() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { isAdmin } = useIsAdmin();
  const [profil, setProfil] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfil = async () => {
      if (!user) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      const { data, error } = await supabase
        .from('profils')
        .select('prenom')
        .eq('id', user.id)
        .single();
      if (error) console.error('Erreur profil :', error.message);
      else setProfil(data);
    };
    fetchProfil();
  }, [user, getToken]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const links = [
    { to: '/', label: 'Accueil', protected: false },
    { to: '/login', label: 'Connexion', protected: false, hideIfAuth: true },
    { to: '/register', label: 'Inscription', protected: false, hideIfAuth: true },
    { to: '/formulaire', label: 'Mes Choix', protected: true },
    { to: '/paiements', label: 'Mes Paiements', protected: true },
    { to: '/admin', label: 'Admin Panel', protected: true, hiseIfNotAdmin: true },
    { to: '/faq', label: 'FAQ', protected: false }
  ];

  const renderNavLinks = () => (
    <Nav className="flex-column">
      {links
        .filter(link => {
          if (link.protected && !isSignedIn) return false;
          if (link.hideIfAuth && isSignedIn) return false;
          if (link.hiseIfNotAdmin && !isAdmin) return false;
          return true;
        })
        .map(({ to, label }) => (
          <Nav.Link
            as={Link}
            to={to}
            key={to}
            active={pathname === to}
            onClick={() => setSidebarOpen(false)}
          >
            {label}
          </Nav.Link>
        ))}
      {isSignedIn && (
        <div className="mt-4">
          {profil?.prenom && <p className="text-white">👋 {profil.prenom}</p>}
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleLogout}
            style={{ marginTop: '0.5rem' }}
          >
            Se déconnecter
          </Button>
        </div>
      )}
    </Nav>
  );

  return (
    <>
      {/* Bouton burger visible uniquement sur mobile */}
      {isMobile && (
        <Button
          variant="light"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: '10px',
            zIndex: 1050,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            border: 'none',
            fontSize: '1.8rem',
            padding: '0.3rem 0.7rem',
            borderRadius: '6px',
            backdropFilter: 'blur(4px)'
          }}
        >
          ☰
        </Button>
      )}

      {/* Sidebar mobile (Offcanvas) */}
      {isMobile && (
        <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Skioz'Arts 2026</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>{renderNavLinks()}</Offcanvas.Body>
        </Offcanvas>
      )}

      {/* Sidebar desktop */}
      {!isMobile && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '280px',
            backgroundColor: '#0d1c31',
            borderRight: '1px solid #dee2e6',
            padding: '1rem',
            overflowY: 'auto',
            flexShrink: 0
          }}
        >
          {renderNavLinks()}
        </div>
      )}
    </>
  );
}
