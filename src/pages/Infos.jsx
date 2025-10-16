import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from 'react-router-dom';

export default function Infos() {
  return ( 
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1c31', color: '#fff', width: '100vw', textAlign: 'center', fontSize: '1.5rem', fontWeight: 500 }}>
      Cette page n'est pas encore complète<br />mais tu retrouveras ici des infos sur le séjour !
      {/* Ajout du lien vers la page Tarifs */}
      <Link to="/tarifs" className="btn btn-outline-primary mb-3">Voir tous les tarifs</Link>
    </div>
  );
}