import { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import useIsAdmin from '../hooks/useIsAdmin';
import { createClient } from '@supabase/supabase-js';


export default function NavBarComponent() {
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { isAdmin } = useIsAdmin();
  const [profil, setProfil] = useState(null);

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

      if (error) {
        console.error('Erreur chargement profil :', error.message);
      } else {
        setProfil(data);
      }
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
    { to: '/admin', label: 'Admin Panel', protected: true, hiseIfNotAdmin: true }
  ];

  return (
    <Navbar expand="md" expanded={expanded} onToggle={() => setExpanded(!expanded)} bg="light" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>⛷️ Skioz'Arts</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
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
                  key={to}
                  to={to}
                  active={pathname === to}
                  onClick={() => setExpanded(false)}
                >
                  {label}
                </Nav.Link>
              ))}
          </Nav>
          {profil?.prenom && (
            <span className="me-3">👋 {profil.prenom}</span>
          )}
          {isSignedIn && (
            <Button variant="danger" onClick={handleLogout}>Se déconnecter</Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
