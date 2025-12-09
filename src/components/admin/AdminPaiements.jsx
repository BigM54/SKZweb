import { useEffect, useState } from 'react';
import { Container, Table, Form } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState([]);
  const [profils, setProfils] = useState([]);
  const [horsRelance, setHorsRelance] = useState({ archis: new Set(), annulation: new Set(), paiement_special: new Set() });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('paiement1');
  const [excludeArchis, setExcludeArchis] = useState(false);
  const [excludeAnnulation, setExcludeAnnulation] = useState(false);
  const [excludePaiementSpecial, setExcludePaiementSpecial] = useState(false);
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
      // Récupère les adresses à exclure depuis la table hors_relance
      const { data: hrData } = await supabase.from('hors_relance').select('archis, annulation, paiement_special');
      // hrData may be an array of rows; each field may contain single email, comma separated list, or array
      const archisSet = new Set();
      const annulationSet = new Set();
      const paiementSpecialSet = new Set();
      if (hrData && Array.isArray(hrData) && hrData.length > 0) {
        hrData.forEach(row => {
          ['archis', 'annulation', 'paiement_special'].forEach(col => {
            const val = row[col];
            if (!val) return;
            // Accept string or array
            if (Array.isArray(val)) {
              val.forEach(v => { if (v) {
                const email = String(v).trim().toLowerCase();
                if (email) {
                  if (col === 'archis') archisSet.add(email);
                  if (col === 'annulation') annulationSet.add(email);
                  if (col === 'paiement_special') paiementSpecialSet.add(email);
                }
              }});
            } else if (typeof val === 'string') {
              // Split by comma/semicolon/newline/space
              val.split(/[;,\n\s]+/).forEach(e => {
                const email = String(e).trim().toLowerCase();
                if (!email) return;
                if (col === 'archis') archisSet.add(email);
                if (col === 'annulation') annulationSet.add(email);
                if (col === 'paiement_special') paiementSpecialSet.add(email);
              });
            }
          });
        });
      }
      setHorsRelance({ archis: archisSet, annulation: annulationSet, paiement_special: paiementSpecialSet });
      setLoading(false);
    };
    fetchData();
  }, []);

  

  const profilsByEmail = {};
  profils.forEach(p => {
    if (p.email) profilsByEmail[p.email.toLowerCase()] = p;
  });

  // Utility to check excluded emails
  const isExcludedEmail = (email) => {
    if (!email) return false;
    const e = String(email).toLowerCase();
    if (excludeArchis && horsRelance.archis && horsRelance.archis.has(e)) return true;
    if (excludeAnnulation && horsRelance.annulation && horsRelance.annulation.has(e)) return true;
    if (excludePaiementSpecial && horsRelance.paiement_special && horsRelance.paiement_special.has(e)) return true;
    return false;
  };

  // Filtrage selon le paiement sélectionné
  const filtered = paiements.filter(p =>
    p.acompteStatut === true &&
    (
      (selected === 'paiement1' && !p.paiement1Statut) ||
      (selected === 'paiement2' && !p.paiement2Statut) ||
      (selected === 'paiement3' && (!p.paiement3Recu || Number(p.paiement3Recu) === 0))
    ) && !isExcludedEmail(p.email)
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
      <div className="mb-3 d-flex gap-3 justify-content-center">
        <Form.Check
          type="checkbox"
          label={`Exclure Archis (${horsRelance.archis ? horsRelance.archis.size : 0})`}
          checked={excludeArchis}
          onChange={e => setExcludeArchis(e.target.checked)}
        />
        <Form.Check
          type="checkbox"
          label={`Exclure Annulation (${horsRelance.annulation ? horsRelance.annulation.size : 0})`}
          checked={excludeAnnulation}
          onChange={e => setExcludeAnnulation(e.target.checked)}
        />
        <Form.Check
          type="checkbox"
          label={`Exclure Paiement spécial (${horsRelance.paiement_special ? horsRelance.paiement_special.size : 0})`}
          checked={excludePaiementSpecial}
          onChange={e => setExcludePaiementSpecial(e.target.checked)}
        />
      </div>
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
              <th>Tabagns</th>
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
                  <td>{profil.tabagns || '-'}</td>
                  <td>{profil.numero ? <a href={`tel:${profil.numero}`}>{profil.numero}</a> : '-'}</td>
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