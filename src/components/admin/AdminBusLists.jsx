import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Alert, Spinner, Card, Row, Col, Badge, Button, Form } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';

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
  const [selectedTab, setSelectedTab] = useState(''); // filtre tabagns

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const token = await getToken({ template: 'supabase' });
    const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } }
        });

      // 1) Options: source of bus and type_bus
      const { data: optionRows, error: optErr } = await supabase
        .from('options')
        .select('id,bus,type_bus');
      if (optErr) throw optErr;

      // 2) Profils: enrich with identity (prenom, nom, numero)
      // Avoid very long URL with large IN lists by chunking ids
      const ids = (optionRows || []).map(r => r.id).filter(Boolean);
      let profileMap = {};
      if (ids.length) {
        const chunkSize = 200; // safe chunk size to avoid URL length limits
        const chunks = [];
        for (let i = 0; i < ids.length; i += chunkSize) chunks.push(ids.slice(i, i + chunkSize));
        let allProfils = [];
        for (const ch of chunks) {
          const { data: profilsRows, error: profErr } = await supabase
            .from('profils')
            .select('id, prenom, nom, numero')
            .in('id', ch);
          if (profErr) throw profErr;
          allProfils = allProfils.concat(profilsRows || []);
        }
        (allProfils || []).forEach(p => { profileMap[p.id] = { prenom: p.prenom, nom: p.nom, numero: p.numero }; });
      }

      const { data: capRows, error: capErr } = await supabase
        .from('busPlace')
        .select('tabagns,calme,anims,"anims+","anims++"');
      if (capErr) throw capErr;

      const capMap = {};
      (capRows || []).forEach(c => { capMap[c.tabagns] = c; });
      setCapacities(capMap);
  const enriched = (optionRows || []).map(r => ({ ...r, ...(profileMap[r.id] || {}) }));
  setData(enriched);
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
  const visibleTabs = selectedTab ? [selectedTab] : [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
        <h4 className="mb-0">Listes des bus par Tabagn's</h4>
        <div className="d-flex align-items-center gap-2">
          <Form.Select size="sm" value={selectedTab} onChange={(e) => setSelectedTab(e.target.value)} style={{ minWidth: 200 }}>
            <option value="">— Choisir un tabagn's —</option>
            {tabagnsList.map(tab => (
              <option key={tab} value={tab} style={{ textTransform: 'capitalize' }}>{tab}</option>
            ))}
          </Form.Select>
          <Button variant="outline-primary" size="sm" disabled={refreshing} onClick={refresh}>{refreshing ? '...' : 'Rafraîchir'}</Button>
        </div>
      </div>
      {tabagnsList.length === 0 && <Alert>Aucune donnée de bus.</Alert>}
      {!selectedTab && tabagnsList.length > 0 && (
        <Alert variant="info">Sélectionne un tabagn's ci-dessus pour afficher sa liste.</Alert>
      )}
      <Row className="g-3">
        {visibleTabs.map(tab => {
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
