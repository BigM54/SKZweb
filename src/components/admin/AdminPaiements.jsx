import { useEffect, useState } from 'react';
import { Container, Table, Form } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState([]);
  const [profils, setProfils] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('paiement1');
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      const { data: paiementsData } = await supabase.from('Paiements').select('*');
      setPaiements(paiementsData || []);
      // Récupère tous les profils
      const { data: profilsData } = await supabase.from('profils').select('*');
      setProfils(profilsData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Map email -> profil pour accès rapide
  const profilsByEmail = {};
  profils.forEach(p => {
    if (p.email) profilsByEmail[p.email.toLowerCase()] = p;
  });

  // Filtrage selon le paiement sélectionné
  const filtered = paiements.filter(p =>
    p.acompteStatut === true &&
    (
      (selected === 'paiement1' && !p.paiement1Statut) ||
      (selected === 'paiement2' && !p.paiement2Statut) ||
      (selected === 'paiement3' && (!p.paiement3Recu || Number(p.paiement3Recu) === 0))
    )
  );

  return (
    <Container className="text-center">
      <h5 className="mb-4">🔎 Utilisateurs n'ayant pas payé le paiement sélectionné</h5>
      <Form.Group className="mb-3" style={{ margin: "0 auto" }}>
        <Form.Label>Choisir le paiement à contrôler :</Form.Label>
        <Form.Select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="paiement1">Paiement 1</option>
          <option value="paiement2">Paiement 2</option>
          <option value="paiement3">Paiement 3</option>
        </Form.Select>
      </Form.Group>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <Table striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Bucque</th>
              <th>Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const profil = profilsByEmail[u.email?.toLowerCase()] || {};
              return (
                <tr key={u.email}>
                  <td>{u.email}</td>
                  <td>{profil.nom || '-'}</td>
                  <td>{profil.prenom || '-'}</td>
                  <td>{profil.bucque || '-'}</td>
                  <td>{profil.numero || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      <div className="mt-2 text-muted">
        {filtered.length} utilisateur(s) trouvé(s)
      </div>
    </Container>
  );
}