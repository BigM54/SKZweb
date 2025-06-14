import { Tabs, Tab, Container } from 'react-bootstrap';
import AdminUtilisateurs from '../components/admin/AdminUtilisateurs';
import AdminPoles from '../components/admin/AdminPoles';

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
      </Tabs>
    </Container>
  );
}
