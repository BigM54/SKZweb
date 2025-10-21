import React from 'react';

export default function ChoixOptions() {
  return (
    <div style={{minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.08)'}}>
        <h2 style={{marginBottom: '0.5rem'}}>Travaux en cours</h2>
        <p style={{marginBottom: '0.5rem'}}>La page des options est momentanément fermée pour maintenance — nous revenons dans environ 20 minutes. Merci pour ta patience.</p>
        <p style={{fontSize: '0.9rem', color: '#666'}}>Désolé pour le dérangement.</p>
      </div>
    </div>
  );
}
