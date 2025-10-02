import { Tabs, Tab, Spinner } from 'react-bootstrap';
import Acompte from '../components/paiements/Acompte';
import Paiement1 from '../components/paiements/Paiement1';
import Paiement2 from '../components/paiements/Paiement2';
import Paiement3 from '../components/paiements/Paiement3';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function MesPaiements() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [montant3, setMontant3] = useState(null);
  const [acomptePaye, setAcomptePaye] = useState(null);

  useEffect(() => {
    const fetchPaiementInfo = async () => {
      if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      const email = user.primaryEmailAddress.emailAddress;
      const { data, error } = await supabase
        .from('Paiements')
        .select('paiement3Montant, acompteStatut')
        .eq('email', email)
        .single();
      if (!error) {
        setMontant3(data?.paiement3Montant ?? null);
        setAcomptePaye(data?.acompteStatut);
      } else {
        setMontant3(null);
        setAcomptePaye(false);
      }
    };
    fetchPaiementInfo();
  }, [isLoaded, user, getToken]);

  if (acomptePaye === null) {
    return (
      <Spinner animation="border" />
    );
  } else {
    return (
      <div className="full-width">
        <h2 className="mb-4 text-center">💳 Mes Paiements </h2>
        <Tabs
          defaultActiveKey="acompte"
          id="paiements-tabs"
          className="mb-3 d-flex justify-content-center"
          mountOnEnter
          unmountOnExit
        >
          <Tab eventKey="acompte" title="Acompte (25€)">
            <Acompte />
          </Tab>

          {acomptePaye && (
            <Tab eventKey="paiement1" title="1er Paiement (200€)">
              <Paiement1 />
            </Tab>
          )}

          {acomptePaye && (
            <Tab eventKey="paiement2" title="2e Paiement (200€)">
              <Paiement2 />
            </Tab>
          )}

          {acomptePaye && (
            <Tab
              eventKey="paiement3"
              title={
                montant3 !== null
                  ? `3e Paiement (${montant3}€)`
                  : "3e Paiement"
              }
            >
              <Paiement3 />
            </Tab>
          )}
        </Tabs>
      </div>
    );
  }
}
