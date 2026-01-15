import React, { useEffect, useRef, useState } from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-bootstrap';

const fieldMap = {
  forfait: {
    table: 'profils',
    fields: ['bucque', 'nums', 'prenom', 'nom', 'email'],
    confirmField: 'confirmed_forfait',
  },
  pack_apers: {
    table: 'options',
    fields: ['saucisson', 'fromage', 'biere'],
    confirmField: 'confirmed',
  },
  pack_goodies: {
    table: 'options',
    fields: ['masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid'],
    confirmField: 'confirmed',
  },
  pack_bouffe: {
    table: 'residence',
    fields: ['regime1', 'regime2', 'regime3', 'regime4', 'regime5'],
    confirmField: 'confirmed_pack_bouffe',
  },
  location_assurance: {
    table: 'options',
    fields: ['pack_location', 'materiel_location', 'casque', 'assurance'],
    confirmField: 'confirmed',
  },
  viennoiserie: {
    table: 'options',
    fields: ['pain', 'croissant', 'pain_choco'],
    confirmField: 'Date_boulangerie',
  },
  resto: {
    table: 'resto',
    fields: ['tabagns'],
    confirmField: 'confirmed',
  },
};

function QrScanner() {
const hasStartedRef = useRef(false);
const [scanResult, setScanResult] = useState('');
  const [selectedType, setSelectedType] = useState('forfait');
  const [scanning, setScanning] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const typeRef = useRef('forfait');
  const scannerRef = useRef(null);
  const { getToken } = useAuth();

  useEffect(() => {
    typeRef.current = selectedType;
  }, [selectedType]);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode('reader');

    return () => {
        const cleanup = async () => {
        if (scannerRef.current && hasStartedRef.current) {
            try {
            await scannerRef.current.stop();      // ⬅️ Stop obligatoire avant
            } catch (err) {
            console.warn('Erreur lors du stop :', err.message);
            }

            try {
            await scannerRef.current.clear();     // ⬅️ Ensuite seulement clear
            } catch (err) {
            console.warn('Erreur lors du clear :', err.message);
            }

            hasStartedRef.current = false;
        }
        };

        cleanup();
    };
    }, []);


  const startScan = async () => {
    hasStartedRef.current = true;
    const html5QrCode = scannerRef.current;
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras.length) {
      window.alert('Aucune caméra trouvée');
      return;
    }

    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await html5QrCode.pause();

        const type = typeRef.current;
        const config = fieldMap[type];
        const token = await getToken({ template: 'supabase' });

        const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
          global: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });

        let message = '';
        let variant = 'success';
        let data, error;

        switch (type) {
          case 'forfait':
            {
              const { data: profilsData, error: profilsError } = await supabase
                .from('profils')
                .select('email, confirmed_forfait')
                .eq('id', decodedText)
                .single();
              if (profilsError || !profilsData) {
                message = '❌ Données non trouvées';
                variant = 'danger';
                break;
              }
              const { data: paymentsData, error: paymentsError } = await supabase
                .from('paiements')
                .select('montant, status')
                .eq('email', profilsData.email);
              if (paymentsError) {
                message = '❌ Erreur récupération paiements';
                variant = 'danger';
                break;
              }
              const allPaid = paymentsData.every(p => p.status === 'paid');
              message = `Paiements:\n${paymentsData.map(p => `${p.montant}€ - ${p.status}`).join('\n')}`;
              if (!allPaid) {
                message += '\n\n❌ Tous les paiements ne sont pas effectués !';
                variant = 'danger';
              }
              if (profilsData.confirmed_forfait) {
                message += '\n\n✅ Déjà récupéré.';
              } else {
                setPendingConfirmation({ type, data: profilsData, decodedText });
                message += '\n\nCliquez sur "Confirmer la récupération" pour valider.';
                variant = 'warning';
              }
            }
            break;
          case 'pack_bouffe':
            {
              const { data: residenceData, error: residenceError } = await supabase
                .from('residence')
                .select('regime1, regime2, regime3, regime4, regime5, confirmed_pack_bouffe')
                .eq('id', decodedText)
                .single();
              if (residenceError || !residenceData) {
                message = '❌ Données non trouvées';
                variant = 'danger';
                break;
              }
              message = `Régimes des résidents:\n1: ${residenceData.regime1}\n2: ${residenceData.regime2}\n3: ${residenceData.regime3}\n4: ${residenceData.regime4}\n5: ${residenceData.regime5}`;
              if (residenceData.confirmed_pack_bouffe) {
                message += '\n\n✅ Déjà récupéré.';
              } else {
                setPendingConfirmation({ type, data: residenceData, decodedText });
                message += '\n\nCliquez sur "Confirmer la récupération" pour valider.';
                variant = 'warning';
              }
            }
            break;
          case 'resto':
            {
              const { data: restoData, error: restoError } = await supabase
                .from('resto')
                .select('tabagns, paiement, confirmed')
                .eq('id', decodedText)
                .single();
              if (restoError || !restoData) {
                message = '❌ Données non trouvées';
                variant = 'danger';
                break;
              }
              if (!restoData.paiement) {
                message = '❌ Paiement non effectué';
                variant = 'danger';
                break;
              }
              message = `Tabagns: ${restoData.tabagns}`;
              if (restoData.confirmed) {
                message += '\n\n✅ Déjà récupéré.';
              } else {
                setPendingConfirmation({ type, data: restoData, decodedText });
                message += '\n\nCliquez sur "Confirmer la récupération" pour valider.';
                variant = 'warning';
              }
            }
            break;
          case 'viennoiserie':
            {
              const today = new Date().toISOString().slice(0, 10);
              const { data: optionsData, error: optionsError } = await supabase
                .from('options')
                .select([...config.fields, 'Date_boulangerie'].join(','))
                .eq('id', decodedText)
                .single();
              data = optionsData;
              error = optionsError;
              if (error || !data) {
                message = '❌ Données non trouvées';
                variant = 'danger';
              } else {
                if (data.Date_boulangerie === today) {
                  message = `❌ La commande de viennoiserie a déjà été récupérée aujourd'hui (${today}).`;
                  variant = 'danger';
                } else {
                  message = `📦 Commande trouvée !\nPain: ${data.pain}\nCroissant: ${data.croissant}\nPain choco: ${data.pain_choco}\n\nCliquez sur "Confirmer la prise" pour valider.`;
                  variant = 'warning';
                  setPendingConfirmation({ type, data, decodedText });
                }
              }
            }
            break;
          default:
            {
              const { data: stdData, error: stdError } = await supabase
                .from(config.table)
                .select([...config.fields, config.confirmField].join(','))
                .eq('id', decodedText)
                .single();
              data = stdData;
              error = stdError;
              if (error || !data) {
                message = '❌ Données non trouvées';
                variant = 'danger';
              } else {
                message = config.fields.map((f) => `${f}: ${data[f] ?? 'N/A'}`).join('\n');
                message = `✅ Informations ${type} :\n${message}`;
                if (data[config.confirmField]) {
                  message += '\n\n✅ Déjà récupéré.';
                } else {
                  setPendingConfirmation({ type, data, decodedText });
                  message += '\n\nCliquez sur "Confirmer la récupération" pour valider.';
                  variant = 'warning';
                }
              }
            }
            break;
        }

        setScanResult(<Alert variant={variant}>{message.split('\n').map((line, i) => <div key={i}>{line}</div>)}</Alert>);
        await html5QrCode.resume();
      },
      (err) => {
        if (
          !err.includes('NotFoundException') &&
          !err.includes('IndexSizeError')
        ) {
          console.warn('Erreur de scan :', err);
        }
      }
    );
    setScanning(true);
  } catch (err) {
    console.error('Erreur de démarrage du scanner :', err);
    window.alert('Impossible de démarrer le scan');
  }
};

    const stopScan = async () => {
    const html5QrCode = scannerRef.current;

    if (scanning && hasStartedRef.current && html5QrCode) {
        try {
        await html5QrCode.stop();
        await html5QrCode.clear();
        scannerRef.current = new Html5Qrcode('reader');
        hasStartedRef.current = false; // ✅ ici
        setScanning(false);
        } catch (err) {
        console.warn('Erreur lors de l\'arrêt du scanner :', err);
        }
    }
  };

  const confirmPickup = async () => {
    if (!pendingConfirmation) return;

    const { type, data, decodedText } = pendingConfirmation;
    const token = await getToken({ template: 'supabase' });

    const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    let updateData = {};
    let table = fieldMap[type].table;
    let successMessage = '';

    if (type === 'viennoiserie') {
      const today = new Date().toISOString().slice(0, 10);
      updateData = { Date_boulangerie: today };
      successMessage = `✅ Commande confirmée et récupérée !\nPain: ${data.pain}\nCroissant: ${data.croissant}\nPain choco: ${data.pain_choco}\nDate enregistrée: ${today}`;
    } else {
      updateData = { [fieldMap[type].confirmField]: true };
      successMessage = `✅ Récupération confirmée pour ${type}.`;
    }

    const { error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', decodedText);

    if (updateError) {
      setScanResult(<Alert variant="danger">❌ Erreur lors de la mise à jour.</Alert>);
    } else {
      setScanResult(<Alert variant="success">{successMessage}</Alert>);
    }

    setPendingConfirmation(null);
  };

  return (
    <div className="p-4">
      <FormGroup>
        <Label for="tableSelect">Choisir un type de données</Label>
        <Input
          type="select"
          id="tableSelect"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="forfait">Forfait</option>
          <option value="pack_apers">Pack Apers</option>
          <option value="pack_goodies">Pack Goodies</option>
          <option value="pack_bouffe">Pack Bouffe</option>
          <option value="location_assurance">Location Assurance</option>
          <option value="viennoiserie">Viennoiserie</option>
          <option value="resto">Resto</option>
        </Input>
      </FormGroup>

      <div className="d-flex gap-3 mb-3">
        <Button color="success" onClick={startScan} disabled={scanning}>
          Start Scan
        </Button>
        <Button color="danger" onClick={stopScan} disabled={!scanning}>
          Stop Scan
        </Button>
      </div>

      {pendingConfirmation && (
        <div className="d-flex gap-3 mb-3">
          <Button color="warning" onClick={confirmPickup}>
            Confirmer la récupération
          </Button>
        </div>
      )}

    {scanResult && (
        <div style={{ marginBottom: '1rem' }}>
            {scanResult}
        </div>
    )}

      <div
        id="reader"
        style={{
            width: '100%',
            maxWidth: '400px',
            aspectRatio: '4 / 3',
            border: '1px solid #ccc',
            margin: '0 auto',
        }}
      />
    </div>
  );
}

export default QrScanner;
