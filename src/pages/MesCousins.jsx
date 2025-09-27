import { useEffect, useState } from 'react';
import { Card, Table, Spinner, Alert } from 'react-bootstrap';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

export default function MesCousins() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cousins, setCousins] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCousins = async () => {
      setLoading(true);
      setError(null);
      if (!user?.primaryEmailAddress?.emailAddress) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      // Récupère les nums de l'utilisateur
      const { data: myCousin, error: myError } = await supabase
        .from('cousin')
        .select('*')
        .eq('email', user.primaryEmailAddress.emailAddress)
        .single();
      if (myError || !myCousin) {
        setError("Impossible de récupérer vos num's.");
        setLoading(false);
        return;
      }
      // Récupère tous les cousins qui ont au moins un num en commun
      const nums = [myCousin.nums1, myCousin.nums2, myCousin.nums3, myCousin.nums4, myCousin.nums5, myCousin.nums6].filter(Boolean);
      if (nums.length === 0) {
        setCousins([]);
        setLoading(false);
        return;
      }
      // Recherche tous les cousins qui ont au moins un num en commun
      let query = nums.map((n, i) => `nums${i+1}.eq.${n}`).join(',');
      // On fait une requête pour chaque num
      let allCousins = [];
      for (let n of nums) {
        const { data: found, error: err } = await supabase
          .from('cousin')
          .select('*')
          .or(`nums1.eq.${n},nums2.eq.${n},nums3.eq.${n},nums4.eq.${n},nums5.eq.${n},nums6.eq.${n}`);
        if (!err && found) {
          allCousins = allCousins.concat(found);
        }
      }
      // Filtre doublons et soi-même
      const unique = {};
      allCousins.forEach(c => {
        if (c.email !== myCousin.email) unique[c.email] = c;
      });
      setCousins(Object.values(unique));
      setLoading(false);
    };
    if (isLoaded) fetchCousins();
  }, [isLoaded, user, getToken]);

  if (!isLoaded) return null;
  if (loading) return <Spinner animation="border" className="mt-4" />;
  if (error) return <Alert variant="danger" className="mt-4">{error}</Alert>;

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>👨‍👩‍👧‍👦 Mes cousins</Card.Title>
        {cousins.length === 0 ? (
          <div className="text-muted">Aucun cousin trouvé avec un num's en commun.</div>
        ) : (
          <Table striped bordered hover className="mt-3 align-middle">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Bucque</th>
                <th>Email</th>
                <th>Numéro</th>
                <th>Num's commun(s)</th>
              </tr>
            </thead>
            <tbody>
              {cousins.map(c => (
                <tr key={c.email}>
                  <td>{c.nom || '-'}</td>
                  <td>{c.bucque || '-'}</td>
                  <td>{c.email}</td>
                  <td>{c.numero || '-'}</td>
                  <td>{[c.nums1, c.nums2, c.nums3, c.nums4, c.nums5, c.nums6].filter(n => n && nums.includes(n)).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}
