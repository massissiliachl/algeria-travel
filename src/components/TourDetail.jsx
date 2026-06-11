import React from 'react';

const TourDetail = () => {
  const handleBooking = () => {
    alert('✨ Demande reçue ! Notre équipe vous recontacte sous 2h.');
  };

  return (
    <div className="tour-detail" data-aos="fade-up" id="booking">
      <div className="tour-detail-img"></div>
      <div className="tour-detail-content">
        <span style={{ color: 'var(--terre-cuite)', fontWeight: 800 }}>EXPÉDITION SUD-ALGÉRIENNE</span>
        <h2>Sahara Oasis Trek & Djanet</h2>
        <p>Une immersion intense dans le plus beau désert du monde. Accompagnés par nos guides touaregs.</p>
        <ul className="features-list">
          <li><i className="fas fa-check-circle"></i> Guide local francophone & Équipe de chameliers</li>
          <li><i className="fas fa-utensils"></i> Repas traditionnels sahariens inclus</li>
          <li><i className="fas fa-campground"></i> Bivouacs haut de gamme sous les étoiles</li>
          <li><i className="fas fa-ticket-alt"></i> Vols internes inclus depuis Alger</li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', flexWrap: 'wrap' }}>
          <span className="price" style={{ fontSize: '2rem' }}>1190 €</span>
          <span>Tout inclus / personne</span>
        </div>
        <button className="btn-primary" style={{ marginTop: '25px' }} onClick={handleBooking}>
          S'inscrire au Circuit <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default TourDetail;