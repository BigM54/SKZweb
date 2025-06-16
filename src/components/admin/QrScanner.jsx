import React, { useEffect, useRef, useState } from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
  const [selectedType, setSelectedType] = useState('profils');
  const typeRef = useRef('profils');
  const { getToken } = useAuth();

  useEffect(() => {
    typeRef.current = selectedType;
  }, [selectedType]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 300 });

    scanner.render(
      async (decodedText) => {
        const type = typeRef.current;
        const config = fieldMap[type];
        if (!config) {
          window.alert(`Type de données inconnu : ${type}`);
          return;
        }

        const { table, fields } = config;
        const token = await getToken({ template: 'supabase' });

        const supabase = createClient(
          'https://vwwnyxyglvbmgs.supabase.co',
          'eyJhbGciOiJIUzI1NiIsIn1udw',
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );

        const { data, error } = await supabase
          .from(table)
          .select(fields.join(','))
          .eq('id', decodedText)
          .single();

        if (error || !data) {
          window.alert('Données non trouvées');
        } else {
          const message = fields.map((f) => `${f}: ${data[f] ?? 'N/A'}`).join('\n');
          window.alert(`Informations ${type}:\n${message}`);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

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
          <option value="vienoiserie">Vienoiserie</option>
          <option value="location">Location</option>
          <option value="pack">Pack</option>
          <option value="bonvivant">Bon Vivant</option>
        </Input>
      </FormGroup>
      <div id="reader" style={{ width: '100%', maxWidth: 400, margin: '0 auto' }} />
    </div>
  );
}

export default QrScanner;
