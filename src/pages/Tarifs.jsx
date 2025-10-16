import React from 'react';
import './Tarifs.css';

const tarifs = [
  { label: 'Pack classique PG', price: '445€', details: 'Pack classique pour PG.' },
  { label: 'Pack Archi (si pas sur TBK)', price: '495€', details: 'Pack spécial Archi hors TBK.' },
  { label: 'Masques', price: '37€', details: 'Masque SKZ stylé.' },
  { label: 'Extension Paradiski', price: '50€', details: 'Forfait étendu (+200km de pistes).' },
  { label: 'Casque', price: '28€', details: 'Location casque.' },
  { label: 'Assurance Zen', price: '38€', details: 'Assurance annulation Zen.' },
  { label: 'Assurance Ski', price: '37€', details: 'Assurance multirisques Ski.' },
  { label: 'Assurance Zen + Ski', price: '55€', details: 'Assurance Zen + Ski.' },
  { label: 'Pack Croust (pain)', price: '10€', details: 'Baguette par jour.' },
  { label: 'Pack Croissant', price: '9,5€', details: 'Croissant par jour.' },
  { label: 'Pack Pain au choc’s', price: '9,5€', details: 'Pain au chocolat par jour.' },
  { label: 'Pack Bandar’s (saucisson)', price: '13€', details: 'Pack saucisson (3 x 180g).' },
  { label: 'Pack Fromage', price: '14€', details: 'Pack fromage (3 x 200g).' },
  { label: 'Pack Bière', price: '9,00€', details: 'Pack bière (blonde/genep/myrtille ou blonde/ambreé/blanche). Les 2 packs : 17€.' },
  { label: 'Pack Tariflette', price: '14€', details: 'Par kgib’ss.' },
  { label: 'Pack croziflette', price: '15,5€', details: 'Par kgib’ss.' },
  { label: 'Pack Fumeur', price: '8€', details: 'Zippo gravé / cendar de poche.' },
  { label: 'Pack Grand froid', price: '14€', details: 'Chaussettes / Bonnet / cache cou.' },
  { label: 'Pack Jeux', price: '14€', details: 'Jeu de carte / Flasque gravé / Banane.' },
  { label: 'Transport BUS Birse', price: '125€', details: 'Départ Birse.' },
  { label: 'Transport BUS Boquette', price: '125€', details: 'Départ Boquette.' },
  { label: 'Transport BUS Bordel’s', price: '125€', details: 'Départ Bordel’s.' },
  { label: 'Transport BUS KIN', price: '110€', details: 'Départ KIN.' },
  { label: 'Transport BUS Clun’s', price: '100€', details: 'Départ Clun’s.' },
  { label: 'Transport BUS Chalon’s', price: '110€', details: 'Départ Chalon’s.' },
  { label: 'Transport BUS Siber’s', price: '120€', details: 'Départ Siber’s.' },
  { label: 'Transport BUS P3', price: '120€', details: 'Départ P3.' },
];

export default function Tarifs() {
  const locationTable = [
    { equip: 'Ski + chaussures', bronze: 75, argent: 95, or: 112, platine: 147 },
    { equip: 'Snow + chaussures', bronze: '-', argent: 95, or: 112, platine: '-' },
    { equip: 'Ski', bronze: 68, argent: 85, or: 108, platine: 142 },
    { equip: 'Snowboard', bronze: '-', argent: 85, or: 108, platine: '-' },
    { equip: 'Chaussures', bronze: 51, argent: 73, or: 94, platine: 127 },
  ];

  return (
  <div className="tarifs-container" style={{ width: '100vw', maxWidth: '100vw', margin: 0, borderRadius: 0, boxShadow: 'none', padding: '2rem 0.5rem', background: '#fff' }}>
      <h2>Tarifs SKZ 2026</h2>
      <h4 className="mt-4 mb-2">Location matériel : tableau des prix</h4>
      <div className="table-responsive mb-4">
        <table className="table table-bordered table-striped" style={{ background: '#fff' }}>
          <thead>
            <tr>
              <th>Équipement</th>
              <th>Bronze</th>
              <th>Argent</th>
              <th>Or</th>
              <th>Platine</th>
            </tr>
          </thead>
          <tbody>
            {locationTable.map((row, i) => (
              <tr key={i}>
                <td>{row.equip}</td>
                <td>{row.bronze === '-' ? <span style={{color:'#bbb'}}>Indisponible</span> : row.bronze + '€'}</td>
                <td>{row.argent + '€'}</td>
                <td>{row.or + '€'}</td>
                <td>{row.platine === '-' ? <span style={{color:'#bbb'}}>Indisponible</span> : row.platine + '€'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tarifs-list">
        {tarifs.map((t, i) => (
          <div key={i} className="tarif-item">
            <div className="tarif-label"><strong>{t.label}</strong></div>
            <div className="tarif-price">{t.price}</div>
            <div className="tarif-details">{t.details}</div>
          </div>
        ))}
      </div>
      <div className="tarif-note">
        <strong>Note :</strong> Certains packs ont des quantités ou des conditions particulières. Consulte la FAQ ou contacte l’équipe pour plus d’infos.
      </div>
    </div>
  );
}
