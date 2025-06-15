import { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import useIsAdmin from '../hooks/useIsAdmin';


export default function NavBarComponent() {
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profil, setProfil] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: profil } = await supabase
          .from('profils')
          .select('prenom')
          .eq('id', user.id)
          .single();
        setProfil(profil);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: profil } = await supabase
          .from('profils')
          .select('prenom')
          .eq('id', session.user.id)
          .single();
        setProfil(profil);
      } else {
        setProfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    await supabase.auth.refreshSession();
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
                if (link.protected && !session) return false;
                if (link.hideIfAuth && session) return false;
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
          {session && (
            <Button variant="danger" onClick={handleLogout}>Se déconnecter</Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
