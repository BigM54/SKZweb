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
    recupField: 'null',
  },
  pack_apers: {
    table: 'options',
    fields: ['saucisson', 'fromage', 'biere'],
    recupField: 'pack_apers',
  },
  pack_goodies: {
    table: 'options',
    fields: ['masque', 'pack_fumeur', 'pack_soiree', 'pack_grand_froid'],
    recupField: 'pack_apers',
  },
  pack_bouffe: {
    table: 'residence',
    fields: [],
    recupField: 'pack_bouffe',
  },
  location_assurance: {
    table: 'options',
    fields: ['pack_location', 'materiel_location', 'casque', 'assurance'],
    recupField: 'none',
  },
  viennoiserie: {
    table: 'options',
    fields: ['pain', 'croissant', 'pain_choco'],
    recupField: 'boulangerie',
  },
  resto: {
    table: 'resto',
    fields: ['tabagns'],
    recupField: 'resto',
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
        { fps: 10, qrbox: 400 },
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
                .select('email, bucque, prenom, nom')
                .eq('id', decodedText)
                .single();
              if (profilsError || !profilsData) {
                message = '❌ Données non trouvées';
                variant = 'danger';
                break;
              }
              const { data: optionsData } = await supabase
                .from('options')
                .select('taille_pull, type_forfait, bus')
                .eq('id', decodedText)
                .single();
              const { data: paymentsData, error: paymentsError } = await supabase
                .from('Paiements')
                .select('acompteStatut, paiement1Statut, paiement2Statut, paiement3Recu, paiement3Montant, Fraude')
                .eq('email', profilsData.email)
                .single();
              if (paymentsError) {
                message = '❌ Erreur récupération paiements';
                variant = 'danger';
                break;
              }
              const totalToPay = (Number(paymentsData?.paiement3Montant) || 0) + 425;
              const totalPaid = (paymentsData?.acompteStatut ? 25 : 0) + (paymentsData?.paiement1Statut ? 200 : 0) + (paymentsData?.paiement2Statut ? 200 : 0) + (Number(paymentsData?.paiement3Recu) || 0);
              const remaining = Math.max(0, totalToPay - totalPaid);
              const paymentsOk = remaining === 0 && !paymentsData?.Fraude;

              if (paymentsOk) {
                message = `👤 ${profilsData.prenom} ${profilsData.nom} (${profilsData.bucque})\n\n🎽 Taille Pull: ${optionsData?.taille_pull || '—'}\n🎟️ Forfait: ${optionsData?.type_forfait || '—'}`;
                if (optionsData?.bus) {
                  message += `\n🚌 Bus: ${optionsData.bus}`;
                }
              } else {
                message = `👤 ${profilsData.prenom} ${profilsData.nom} (${profilsData.bucque})\n\n🎽 Taille Pull: ${optionsData?.taille_pull || '—'}\n🎟️ Forfait: ${optionsData?.type_forfait || '—'}`;
                if (optionsData?.bus) {
                  message += `\n🚌 Bus: ${optionsData.bus}`;
                }
                message += `\n\nPaiements:\nAcompte: ${paymentsData?.acompteStatut ? 'Payé' : 'Non payé'}\nPaiement 1: ${paymentsData?.paiement1Statut ? 'Payé' : 'Non payé'}\nPaiement 2: ${paymentsData?.paiement2Statut ? 'Payé' : 'Non payé'}\nPaiement 3: ${paymentsData?.paiement3Recu || 0}€ / ${paymentsData?.paiement3Montant || 0}€\nTotal à payer: ${totalToPay}€\nTotal payé: ${totalPaid}€\nReste: ${remaining}€`;
                if (remaining > 0) {
                  message += '\n\n❌ Tous les paiements ne sont pas effectués !';
                  variant = 'danger';
                }
                if (paymentsData?.Fraude) {
                  message += '\n\n⚠️ FRAUDE ATTENTION';
                  variant = 'danger';
                }
              }
              const { data: recupData } = await supabase
                .from('pack_recup')
                .select('forfait')
                .eq('id', decodedText)
                .single();
              if (recupData?.forfait) {
                message += '\n\n❌ Déjà récupéré.';
                variant = 'danger';
              } else {
                setPendingConfirmation({ type, data: profilsData, decodedText });
                message += '\n\nCliquez sur "Confirmer la récupération" pour valider.';
                variant = 'warning';
              }
            }
            break;
          case 'pack_bouffe':
            {
              const { data: residenceDataArray, error: residenceError } = await supabase
                .from('residence')
                .select('kgibs, responsable, resident1, resident2, resident3, resident4')
                .or(`responsable.eq.${decodedText},resident1.eq.${decodedText},resident2.eq.${decodedText},resident3.eq.${decodedText},resident4.eq.${decodedText}`);
              if (residenceError || !residenceDataArray || residenceDataArray.length === 0) {
                message = '❌ Données non trouvées';
                variant = 'danger';
                break;
              }
              const residenceData = residenceDataArray[0];
              const residentIds = [residenceData.responsable, residenceData.resident1, residenceData.resident2, residenceData.resident3, residenceData.resident4].filter(Boolean);
              const { data: regimesData } = await supabase
                .from('options')
                .select('id, regime')
                .in('id', residentIds);
              const regimeMap = {};
              regimesData?.forEach(r => {
                regimeMap[r.id] = r.regime;
              });
              message = `Régimes des résidents:\nResponsable: ${regimeMap[residenceData.responsable] || '—'}\nRésident 1: ${regimeMap[residenceData.resident1] || '—'}\nRésident 2: ${regimeMap[residenceData.resident2] || '—'}\nRésident 3: ${regimeMap[residenceData.resident3] || '—'}\nRésident 4: ${regimeMap[residenceData.resident4] || '—'}`;
              const { data: recupDataList } = await supabase
                .from('pack_recup')
                .select('id, pack_bouffe')
                .in('id', residentIds);
              const alreadyRecup = recupDataList.some(r => r.pack_bouffe);
              if (alreadyRecup) {
                message += '\n\n❌ Déjà récupéré.';
                variant = 'danger';
              } else {
                setPendingConfirmation({ type, data: residenceData, decodedText });
                message += '\n\nCliquez sur "Confirmer la récupération" pour valider.';
                variant = 'warning';
              }
            }
            break;
          case 'resto':
            {
              const { data: profilsData, error: profilsError } = await supabase
                .from('profils')
                .select('email')
                .eq('id', decodedText)
                .single();
              if (profilsError || !profilsData) {
                message = '❌ Données non trouvées';
                variant = 'danger';
                break;
              }
              const { data: restoData, error: restoError } = await supabase
                .from('resto')
                .select('tabagns, paiement')
                .eq('email', profilsData.email)
                .single();
              if (restoError || !restoData) {
                message = '❌ Données non trouvées';
                variant = 'danger';
                break;
              }
              if (!restoData.paiement) {
                message = '❌ Paiement non effectué à temps';
                variant = 'danger';
                break;
              }
              message = `Tabagns: ${restoData.tabagns}`;
              const { data: recupDataResto } = await supabase
                .from('pack_recup')
                .select(config.recupField)
                .eq('id', decodedText)
                .single();
              if (recupDataResto?.[config.recupField]) {
                message += '\n\n❌ Déjà récupéré.';
                variant = 'danger';
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
                const { data: recupDataPain } = await supabase
                  .from('pack_recup')
                  .select('boulangerie')
                  .eq('id', decodedText)
                  .single();
                if (recupDataPain?.boulangerie === today) {
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
                .select([...config.fields].join(','))
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
                const { data: recupDataDefault } = await supabase
                  .from('pack_recup')
                  .select(config.recupField)
                  .eq('id', decodedText)
                  .single();
                if (recupDataDefault?.[config.recupField]) {
                  message += '\n\n❌ Déjà récupéré.';
                  variant = 'danger';
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
    let successMessage = '';

    if (type === 'viennoiserie') {
      const today = new Date().toISOString().slice(0, 10);
      updateData = { id: decodedText, [fieldMap[type].recupField]: today };
      successMessage = `✅ Commande confirmée et récupérée !\nPain: ${data.pain}\nCroissant: ${data.croissant}\nPain choco: ${data.pain_choco}\nDate enregistrée: ${today}`;
    } else if (type === 'pack_bouffe') {
      const residentIds = [data.responsable, data.resident1, data.resident2, data.resident3, data.resident4].filter(Boolean);
      for (const residentId of residentIds) {
        const { error } = await supabase
          .from('pack_recup')
          .upsert({ id: residentId, pack_bouffe: true });
        if (error) {
          setScanResult(<Alert variant="danger">❌ Erreur lors de la mise à jour pour ${residentId}.</Alert>);
          return;
        }
      }
      successMessage = `✅ Pack bouffe confirmé pour la chambre ${data.kgibs}.`;
    } else {
      updateData = { id: decodedText, [fieldMap[type].recupField]: true };
      successMessage = `✅ Récupération confirmée pour ${type}.`;
    }

    if (type !== 'pack_bouffe') {
      const { error: updateError } = await supabase
        .from('pack_recup')
        .upsert(updateData);

      if (updateError) {
        setScanResult(<Alert variant="danger">❌ Erreur lors de la mise à jour.</Alert>);
      } else {
        setScanResult(<Alert variant="success">{successMessage}</Alert>);
      }
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
            width: '500px',
            height: '700px',
            border: '1px solid #ccc',
            marginBottom: '4rem',
            margin: '0 auto',
        }}
      />
    </div>
  );
}

export default QrScanner;
