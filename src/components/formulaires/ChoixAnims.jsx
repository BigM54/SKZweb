import React, { useEffect, useState } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vwwnyxyglihmsabvbmgs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw';

const PUBLIC_ANIMS = ['HandiSki', 'BBQ', 'Caisse à Savon'];

export default function ChoixAnims() {
  const { getToken, userId } = useAuth();
  const [supabase, setSupabase] = useState(null);
  const [disclamerAccepted, setDisclaimerAccepted] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(8);
  const [canClickAccept, setCanClickAccept] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAnims, setUserAnims] = useState([]);
  const [linkMap, setLinkMap] = useState({});

  // Initialize Supabase
  useEffect(() => {
    (async () => {
      const token = await getToken({ template: 'supabase' });
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      setSupabase(sb);
    })();
  }, [getToken]);

  // Countdown timer for disclaimer
  useEffect(() => {
    if (disclamerAccepted || countdownSeconds <= 0) return;
    const timer = setTimeout(() => {
      setCountdownSeconds(c => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdownSeconds, disclamerAccepted]);

  // Enable accept button when countdown reaches 0
  useEffect(() => {
    if (countdownSeconds <= 0) {
      setCanClickAccept(true);
    }
  }, [countdownSeconds]);

  // Load data after disclaimer is accepted
  useEffect(() => {
    if (!disclamerAccepted || !supabase) return;
    loadData();
  }, [disclamerAccepted, supabase]);

  async function loadData() {
    setLoading(true);
    try {
      // Load link map from lien_anims
      const { data: liens, error: lienError } = await supabase.from('lien_anims').select('anims, lien, lien_attente');
      if (lienError) throw lienError;

      const map = {};
      liens?.forEach(row => {
        map[row.anims] = { lien: row.lien, lien_attente: row.lien_attente };
      });
      setLinkMap(map);

      // Load user's anims from resultats_anims
      if (userId) {
        const { data: resultats, error: resError } = await supabase
          .from('resultats_anims')
          .select('1, 2, 3, 4, 5, 6, 7')
          .eq('id', userId)
          .maybeSingle();

        if (resError) {
          console.warn('error fetching resultats_anims', resError.message);
        }

        if (resultats) {
          const anims = [];
          for (let i = 1; i <= 7; i++) {
            const animName = resultats[String(i)];
            if (animName) {
              anims.push(animName);
            }
          }
          setUserAnims(anims);
        }
      }
    } catch (e) {
      console.error('loadData error', e);
    } finally {
      setLoading(false);
    }
  }

  function handleAcceptDisclaimer() {
    setDisclaimerAccepted(true);
  }

  function openLink(url) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Get link for an anim (check if _FA suffix for waitlist)
  function getLinkForAnim(animName) {
    if (!linkMap[animName]) return null;
    const isWaitlist = animName.endsWith('_FA');
    return isWaitlist ? linkMap[animName].lien_attente : linkMap[animName].lien;
  }

  if (!disclamerAccepted) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="p-4">
          <h5>⚠️ Attention - Liens personnels</h5>
          <p>
            Les liens WhatsApp que tu vas recevoir sont <strong>personnels et uniques</strong>. 
            <br />
            Les partager publiquement nous rajouterait du travail de tri et nuirait à l'organisation de l'événement.
          </p>
          <p className="mb-0">
            <strong>⏱️ Ces liens seront supprimés dans 48h.</strong>
          </p>
          <hr />
          <div className="text-center">
            <p>
              {canClickAccept ? (
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleAcceptDisclaimer}
                >
                  ✓ J'ai compris
                </Button>
              ) : (
                <Button variant="secondary" disabled size="lg">
                  ⏳ Veuillez patienter... ({countdownSeconds}s)
                </Button>
              )}
            </p>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">🎿 Mes Groupes WhatsApp</h3>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spinner animation="border" />
        </div>
      ) : (
        <div>
          {/* Public anims section */}
          <div className="mb-4">
            <h5>📢 Animations publiques</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {PUBLIC_ANIMS.map(animName => {
                const link = getLinkForAnim(animName);
                return (
                  <Button
                    key={animName}
                    variant="success"
                    onClick={() => openLink(link)}
                    disabled={!link}
                    size="sm"
                  >
                    {animName}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* User's selected anims section */}
          {userAnims.length > 0 ? (
            <div>
              <h5>🎯 Tes animations sélectionnées</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {userAnims.map(animName => {
                  const link = getLinkForAnim(animName);
                  const isWaitlist = animName.endsWith('_FA');
                  return (
                    <Button
                      key={animName}
                      variant={isWaitlist ? 'warning' : 'primary'}
                      onClick={() => openLink(link)}
                      disabled={!link}
                      size="sm"
                      title={isWaitlist ? 'Liste d\'attente' : 'Confirmé'}
                    >
                      {animName.replace('_FA', '')} {isWaitlist && '(Attente)'}
                    </Button>
                  );
                })}
              </div>
              {userAnims.some(a => a.endsWith('_FA')) && (
                <p className="text-muted small mt-3">
                  ℹ️ Les animations avec "(Attente)" sont en liste d'attente.
                </p>
              )}
            </div>
          ) : (
            <Alert variant="info">
              Aucune animation sélectionnée pour le moment.
            </Alert>
          )}
        </div>
      )}
    </Container>
  );
}
