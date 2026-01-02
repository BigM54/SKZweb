
import React from 'react';
import { Link } from 'react-router-dom';

function PartnerCard({ name, logoSrc, partnerKey }) {
  return (
    <Link to="/partenaires/gallery" state={{ partner: partnerKey }} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ background: '#fff', color: '#111', borderRadius: 12, padding: 20, width: 520, maxWidth: '96vw', boxShadow: '0 6px 18px rgba(0,0,0,0.12)', display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logoSrc} alt={`${name} logo`} style={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 8, display: 'block' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{name}</div>
          <div style={{ marginTop: 6, fontSize: '0.95rem', color: '#333' }}>Cliquez pour afficher les offres et opportunités de recrutement.</div>
        </div>
      </div>
    </Link>
  );
}

export default function Partenaires() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fbff', color: '#111', width: '100vw', padding: '4rem 1rem' }}>
      <div style={{ maxWidth: 1000, width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '2rem' }}>Nos partenaires</h2>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          <PartnerCard
            name="DC Shoes"
            partnerKey="dc"
            logoSrc="/DC.png"
          />
          <PartnerCard
            name="EY"
            partnerKey="ey"
            logoSrc="/EY.png"
          />
          <PartnerCard
            name="L'Oréal"
            partnerKey="loreal"
            logoSrc="/loreal.png"
          />
        </div>
      </div>
    </div>
  );
}