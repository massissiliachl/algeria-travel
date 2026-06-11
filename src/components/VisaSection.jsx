import React from 'react';

const VisaSection = () => {
  return (
    <div className="visa-section" data-aos="fade-up">
      <div style={{ flex: 1 }}>
        <h2 style={{ color: 'var(--bleu-mediterranee)' }}>Visa d'Entrée Simplifié</h2>
        <p>Notre agence agréée génère pour vous l'autorisation d'embarquement officielle.</p>
        <p style={{ fontWeight: 800, marginTop: '20px', color: 'var(--terre-cuite)' }}>✅ Obtention du Visa à l'Aéroport !</p>
      </div>
      <div style={{ flex: 1.5 }}>
        <div className="visa-steps">
          <div className="step">
            <div className="step-number">1</div>
            <strong>Invitation</strong><br />Certificat sous 48h
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <strong>Embarquement</strong><br />Présentez la lettre
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <strong>Arrivée</strong><br />Visa délivré
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaSection;