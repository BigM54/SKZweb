import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Button, Spinner } from 'react-bootstrap';
import { useAuth, useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vwwnyxyglihmsabvbmgs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw';

const getSupabase = async (getToken) => {
  const token = await getToken({ template: 'supabase' });
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

export default function DefisDC() {
  const { getToken, userId } = useAuth();
  const { isSignedIn } = useUser();
  const [supabase, setSupabase] = useState(null);
  const [groups, setGroups] = useState([]);
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionRunning, setActionRunning] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getSupabase(getToken);
      setSupabase(s);
    })();
  }, [getToken]);

  useEffect(() => {
    if (!supabase) return;
    loadData();
    // optionally: subscribe or poll
  }, [supabase]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: gdata, error: gerr } = await supabase.from('defis_group_slots').select('*').order('group_number', { ascending: true });
      if (gerr) throw gerr;
      setGroups(gdata || []);

      // get user's group if present
      if (userId) {
        const { data: mdata, error: merr } = await supabase.from('defis_memberships').select('group_number').eq('id', userId).maybeSingle();
        if (merr) {
          // not fatal
          console.warn('error fetching membership', merr.message || merr);
        }
        setUserGroup(mdata?.group_number ?? null);
      }
    } catch (e) {
      console.error('loadData DefisDC', e);
    } finally {
      setLoading(false);
    }
  }

  async function joinGroup(groupNumber) {
    if (!supabase) return;
    setActionRunning(true);
    try {
      const { data, error } = await supabase.rpc('defis_join_group', { p_group_number: groupNumber });
      if (error) {
        console.error('join error', error);
        alert(error.message || 'Erreur lors de l inscription');
      } else {
        // data is the jsonb returned by function
        const status = (data && data.status) || (data?.[0] && data[0].status);
        if (status === 'ok') {
          await loadData();
        } else if (status === 'full') {
          alert('Groupe plein');
        } else if (status === 'already_in') {
          alert('Tu es déjà inscrit dans un groupe');
        } else {
          // generic
          console.log('join result', data);
          await loadData();
        }
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l opération');
    } finally {
      setActionRunning(false);
    }
  }

  async function leaveGroup() {
    if (!supabase) return;
    setActionRunning(true);
    try {
      const { data, error } = await supabase.rpc('defis_leave_group');
      if (error) {
        console.error('leave error', error);
        alert(error.message || 'Erreur lors de la désinscription');
      } else {
        await loadData();
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l opération');
    } finally {
      setActionRunning(false);
    }
  }

  return (
    <Container className="py-4">
      <h3 className="mb-3">🏔️ Défis Mountain Valley</h3>

      <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
        <p className="mb-2"><strong>🏁 Les défis ont commencé !</strong></p>
        <p className="mb-2"><strong>⏱️ Moins de 24h</strong> pour réaliser un maximum de défis.</p>
        <p className="mb-2"><strong>🎁 L'événement sponsorisé par DC</strong> avec de nombreux cadeaux à gagner.</p>
        <p className="mb-2"><strong>💰 +3 500€ de lots à gagner</strong></p>
        <p className="mb-0" style={{ color: '#dc3545', fontWeight: 'bold' }}>⚠️ Les inscriptions sont fermées</p>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 120 }}>
          <Spinner animation="border" />
        </div>
      ) : (
        <div>
          <p>Ton groupe actuel: {userGroup ? <strong>{userGroup}</strong> : 'Aucun'}</p>
          <div className="mb-3 alert alert-warning">
            ⚠️ Les inscriptions sont fermées, les défis ont commencé !
          </div>

          <div>
            {groups.map(g => (
              <Row key={g.group_number} className="align-items-center mb-2">
                <Col xs={2}><strong>{g.group_number}</strong></Col>
                <Col xs={4}><Badge bg={g.remaining > 0 ? 'success' : 'danger'}>{g.remaining} places</Badge></Col>
                <Col xs={3} className="text-end">
                  {userGroup === g.group_number ? (
                    <Button size="sm" variant="outline-danger" disabled>Se désinscrire</Button>
                  ) : (
                    <Button size="sm" variant="primary" disabled>S'inscrire</Button>
                  )}
                </Col>
              </Row>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
