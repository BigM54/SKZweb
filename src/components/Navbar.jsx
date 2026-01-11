import { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Offcanvas, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import useIsAdmin from '../hooks/useIsAdmin';
import { createClient } from '@supabase/supabase-js';

export default function NavBarComponent() {
  const { getToken } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aideCanvasOpen, setAideCanvasOpen] = useState(false);
  const [profilCanvasOpen, setProfilCanvasOpen] = useState(false);
  const [authCanvasOpen, setAuthCanvasOpen] = useState(false);
  const [presentationCanvasOpen, setPresentationCanvasOpen] = useState(false);
  const [monSkzCanvasOpen, setMonSkzCanvasOpen] = useState(false);
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
    { to: '/partenaires', label: 'Nos Partenaires', protected: false }
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
        onClick={() => { setSidebarOpen(false); setPresentationCanvasOpen(true); }}
      >
        Présentation
      </Nav.Link>
      <Nav.Link
        as="button"
        className="nav-btn"
        style={{ textAlign: "left", background: "none", border: "none", width: "100%" }}
        onClick={() => { setSidebarOpen(false); setAideCanvasOpen(true); }}
      >
        Aide
      </Nav.Link>
      <Nav.Link
        as="button"
        className="nav-btn"
        style={{ textAlign: "left", background: "none", border: "none", width: "100%" }}
        onClick={() => { setSidebarOpen(false); setMonSkzCanvasOpen(true); }}
      >
        Mon SKZ
      </Nav.Link>
    </Nav>
  );

  // Rendu des liens pour desktop (dropdowns classiques avec ouverture au survol)
  const [aideDropdownOpen, setAideDropdownOpen] = useState(false);
  const [profilDropdownOpen, setProfilDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [presentationDropdownOpen, setPresentationDropdownOpen] = useState(false);

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
        title={<span>Présentation</span>}
        id="presentation-dropdown"
        menuVariant="dark"
        className="nav-btn"
        show={presentationDropdownOpen}
        onMouseEnter={() => setPresentationDropdownOpen(true)}
        onMouseLeave={() => setPresentationDropdownOpen(false)}
        onToggle={() => {}}
      >
        <NavDropdown.Item as={Link} to="/anims">Les Anims</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/soirees">Les Soirées</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/village">Le Village</NavDropdown.Item>
      </NavDropdown>
      <NavDropdown
        title={<span>Aide</span>}
        id="aide-dropdown"
        menuVariant="dark"
        className="nav-btn"
        show={aideDropdownOpen}
        onMouseEnter={() => setAideDropdownOpen(true)}
        onMouseLeave={() => setAideDropdownOpen(false)}
        onToggle={() => {}}
      >
        <NavDropdown.Item as={Link} to="/faq">FAQ</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/vss">Prévention VSS</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/contact">Contact</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/infos">Infos</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/tarifs">Tarifs</NavDropdown.Item>
      </NavDropdown>
      {!isSignedIn && (
        <NavDropdown
          title={<span>Mon SKZ</span>}
          id="auth-dropdown"
          menuVariant="dark"
          className="nav-btn"
          show={authDropdownOpen}
          onMouseEnter={() => setAuthDropdownOpen(true)}
          onMouseLeave={() => setAuthDropdownOpen(false)}
          onToggle={() => {}}
        >
          <NavDropdown.Item as={Link} to="/defis-mountain-valley">Défis Mountain Valley</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item as={Link} to="/login">Connexion</NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/register">Inscription</NavDropdown.Item>
        </NavDropdown>
      )}
      {isSignedIn && (
        <NavDropdown
          title={<span>Mon SKZ</span>}
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
            <NavDropdown.Item as={Link} to="/qrcode">Mon QR Code</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/defis-mountain-valley">Défis Mountain Valley</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/mescousins">Mes Cousins</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/mesinfos">Mon Profil</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/resto-biproms">Resto Biprom's</NavDropdown.Item>
          {isAdmin && (
            <NavDropdown.Item as={Link} to="/admin">Admin Panel</NavDropdown.Item>
          )}
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleLogout} style={{fontWeight: 600 }}>
            Se déconnecter
          </NavDropdown.Item>
        </NavDropdown>
      )}
    </Nav>
  );

  return (
    <>
      {/* Bouton burger visible uniquement sur mobile et caché si un Offcanvas est ouvert */}
      {isMobile && !sidebarOpen && !aideCanvasOpen && !profilCanvasOpen && !authCanvasOpen && !presentationCanvasOpen && !monSkzCanvasOpen && (
          <Button
            onClick={() => setSidebarOpen(true)}
            className="burger-btn-skz"
            style={{
              position: 'sticky',
              top: 0,
              marginTop: '0rem',
              marginLeft: '0.75rem',
              zIndex: 1050,
              fontSize: '2rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '6px',
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
                    variant="link"
                    onClick={handleLogout}
                    style={{ color: '#dc3545', fontWeight: 600, textDecoration: 'none', fontSize: '1.1rem' }}
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
                <Nav.Link as={Link} to="/vss" onClick={() => setAideCanvasOpen(false)} className="nav-btn">
                  Prévention VSS
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" onClick={() => setAideCanvasOpen(false)} className="nav-btn">
                  Contact
                </Nav.Link>
                <Nav.Link as={Link} to="/infos" onClick={() => setAideCanvasOpen(false)} className="nav-btn">
                  Infos
                </Nav.Link>
                <Nav.Link as={Link} to="/tarifs" onClick={() => setAideCanvasOpen(false)} className="nav-btn">
                  Tarifs
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
                    <Nav.Link as={Link} to="/defis-mountain-valley" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                      Défis Mountain Valley
                    </Nav.Link>
                <Nav.Link as={Link} to="/formulaire" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                  Mes Choix
                </Nav.Link>
                  <Nav.Link as={Link} to="/mesinfos" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                    Mon Profil
                  </Nav.Link>
                  <Nav.Link as={Link} to="/resto-biproms" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                    Resto Biprom's
                  </Nav.Link>
                <Nav.Link as={Link} to="/paiements" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                  Mes Paiements
                </Nav.Link>
                <Nav.Link as={Link} to="/qrcode" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                  Mon QR Code
                </Nav.Link>
                <Nav.Link as={Link} to="/mescousins" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                  Mes Cousins
                </Nav.Link>
                {isAdmin && (
                  <Nav.Link as={Link} to="/admin" onClick={() => setProfilCanvasOpen(false)} className="nav-btn">
                    Admin Panel
                  </Nav.Link>
                )}
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Offcanvas Authentification */}
          <Offcanvas
            show={authCanvasOpen}
            onHide={() => setAuthCanvasOpen(false)}
            placement="start"
            className="p-4"
            style={{ backgroundColor: '#0d1c31', color: 'white', width: '600px', fontSize: '1.5rem' }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Connexion / Inscription</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column mobile-nav">
                <Nav.Link as={Link} to="/login" onClick={() => setAuthCanvasOpen(false)} className="nav-btn">
                  Connexion
                </Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={() => setAuthCanvasOpen(false)} className="nav-btn">
                  Inscription
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Offcanvas Présentation */}
          <Offcanvas
            show={presentationCanvasOpen}
            onHide={() => setPresentationCanvasOpen(false)}
            placement="start"
            className="p-4"
            style={{ backgroundColor: '#0d1c31', color: 'white', width: '600px', fontSize: '1.5rem' }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Présentation</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column mobile-nav">
                <Nav.Link as={Link} to="/anims" onClick={() => setPresentationCanvasOpen(false)} className="nav-btn">
                  Les Anims
                </Nav.Link>
                <Nav.Link as={Link} to="/soirees" onClick={() => setPresentationCanvasOpen(false)} className="nav-btn">
                  Les Soirées
                </Nav.Link>
                <Nav.Link as={Link} to="/village" onClick={() => setPresentationCanvasOpen(false)} className="nav-btn">
                  Le Village
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Offcanvas Mon SKZ */}
          <Offcanvas
            show={monSkzCanvasOpen}
            onHide={() => setMonSkzCanvasOpen(false)}
            placement="start"
            className="p-4"
            style={{ backgroundColor: '#0d1c31', color: 'white', width: '600px', fontSize: '1.5rem' }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Mon SKZ</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column mobile-nav">
                {isSignedIn ? (
                  <>
                    <Nav.Link as={Link} to="/formulaire" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      📋 Mes Choix
                    </Nav.Link>
                    <Nav.Link as={Link} to="/paiements" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      💳 Mes Paiements
                    </Nav.Link>
                    <Nav.Link as={Link} to="/qrcode" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      📱 Mon QR Code
                    </Nav.Link>
                    <Nav.Link as={Link} to="/defis-mountain-valley" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      🏔️ Défis Mountain Valley
                    </Nav.Link>
                    <Nav.Link as={Link} to="/mescousins" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      👥 Mes Cousins
                    </Nav.Link>
                    <Nav.Link as={Link} to="/mesinfos" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      👤 Mon Profil
                    </Nav.Link>
                    <Nav.Link as={Link} to="/resto-biproms" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      🍽️ Resto Biprom's
                    </Nav.Link>
                    {isAdmin && (
                      <Nav.Link as={Link} to="/admin" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                        ⚙️ Admin Panel
                      </Nav.Link>
                    )}
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      🔐 Connexion
                    </Nav.Link>
                    <Nav.Link as={Link} to="/register" onClick={() => setMonSkzCanvasOpen(false)} className="nav-btn">
                      ✍️ Inscription
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>
        </>
      )}

      {/* Navbar desktop */}
      {!isMobile && (
        <Navbar
          expand="lg"
          style={{ position: 'sticky', top: 0, zIndex: 1040 }}
          className="custom-navbar"
        >
          {/* Logo gauche cliquable dans Navbar.Brand */}
          <Navbar.Brand as={Link} to="/" className="p-0 m-0">
            <img src="/skz_logo.png" alt="Logo Skioz'Arts" className="navbar-logo-left" style={{ cursor: 'pointer' }} />
          </Navbar.Brand>
          {/* Logo droite */}
          <img src="/navbar_droite.png" alt="Logo Zivisu" className="navbar-logo-right" />
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="navbar-offset">
              {renderNavLinksDesktop("d-flex flex-row gap-2 align-items-center")}
            </div>
          </Navbar.Collapse>
        </Navbar>
      )}
    </>
  );
}
