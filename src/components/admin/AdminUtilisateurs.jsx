import { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Table, Spinner } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import useIsAdmin from '../../hooks/useIsAdmin';

export default function AdminUtilisateurs() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionsMap, setOptionsMap] = useState({});
  const [residenceMap, setResidenceMap] = useState({});
  const [restoMap, setRestoMap] = useState({});
  const { getToken } = useAuth();
  const [acompteMails, setAcompteMails] = useState([]);
  const [paiementsMap, setPaiementsMap] = useState({});

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setResults([]);
      setOptionsMap({});
      return;
    }

    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    const token = await getToken({ template: 'supabase' });
    const restosByEmail = {};

    const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });
    

    const { data: profils, error } = await supabase
      .from('profils')
      .select('*')
      .or(`prenom.ilike.%${searchTerm}%,nom.ilike.%${searchTerm}%,bucque.ilike.%${searchTerm}%`)
      .limit(20);
    
      
    if (profils?.length > 0) {
      setResults(profils);

      const ids = profils.map(p => p.id);
      const { data: options } = await supabase
        .from('options')
        .select('*')
        .in('id', ids);

      const optionsById = {};
      options?.forEach(opt => {
        optionsById[opt.id] = opt;
      });
      setOptionsMap(optionsById);

      // Fetch paiements pour tous les emails trouvés
      const emails = profils.map(p => p.email);
      const { data: paiements } = await supabase
        .from('Paiements')
        .select('*')
        .in('email', emails);

      // Map email -> paiement
      const paiementsByEmail = {};
      paiements?.forEach(p => {
        paiementsByEmail[p.email] = p;
      });
      setPaiementsMap(paiementsByEmail);

      // Fetch resto rows for these emails
          // Fetch resto rows for these emails (include paiement flag)
          const { data: restos } = await supabase.from('resto').select('email, tabagns, paiement').in('email', emails);
      restos?.forEach(r => { restosByEmail[r.email] = r; });
      setRestoMap(restosByEmail);
    }

    // Récupère toutes les résidences et mappe les userId -> kgibs
    const { data: resData } = await supabase.from('residence').select('kgibs, responsable, resident1, resident2, resident3, resident4');
    const rmap = {};
    (resData || []).forEach(rr => {
      ['responsable', 'resident1', 'resident2', 'resident3', 'resident4'].forEach(col => {
        const val = rr[col];
        if (val) rmap[String(val)] = rr.kgibs;
      });
    });
    setResidenceMap(rmap);

    const { data: acomptes } = await supabase
      .from('Paiements')
      .select('email');

    if (acomptes) {
      setAcompteMails(acomptes.map(a => a.email));
    }

    setLoading(false);
  };

  if (adminLoading) return <p className="text-center mt-5">Chargement...</p>;
  if (!isAdmin) return <p className="text-center text-danger mt-5">Accès refusé</p>;

  return (
    <Container className="mt-4">
      <h3 className="mb-4">🔎 Recherche Utilisateurs</h3>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Rechercher par prénom, nom ou bucque"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {loading && <Spinner animation="border" className="mt-3" />}

      {!loading && results.length > 0 && (
        <Table striped bordered hover className="mt-3 align-middle">
          <tbody>
            {results.map((u) => {
              const opt = optionsMap[u.id];
              const paiement = paiementsMap[u.email] || {};
              const acomptePaid = paiement.acompteStatut ? 25 : 0;
              const p1Paid = paiement.paiement1Statut ? 200 : 0;
              const p2Paid = paiement.paiement2Statut ? 200 : 0;
              const p3Paid = Number(paiement.paiement3Recu) || 0;
              const totalToPay = (Number(paiement.paiement3Montant) || 0) + 425;
              const totalPaid = acomptePaid + p1Paid + p2Paid + p3Paid;
              const remaining = Math.max(0, totalToPay - totalPaid);
              return (
                <tr key={u.id}>
                  <td colSpan={5}>
                    <div className="fw-bold mb-2">
                      👤 {u.prenom} {u.nom} — <code>ID: {u.id}</code>
                    </div>
                    <div className="text-muted mb-2">{u.bucque} — {u.email} — {u.numero ? <a href={`tel:${u.numero}`}>{u.numero}</a> : '—'}</div>
                          <div className="text-muted mb-2"><strong>Kgibs:</strong> {residenceMap[u.id] ?? '—'}</div>
                          <div className="text-muted mb-2">
                            <strong>Resto:</strong> {restoMap[u.email]?.tabagns ? (
                              <>{restoMap[u.email].tabagns} {restoMap[u.email]?.paiement ? <span>(payé)</span> : <span>(non payé)</span>}</>
                            ) : '—'}
                          </div>
                    {opt ? (
                      <div className="ms-3 text-sm">
                        <div><strong>🥖 Boulangerie :</strong> Pain: {opt.pain}, Croissants: {opt.croissant}, Pains Choco: {opt.pain_choco}</div>
                        <div><strong>🧀 Apéro :</strong> Fromage: {opt.fromage}, Saucisson: {opt.saucisson}, Bières: {opt.biere}</div>
                        <div><strong>🎿 Location :</strong> Pack: {opt.pack_location}, Matériel: {opt.materiel_location}, Casque: {opt.casque}, Assurance: {opt.assurance}</div>
                        <div><strong>🎒 Packs spéciaux :</strong> Fumeur: {opt.pack_fumeur}, Grand Froid: {opt.pack_grand_froid}, Soirée: {opt.pack_soiree}, Masque: {opt.masque}</div>
                        <div><strong>🚌 Bus :</strong> {opt.bus ? opt.bus : '—'} {opt.type_bus ? `(${opt.type_bus})` : ''}</div>
                        <div><strong>🎟️ Forfait :</strong> {opt.type_forfait ? opt.type_forfait : '—'}</div>
                        <div><strong>🎽 Pull :</strong> {opt.taille_pull || '—'}</div>
                        <div><strong>🥗 Régime alimentaire :</strong> {opt.regime || '—'}</div>
                        <div><strong>💵 Paiements :</strong> Acompte : {paiement.acompteStatut ? `✅` : '❌'}, 1 : {paiement.paiement1Statut ? `✅` : '❌'}, 2 : {paiement.paiement2Statut ? `✅` : '❌'}, 3 : {paiement.paiement3Recu ? `✅` : '❌'} {paiement.Fraude ? `FRAUDE ATTENTION` : ''}</div>
                        <div><strong>🧾 Total à payer:</strong> {totalToPay}€ — <strong>Déjà payé:</strong> {totalPaid}€ — <strong>Reste:</strong> {remaining}€</div>
                      </div>
                    ) : (
                      <div className="text-muted">Pas d'options enregistrées</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
