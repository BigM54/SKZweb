import { Tabs, Tab, Container } from 'react-bootstrap';
import AdminUtilisateurs from '../components/admin/AdminUtilisateurs';
import AdminPoles from '../components/admin/AdminPoles';
import QrScanner from '../components/admin/QrScanner';

export default function AdminPanel() {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">🛠️ Panel Administrateur</h2>
      <Tabs defaultActiveKey="utilisateur" id="admin-tabs" className="mb-3">
        <Tab eventKey="utilisateur" title="📋 Infos Utilisateur">
          <AdminUtilisateurs />
        </Tab>
          <Tab eventKey="poles" title="👤 Infos Poles">
            <AdminPoles />
        </Tab>
          <Tab eventKey="scan" title="📷 Qr Scanner">
            <QrScanner />
        </Tab>
      </Tabs>
    </Container>
  );
}
