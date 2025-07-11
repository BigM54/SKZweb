import React, { useEffect, useRef, useState } from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

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

          const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw',
            {
              global: {
                headers: { Authorization: `Bearer ${token}` },
              },
            }
          );

          const { table, fields } = config;
          const { data, error } = await supabase
            .from(table)
            .select(fields.join(','))
            .eq('id', decodedText)
            .single();

        if (error || !data) {
        setScanResult('❌ Données non trouvées');
        } else {
        const message = fields.map((f) => `${f}: ${data[f] ?? 'N/A'}`).join('\n');
        setScanResult(`✅ Informations ${type} :\n${message}`);
        }

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
    {scanResult && (
        <div
            style={{
            whiteSpace: 'pre-line',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '0.25rem',
            border: '1px solid #ccc',
            }}
        >
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
