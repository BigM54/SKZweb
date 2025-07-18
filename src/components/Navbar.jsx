import { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Offcanvas, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import useIsAdmin from '../hooks/useIsAdmin';

export default function NavBarComponent() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aideCanvasOpen, setAideCanvasOpen] = useState(false);
  const [profilCanvasOpen, setProfilCanvasOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useIsAdmin();
  const [profil, setProfil] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Rendu des liens pour mobile (remplace les dropdowns par des liens)
  const renderNavLinksMobile = (className = "") => (
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
            className="nav-btn"
          >
            {label}
          </Nav.Link>
        ))}
      {/* Remplace les dropdowns par des liens qui ouvrent un Offcanvas */}
      <Nav.Link
        as="button"
        className="nav-btn"
        style={{ textAlign: "left", background: "none", border: "none", width: "100%" }}
        onClick={() => { setSidebarOpen(false); setAideCanvasOpen(true); }}
      >
        Aide
      </Nav.Link>
      {isSignedIn && (
        <Nav.Link
          as="button"
          className="nav-btn"
          style={{ textAlign: "left", background: "none", border: "none", width: "100%" }}
          onClick={() => { setSidebarOpen(false); setProfilCanvasOpen(true); }}
        >
          Mon SKZ
        </Nav.Link>
      )}
    </Nav>
  );

  // Rendu des liens pour desktop (dropdowns classiques avec ouverture au survol)
  const [aideDropdownOpen, setAideDropdownOpen] = useState(false);
  const [profilDropdownOpen, setProfilDropdownOpen] = useState(false);

  const renderNavLinksDesktop = (className = "") => (
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
            className="nav-btn"
          >
            {label}
          </Nav.Link>
        ))}
      <NavDropdown
        title={<span className={aideDropdownOpen ? "text-white" : "text-primary"}>Aide</span>}
        id="aide-dropdown"
        menuVariant="dark"
        className="nav-btn"
        show={aideDropdownOpen}
        onMouseEnter={() => setAideDropdownOpen(true)}
        onMouseLeave={() => setAideDropdownOpen(false)}
        onToggle={() => {}}
      >
        <NavDropdown.Item as={Link} to="/faq">FAQ</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/contact">Contact</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/infos">Infos</NavDropdown.Item>
      </NavDropdown>
      {isSignedIn && (
        <NavDropdown
          title={<span className={profilDropdownOpen ? "text-white" : "text-primary"}>Mon SKZ</span>}
          id="skz-dropdown"
          menuVariant="dark"
          className="nav-btn"
          show={profilDropdownOpen}
          onMouseEnter={() => setProfilDropdownOpen(true)}
          onMouseLeave={() => setProfilDropdownOpen(false)}
          onToggle={() => {}}
        >
          <NavDropdown.Item as={Link} to="/formulaire">Mes Choix</NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/paiements">Mes Paiements</NavDropdown.Item>
        </NavDropdown>
      )}
      {isSignedIn && (
        <Button
          variant="outline-danger"
          onClick={handleLogout}
          className="ms-2"
        >
          Se déconnecter
        </Button>
      )}
    </Nav>
  );

  return (
    <>
      {/* Bouton burger visible uniquement sur mobile et caché si un Offcanvas est ouvert */}
      {isMobile && !sidebarOpen && !aideCanvasOpen && !profilCanvasOpen && (
        <Button
          variant="light"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'sticky',
            top: 0,
            marginTop: '0rem',
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
        <>
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
            <Offcanvas.Body style={{ fontSize: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>
              <div style={{ flex: 1 }}>
                {renderNavLinksMobile("flex-column mobile-nav")}
              </div>
              {isSignedIn && (
                <div className="flex-column mt-4 d-flex">
                  <Button
                    variant="outline-danger"
                    onClick={handleLogout}
                  >
                    Se déconnecter
                  </Button>
                </div>
              )}
            </Offcanvas.Body>
          </Offcanvas>

          {/* Offcanvas Aide */}
          <Offcanvas
            show={aideCanvasOpen}
            onHide={() => setAideCanvasOpen(false)}
            placement="start"
            className="p-4"
            style={{ backgroundColor: '#0d1c31', color: 'white', width: '600px', fontSize: '1.5rem' }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Aide</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column mobile-nav">
                <Nav.Link as={Link} to="/faq" onClick={() => setAideCanvasOpen(false)} className="nav-btn">
                  FAQ
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" onClick={() => setAideCanvasOpen(false)} className="nav-btn">
                  Contact
                </Nav.Link>
                <Nav.Link as={Link} to="/infos" onClick={() => setAideCanvasOpen(false)} className="nav-btn">
                  Infos
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Offcanvas Profil */}
          <Offcanvas
            show={profilCanvasOpen}
            onHide={() => setProfilCanvasOpen(false)}
            placement="start"
            className="p-4"
            style={{ backgroundColor: '#0d1c31', color: 'white', width: '600px', fontSize: '1.5rem' }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>{profil?.bucque ? profil.bucque : profil?.prenom || "Mon SKZ"}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column mobile-nav">
                <Nav.Link as={Link} to="/formulaire" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                  Mes Choix
                </Nav.Link>
                <Nav.Link as={Link} to="/paiements" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                  Mes Paiements
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>
        </>
      )}

      {/* Navbar desktop */}
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
              {renderNavLinksDesktop("d-flex flex-row gap-4 align-items-center")}
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
    </>
  );
}
