import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Alert, Spinner, Card, Row, Col, Badge, Button } from 'react-bootstrap';

// This admin component lists, for each tabagns, the participants grouped by bus variant
// It assumes tables:
//   options(id, bus, type_bus, numero, prenom, nom)
//   profils(id, prenom, nom, numero) as fallback if options lacks identity
// and uses busPlace(tabagns, calme, anims, "anims+", "anims++") only for capacity reference (optional display).

const VARIANTS_ORDER = ['calme','anims','anims+','anims++'];

export default function AdminBusLists() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]); // raw options rows
  const [capacities, setCapacities] = useState({}); // tabagns -> capacity object
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const token = await getToken({ template: 'supabase' });
      const res = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/rest/v1/options?select=id,bus,type_bus,numero,prenom,nom', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': token
        }
      });
      if (!res.ok) throw new Error('Erreur chargement options');
      const rows = await res.json();
      // Fetch capacities
      const capRes = await fetch('https://vwwnyxyglihmsabvbmgs.supabase.co/rest/v1/busPlace?select=tabagns,calme,anims,"anims+","anims++"', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': token
        }
      });
      if (!capRes.ok) throw new Error('Erreur chargement capacités');
      const caps = await capRes.json();
      const capMap = {};
      caps.forEach(c => { capMap[c.tabagns] = c; });
      setCapacities(capMap);
      setData(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const grouped = useMemo(() => {
    const map = {};
    data.forEach(r => {
      const tab = (r.bus || '').toLowerCase();
      if (!tab) return;
      if (!map[tab]) map[tab] = { variants: {}, total: 0 };
      const variant = r.type_bus || 'non choisi';
      if (!map[tab].variants[variant]) map[tab].variants[variant] = [];
      map[tab].variants[variant].push(r);
      map[tab].total++;
    });
    return map; // { tabagns: { variants: { variant: [rows] }, total } }
  }, [data]);

  const refresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const tabagnsList = Object.keys(grouped).sort();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Listes des bus par Tabagn's</h4>
        <Button variant="outline-primary" size="sm" disabled={refreshing} onClick={refresh}>{refreshing ? '...' : 'Rafraîchir'}</Button>
      </div>
      {tabagnsList.length === 0 && <Alert>Aucune donnée de bus.</Alert>}
      <Row className="g-3">
        {tabagnsList.map(tab => {
          const g = grouped[tab];
          const cap = capacities[tab];
          return (
            <Col key={tab} xs={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    <span style={{textTransform:'capitalize'}}>{tab}</span>
                    <Badge bg="secondary">Total: {g.total}</Badge>
                  </Card.Title>
                  {cap && (
                    <div className="mb-2 small text-muted">
                      Capacités: {VARIANTS_ORDER.filter(v => cap[v] !== null && cap[v] !== undefined).map(v => `${v}: ${cap[v]}`).join(' • ')}
                    </div>
                  )}
                  {VARIANTS_ORDER.concat(['non choisi']).map(variant => {
                    const list = g.variants[variant] || [];
                    if (list.length === 0) return null;
                    return (
                      <div key={variant} className="mb-3">
                        <h6 className="mb-2" style={{fontWeight:600}}>{variant === 'non choisi' ? 'Pas encore de choix' : variant}</h6>
                        <div className="d-flex flex-column gap-1">
                          {list.map(p => (
                            <div key={p.id} className="border rounded px-2 py-1 d-flex justify-content-between align-items-center" style={{fontSize:'0.85rem'}}>
                              <div>
                                <strong>{p.prenom || '—'} {p.nom || ''}</strong>
                                <span className="text-muted ms-2">{p.numero || '—'}</span>
                              </div>
                              <code style={{opacity:0.6}}>{p.id}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
