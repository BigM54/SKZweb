import { Container, Tabs, Tab } from 'react-bootstrap';
import Acompte from '../components/paiements/Acompte';
import Paiement1 from '../components/paiements/Paiement1';
import Paiement2 from '../components/paiements/Paiement2';
import Paiement3 from '../components/paiements/Paiement3';

export default function MesPaiements() {
  return (
    <Container className="py-4">
      <h2 className="mb-4">💳 Mes Paiements</h2>
      <Tabs defaultActiveKey="acompte" id="paiements-tabs" className="mb-3">
        <Tab eventKey="acompte" title="Acompte">
          <Acompte />
        </Tab>
        <Tab eventKey="paiement1" title="1er Paiement">
          <Paiement1 />
        </Tab>
        <Tab eventKey="paiement2" title="2e Paiement">
          <Paiement2 />
        </Tab>
        <Tab eventKey="paiement3" title="3e Paiement">
          <Paiement3 />
        </Tab>
      </Tabs>
    </Container>
  );
}
