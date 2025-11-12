import { Tabs, Tab, Container } from 'react-bootstrap';
import AdminUtilisateurs from '../components/admin/AdminUtilisateurs';
import AdminPoles from '../components/admin/AdminPoles';
import QrScanner from '../components/admin/QrScanner';
import AdminPaiements from '../components/admin/AdminPaiements';
import AdminGestionWeb from '../components/admin/AdminGestionWeb';
import AdminBusLists from '../components/admin/AdminBusLists';

export default function AdminPanel() {
  return (
    <div className="full-width mt-4">
      <h2 className="mb-4">🛠️ Panel Administrateur</h2>
      <Tabs defaultActiveKey="utilisateur" id="admin-tabs" className="mb-3 d-flex justify-content-center">
        <Tab eventKey="utilisateur" title="📋 Infos Utilisateur">
          <AdminUtilisateurs />
        </Tab>
          <Tab eventKey="poles" title="👤 Infos Poles">
            <AdminPoles />
        </Tab>
          <Tab eventKey="paiements" title="💰 Infos Paiements">
            <AdminPaiements />
        </Tab>
          <Tab eventKey="scan" title="📷 Qr Scanner">
            <QrScanner />
        </Tab>
          <Tab eventKey="gestion" title="💻 Gestion Web">
            <AdminGestionWeb />
        </Tab>
          <Tab eventKey="buslistes" title="🚌 Bus (Listes)">
            <AdminBusLists />
          </Tab>
      </Tabs>
    </div>
  );
}
