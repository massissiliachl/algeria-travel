import React, { useState } from 'react';

const MapSection = () => {
  const [activeRegion, setActiveRegion] = useState('nord');

  const regions = {
    nord: '🌊 Nord Littoral : Tipaza, Alger, Oran - Climat méditerranéen',
    oasis: '🏜️ Oasis : Ghardaïa, Timimoun - Architecture d\'argile rouge',
    sud: '⛰️ Grand Sud : Djanet, Hoggar - Dunes géantes, nuits étoilées'
  };

  const regionLabels = {
    nord: '🌊 Le Nord Littoral : Tipaza, Alger, Oran',
    oasis: '🏜️ Les Oasis & Portes du Désert : Ghardaïa, Timimoun',
    sud: '⛰️ Le Grand Sud Saharien : Djanet, Hoggar'
  };

  return (
    <div className="map-section" data-aos="fade-up" id="map">
      <div className="map-grid">
        <div className="map-info">
          <h2><i className="fas fa-map-marked-alt"></i> Géographie & Climats</h2>
          <p>Choisissez votre climat d'aventure. L'Algérie offre une diversité saisissante.</p>
          <ul className="region-list">
            {Object.keys(regions).map(region => (
              <li 
                key={region}
                className={activeRegion === region ? 'active' : ''}
                onClick={() => setActiveRegion(region)}
              >
                {regionLabels[region]}
              </li>
            ))}
          </ul>
        </div>
        <div className="map-placeholder">
          <i className="fas fa-mountain-sun fa-4x" style={{ opacity: 0.6 }}></i>
          <span style={{ position: 'absolute', bottom: '25px', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '50px' }}>
            {regions[activeRegion]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapSection;