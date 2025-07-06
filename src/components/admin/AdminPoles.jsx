import { useEffect, useState } from 'react';
import { Container, Form, Spinner, Table } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import useIsAdmin from '../../hooks/useIsAdmin';

export default function AdminPoles() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const { getToken } = useAuth();
  const [acompteCount, setAcompteCount] = useState(0);
  const [paiement1Count, setPaiement1Count] = useState(0);
  const [paiement2Count, setPaiement2Count] = useState(0);
  const [paiement3Count, setPaiement3Count] = useState(0);
  const [paiements, setPaiements] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    setLoading(true);
    const token = await getToken({ template: 'supabase' });

    const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: options, error } = await supabase
      .from('options')
      .select('*');

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const grouped = {};

    options.forEach(opt => {
      if (!grouped['total']) {
        grouped['total'] = {
          count: 0, bus: {},
          pain: 0, croissant: 0, pain_choco: 0,
          fromage: 0, saucisson: 0, biere: 0,
          pack_location: {}, materiel_location: {},
          casque: 0, assurance: {}, bus: {}, type_forfait: {},
          pack_fumeur: 0, pack_grand_froid: 0, pack_soiree: 0, masque: 0,
        };
      }
      const g = grouped['total'];
      g.count++;
      g.pain += Number(opt.pain); 
      g.croissant += Number(opt.croissant);
      g.pain_choco += Number(opt.pain_choco);
      g.fromage += Number(opt.fromage);
      g.saucisson += Number(opt.saucisson);
      g.biere += Number(opt.biere);
      g.casque += opt.casque === 'oui' ? 1 : 0;
      g.pack_fumeur += opt.pack_fumeur === 'oui' ? 1 : 0;
      g.pack_grand_froid += opt.pack_grand_froid === 'oui' ? 1 : 0;
      g.pack_soiree += opt.pack_soiree === 'oui' ? 1 : 0;
      g.masque += opt.masque === 'oui' ? 1 : 0;

      // pack_location tally
      g.pack_location[opt.pack_location] = (g.pack_location[opt.pack_location] || 0) + 1;
      g.materiel_location[opt.materiel_location] = (g.materiel_location[opt.materiel_location] || 0) + 1;
      g.assurance[opt.assurance] = (g.assurance[opt.assurance] || 0) + 1;
      g.bus[opt.bus] = (g.bus[opt.bus] || 0) + 1;
      g.type_forfait[opt.type_forfait] = (g.type_forfait[opt.type_forfait] || 0) + 1
    });

    // Fetch tous les paiements pour la somme totale
    const { data: paiementsData } = await supabase
      .from('Paiements')
      .select('*');

    setPaiements(paiementsData || []); // <-- stocke dans le state

    if (paiementsData) {
      setPaiement1Count(paiementsData.filter(p => p.paiement1Statut === true).length);
      setPaiement2Count(paiementsData.filter(p => p.paiement2Statut === true).length);
      setPaiement3Count(paiementsData.filter(p => Number(p.paiement3Recu) > 0).length);
    }

    setStats(grouped);
    setLoading(false);
  };

  if (adminLoading) return <p className="text-center mt-5">🔄 Chargement admin...</p>;
  if (!isAdmin) return <p className="text-center text-danger mt-5">Accès refusé</p>;

  if (loading) return <p className="text-center mt-5">🔄 Calcul des statistiques...</p>;

  return (
    <Container className="mt-4">
      <h3 className="mb-4">📊 Quantité par catégorie</h3>
      {Object.entries(stats).map(([pole, data]) => (
        <div key={pole} className="mb-5">
          <h5>{data.count} participants</h5>
          <Table striped bordered size="sm">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Boulangerie</td>
                <td>🥖 Pain: {data.pain} |🥐 Croissant: {data.croissant} |🍞🍫 PainChoco: {data.pain_choco}</td>
              </tr>
              <tr>
                <td>Apéro</td>
                <td>🧀 Fromage: {data.fromage} |🌭 Saucisson: {data.saucisson} |🍺 Bière: {data.biere}</td>
              </tr>
              <tr>
                <td>Location</td>
                <td>
                  🏅Pack: {Object.entries(data.pack_location).map(([k,v]) => `${k} (${v})`).join(', ')};<br/>
                  🎿Matériel: {Object.entries(data.materiel_location).map(([k,v]) => `${k} (${v})`).join(', ')};<br/>
                  ⛑️Casque: {data.casque} 
                </td>
              </tr>
                <tr>
                <td>Forfait et Assurance</td>
                <td> 
                  🤝Assurance: {Object.entries(data.assurance).map(([k,v]) => `${k} (${v})`).join(', ')};<br/>
                  💳Forfait: {Object.entries(data.type_forfait).map(([k,v]) => `${k} (${v})`).join(', ')};<br/>
                </td>
              </tr>
              <tr>
                <td>Packs spéciaux</td>
                <td>🚬Fumeur: {data.pack_fumeur} | 🥶GrandFroid: {data.pack_grand_froid} | 🥳Soirée: {data.pack_soiree} | 🥽Masque: {data.masque}</td>
              </tr>
              <tr>
                <td>Bus</td>
                <td>
                    <pre>
                        🚌
                        {Object.entries(data.bus).map(([k,v]) => `${k} (${v})`)
                        .join('\n')}
                    </pre>
                </td>
              </tr>
              <tr>
                <td>Paiement</td>
                <td>💵 Acompte : {acompteCount}💶 Paiement 1 : <>({paiement1Count} / {paiements.length})</>   2 : <>({paiement2Count} / {paiements.length})</>   3 : <>({paiement3Count} / {paiements.length})</></td>
              </tr>
            </tbody>
          </Table>
        </div>
      ))}
    </Container>
  );
}