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
  const [nums, setNums] = useState([]);

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
      const userNums = [myCousin.nums1, myCousin.nums2, myCousin.nums3, myCousin.nums4, myCousin.nums5, myCousin.nums6].filter(Boolean);
      setNums(userNums);
      if (userNums.length === 0) {
        setCousins([]);
        setLoading(false);
        return;
      }
      // Recherche tous les cousins qui ont au moins un num en commun
      const orConditions = [];
      for (let n of userNums) {
        for (let col of ['nums1','nums2','nums3','nums4','nums5','nums6']) {
          orConditions.push(`${col}.eq.${n}`);
        }
      }
      const { data: allCousins, error: err } = await supabase
        .from('cousin')
        .select('*')
        .or(orConditions.join(','));
      if (err) {
        setError("Erreur Supabase : " + err.message);
        setLoading(false);
        return;
      }
      // Filtre doublons
      const unique = {};
      allCousins.forEach(c => {
        unique[c.email] = c;
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
                <th>Bucque</th>
                <th>Email</th>
                <th>Numéro</th>
                <th>Num's commun(s)</th>
              </tr>
            </thead>
            <tbody>
              {cousins.map(c => (
                <tr key={c.email}>
                  <td>{c.bucque || '-'}</td>
                  <td>{c.email}</td>
                  <td>{c.numero || '-'}</td>
                  <td>{[c.nums1, c.nums2, c.nums3, c.nums4, c.nums5, c.nums6].filter(n => n && nums.includes(n)).join(' - ')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}
