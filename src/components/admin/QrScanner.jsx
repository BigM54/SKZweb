import React, { useEffect, useRef, useState } from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-bootstrap';

const fieldMap = {
  profils: {
    table: 'profils',
    fields: ['bucque', 'nums', 'prenom', 'nom', 'email', 'numero', 'tabagns', 'proms', 'peks'],
  },
  vienoiserie: {
    table: 'options',
    fields: ['pain', 'croissant', 'pain_choco'],
  },
  location: {
    table: 'options',
    fields: ['pack_location', 'materiel_location', 'casque', 'type_forfait', 'assurance'],
  },
  pack: {
    table: 'options',
    fields: ['masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid'],
  },
  bonvivant: {
    table: 'options',
    fields: ['saucisson', 'fromage', 'biere', 'bus'],
  },
};

function QrScanner() {
const hasStartedRef = useRef(false);
const [scanResult, setScanResult] = useState('');
  const [selectedType, setSelectedType] = useState('profils');
  const [scanning, setScanning] = useState(false);
  const [pendingViennoiserie, setPendingViennoiserie] = useState(null);
  const typeRef = useRef('profils');
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

        const { table, fields } = config;
        let message = '';
        let variant = 'success'; // vert par défaut
        let data, error;

        if (type === 'vienoiserie') {
          // Récupère la date actuelle au format YYYY-MM-DD
          const today = new Date().toISOString().slice(0, 10);
          // Récupère la ligne options
          const { data: optionsData, error: optionsError } = await supabase
            .from('options')
            .select([...fields, 'Date_boulangerie'].join(','))
            .eq('id', decodedText)
            .single();
          data = optionsData;
          error = optionsError;

          if (error || !data) {
            message = '❌ Données non trouvées';
            variant = 'danger';
          } else {
            // Vérifie la date
            if (data.Date_boulangerie === today) {
              message = `❌ La commande de viennoiserie a déjà été récupérée aujourd'hui (${today}).`;
              variant = 'danger';
            } else {
              // Au lieu de mettre à jour automatiquement, stocke les données pour confirmation
              message = `📦 Commande trouvée !\nPain: ${data.pain}\nCroissant: ${data.croissant}\nPain choco: ${data.pain_choco}\n\nCliquez sur "Confirmer la prise" pour valider.`;
              variant = 'warning';
              setPendingViennoiserie({ data, decodedText });
            }
          }
        } else {
          // ...comportement standard...
          const { data: stdData, error: stdError } = await supabase
            .from(table)
            .select(fields.join(','))
            .eq('id', decodedText)
            .single();
          data = stdData;
          error = stdError;
          if (error || !data) {
            message = '❌ Données non trouvées';
            variant = 'danger';
          } else {
            message = fields.map((f) => `${f}: ${data[f] ?? 'N/A'}`).join('\n');
            message = `✅ Informations ${type} :\n${message}`;
            variant = 'success';
          }
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

  const confirmViennoiserie = async () => {
    if (!pendingViennoiserie) return;

    const { data, decodedText } = pendingViennoiserie;
    const today = new Date().toISOString().slice(0, 10);
    const token = await getToken({ template: 'supabase' });

    const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { error: updateError } = await supabase
      .from('options')
      .update({ Date_boulangerie: today })
      .eq('id', decodedText);

    if (updateError) {
      setScanResult(<Alert variant="danger">❌ Erreur lors de la mise à jour de la date.</Alert>);
    } else {
      const message = `✅ Commande confirmée et récupérée !\nPain: ${data.pain}\nCroissant: ${data.croissant}\nPain choco: ${data.pain_choco}\nDate enregistrée: ${today}`;
      setScanResult(<Alert variant="success">{message.split('\n').map((line, i) => <div key={i}>{line}</div>)}</Alert>);
    }
    
    setPendingViennoiserie(null);
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
          <option value="profils">Profils</option>
          <option value="vienoiserie">Viennoiserie</option>
          <option value="location">Location</option>
          <option value="pack">Pack</option>
          <option value="bonvivant">Bon Vivant</option>
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

      {pendingViennoiserie && (
        <div className="d-flex gap-3 mb-3">
          <Button color="warning" onClick={confirmViennoiserie}>
            Confirmer la prise de commande
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
