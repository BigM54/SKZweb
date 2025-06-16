import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Tabs, Tab, Card } from 'react-bootstrap';
import ChoixOptions from '../components/formulaires/ChoixOptions';
import ChoixAnims from '../components/formulaires/ChoixAnims';
import ChoixRes from '../components/formulaires/ChoixRes';
import QrCode from '../components/formulaires/QrCode';
import { useUser } from '@clerk/clerk-react';

export default function Formulaires() {
  const navigate = useNavigate()
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  const [ongletActif, setOngletActif] = useState('Options');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container className="py-4">
        <Tabs
          activeKey={ongletActif}
          onSelect={(k) => setOngletActif(k)}
          className="justify-content-center mb-4"
        >
          <Tab eventKey="Options" title="Options" />
          <Tab eventKey="Anim's" title="Anim's" />
          <Tab eventKey="Res'" title="Res'" />
          <Tab eventKey="QrCode" title="QrCode" />
        </Tabs>

        <Card className="shadow">
          <Card.Body>
            {ongletActif === 'Options' && <ChoixOptions />}
            {ongletActif === "Anim's" && <ChoixAnims />}
            {ongletActif === "Res'" && <ChoixRes />}
            {ongletActif === "QrCode" && <QrCode />}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
