import React from 'react';

const Hero = () => {
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content" data-aos="fade-up">
        <h1>Là où le Sahara<br />Rencontre la Mer</h1>
        <p>Explorez des dunes dorées à perte de vue, des vestiges romains surplombant la Méditerranée et l'accueil légendaire des oasis algériennes.</p>
        <a href="#tours" className="btn-primary" onClick={(e) => handleSmoothScroll(e, 'tours')}>
          Découvrir nos Circuits <i className="fas fa-arrow-right"></i>
        </a>
      </div>
    </section>
  );
};

export default Hero;