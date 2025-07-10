import { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Offcanvas, Container, NavDropdown } from 'react-bootstrap';
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
      setIsMobile(window.innerWidth < 1000);
    };

    // Initial call
    handleResize();

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
        .select('prenom, bucque')
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
    { to: '/partenaires', label: 'Nos Partenaires', protected: false },
    { to: '/admin', label: 'Admin Panel', protected: true, hiseIfNotAdmin: true }
  ];

  const renderNavLinks = (className = "") => (
    <Nav className={className}>
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
      {/* Dropdown Aide (toujours affiché) */}
      <NavDropdown
        title="Aide"
        id="aide-dropdown"
        menuVariant="dark"
      >
        <NavDropdown.Item as={Link} to="/faq" onClick={() => setSidebarOpen(false)}>
          FAQ
        </NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/contact" onClick={() => setSidebarOpen(false)}>
          Contact
        </NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/infos" onClick={() => setSidebarOpen(false)}>
          Infos
        </NavDropdown.Item>
      </NavDropdown>
      {/* Dropdown Profil (toujours affiché si connecté) */}
      {isSignedIn && (
        <NavDropdown
          title={
            <span className="text-white">
              👋 {profil?.bucque ? profil.bucque : profil?.prenom || "Mon SKZ"}
            </span>
          }
          id="skz-dropdown"
          menuVariant="dark"
        >
          <NavDropdown.Item as={Link} to="/formulaire" onClick={() => setSidebarOpen(false)}>
            Mes Choix
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/paiements" onClick={() => setSidebarOpen(false)}>
            Mes Paiements
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleLogout} className="text-danger">
            Se déconnecter
          </NavDropdown.Item>
        </NavDropdown>
      )}
    </Nav>
  );


  return (
    <>
      {/* Bouton burger visible uniquement sur mobile */}
      {isMobile && !sidebarOpen && (
        <Button
          variant="light"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'sticky',
            top: 0,
            marginTop: '0rem', // réduit ou supprime l'espace
            marginLeft: '0.75rem',
            zIndex: 1050,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            fontSize: '2rem',
            padding: '0.3rem 0.7rem',
            borderRadius: '6px',
            backdropFilter: 'blur(4px)',
            color: 'black',
            alignSelf: 'flex-start'
          }}
        >
          ☰
        </Button>
      )}

      {/* Sidebar mobile (Offcanvas) */}
      {isMobile && (
        <Offcanvas
          show={sidebarOpen}
          onHide={() => setSidebarOpen(false)}
          placement="start"
          className="p-4"
          style={{ backgroundColor: '#0d1c31', color: 'white', width: '600px', fontSize: '1.5rem' }}
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title>Skioz'Arts 2026</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body style={{ fontSize: '1.5rem' }}>
            {renderNavLinks("flex-column")}
          </Offcanvas.Body>
        </Offcanvas>
      )}

      {/* Sidebar desktop */}
      {!isMobile && (
        <Navbar
          expand="lg"
          style={{ backgroundColor: '#0d1c31', position: 'sticky', top: 0, zIndex: 1040}}
          variant="dark"
          className="px-4"
        >
          <Container fluid>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
              {renderNavLinks("d-flex flex-row gap-4 align-items-center")}
            </Navbar.Collapse>
          </Container>
    </Navbar>
      )}
    </>
  );
}
