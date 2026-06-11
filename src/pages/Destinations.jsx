// src/pages/Destinations.jsx
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLangHook';
import AOS from 'aos';
import 'aos/dist/aos.css';

const getLocalizedDest = (dest, pick) => ({
  ...dest,
  subtitle: pick(dest.subtitle, dest.subtitle_en),
  description: pick(dest.description, dest.description_en),
  bestTime: pick(dest.bestTime, dest.bestTime_en),
  duration: pick(dest.duration, dest.duration_en),
  itinerary: dest.itinerary.map((item) => ({
    ...item,
    title: pick(item.title, item.title_en),
    desc: pick(item.desc, item.desc_en),
  })),
});

const Destinations = () => {
  const { t, pick } = useLang();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const heroRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
    setTimeout(() => setIsLoading(false), 500);
    
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.opacity = `${Math.max(0, 1 - window.scrollY / 600)}`;
        if (window.innerWidth > 768) {
          heroRef.current.style.transform = `scale(${1 - window.scrollY / 2000})`;
        } else {
          heroRef.current.style.transform = 'none';
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const destinations = [
    {
      id: 1,
      name: "Timgad",
      subtitle: "La Pompéi de l'Afrique",
      subtitle_en: "The Pompeii of Africa",
      description: "Vestiges romains classés UNESCO parmi les mieux préservés d'Afrique du Nord.",
      description_en: "UNESCO-listed Roman ruins among the best preserved in North Africa.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHaUG1Z_ZV2gwi8RAX55XRmHI3fqbAziuyrg&s",
      location: "Batna, Aurès",
      bestTime: "Mars - Mai / Sept - Nov",
      bestTime_en: "Mar - May / Sep - Nov",
      duration: "4 jours",
      duration_en: "4 days",
      price: "45000",
      rating: 4.8,
      category: "culture",
      activities: ["🏛️ Site antique", "📜 Mosaïques", "🚶 Randonnée"],
      itinerary: [
        { day: 1, title: "Arrivée à Batna", title_en: "Arrival in Batna", desc: "Accueil et installation", desc_en: "Welcome and check-in" },
        { day: 2, title: "Timgad", title_en: "Timgad", desc: "Visite complète du site romain", desc_en: "Full tour of the Roman site" },
        { day: 3, title: "Exploration", title_en: "Exploration", desc: "Thermes et forum", desc_en: "Baths and forum" },
        { day: 4, title: "Départ", title_en: "Departure", desc: "Transfert aéroport", desc_en: "Airport transfer" }
      ]
    },
    {
      id: 2,
      name: "Timimoun",
      subtitle: "L'Oasis Rouge",
      subtitle_en: "The Red Oasis",
      description: "Ksour en terre rouge perchés sur les dunes du Sahara. Un spectacle unique.",
      description_en: "Red-earth ksour perched on Sahara dunes. A unique spectacle.",
      image: "https://elwatan.dz/wp-content/uploads/storage/43970/TIMIMOUN.jpg",
      location: "Gourara, Grand Sud",
      bestTime: "Octobre - Avril",
      bestTime_en: "October - April",
      duration: "5 jours",
      duration_en: "5 days",
      price: "35000",
      rating: 4.9,
      category: "desert",
      activities: ["🏜️ Dunes", "🕌 Ksour", "🌅 Coucher soleil"],
      itinerary: [
        { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Accueil et thé à la menthe", desc_en: "Welcome and mint tea" },
        { day: 2, title: "Ksour", title_en: "Ksour", desc: "Découverte des villages rouges", desc_en: "Discover the red villages" },
        { day: 3, title: "Dunes", title_en: "Dunes", desc: "Trek et coucher de soleil", desc_en: "Trek and sunset" },
        { day: 4, title: "Artisanat", title_en: "Crafts", desc: "Atelier poterie", desc_en: "Pottery workshop" },
        { day: 5, title: "Départ", title_en: "Departure", desc: "Transfert aéroport", desc_en: "Airport transfer" }
      ]
    },
    
    {
      id: 8,
      name: "Taghit",
      subtitle: "L'Oasis Secrète",
      subtitle_en: "The Secret Oasis",
      description: "Dunes majestueuses et oasis préservée au cœur du Sahara.",
      description_en: "Majestic dunes and a preserved oasis in the heart of the Sahara.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxC8ziUGgisBwriU1vhBnxClvWqqsfs8c2kA&s",
      location: "Béchar, Sahara",
      bestTime: "Octobre - Mars",
      bestTime_en: "October - March",
      duration: "4 jours",
      duration_en: "4 days",
      price: "720",
      rating: 4.8,
      category: "desert",
      activities: ["🏜️ Dunes", "🌴 Palmeraie", "🌅 Coucher soleil"],
      itinerary: [
        { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Accueil", desc_en: "Welcome" },
        { day: 2, title: "Dunes", title_en: "Dunes", desc: "Trek chamelier", desc_en: "Camel trek" },
        { day: 3, title: "Oasis", title_en: "Oasis", desc: "Visite palmeraie", desc_en: "Palm grove visit" },
        { day: 4, title: "Départ", title_en: "Departure", desc: "Transfert", desc_en: "Transfer" }
      ]
    },
    {
      id: 3,
      name: "Tassili n'Ajjer",
      subtitle: "Le Musée à Ciel Ouvert",
      subtitle_en: "The Open-Air Museum",
      description: "Art rupestre préhistorique et paysages lunaires classés UNESCO.",
      description_en: "Prehistoric rock art and UNESCO-listed lunar landscapes.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx0zN9XuJEhMuuosMwDbWxfkCyikBakJBMIQ&s",
      location: "Djanet, Sahara",
      bestTime: "Novembre - Février",
      bestTime_en: "November - February",
      duration: "7 jours",
      duration_en: "7 days",
      price: "12500",
      rating: 4.9,
      category: "nature",
      activities: ["🎨 Art rupestre", "🥾 Trek", "⛺ Bivouac"],
      itinerary: [
        { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Préparation du trek", desc_en: "Trek preparation" },
        { day: 2, title: "Départ", title_en: "Departure", desc: "Route en 4x4", desc_en: "4x4 route" },
        { day: 3, title: "Gravures", title_en: "Engravings", desc: "Art préhistorique", desc_en: "Prehistoric art" },
        { day: 4, title: "Canyons", title_en: "Canyons", desc: "Trek dans les gorges", desc_en: "Gorge trek" },
        { day: 5, title: "Bivouac", title_en: "Bivouac", desc: "Nuit sous les étoiles", desc_en: "Night under the stars" },
        { day: 6, title: "Retour", title_en: "Return", desc: "Route retour", desc_en: "Return route" },
        { day: 7, title: "Départ", title_en: "Departure", desc: "Transfert aéroport", desc_en: "Airport transfer" }
      ]
    },
 
    {
      id: 5,
      name: "Ghardaïa",
      subtitle: "Vallée du M'Zab",
      subtitle_en: "M'Zab Valley",
      description: "Architecture berbère unique, cités fortifiées et oasis verdoyantes.",
      description_en: "Unique Berber architecture, fortified cities and lush oases.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgbwTu5UUydTv5_SwzjDeb9f75Fj4J_L9OyA&s",
      location: "Vallée du M'Zab",
      bestTime: "Octobre - Mars",
      bestTime_en: "October - March",
      duration: "4 jours",
      duration_en: "4 days",
      price: "48000",
      rating: 4.8,
      category: "culture",
      activities: ["🏛️ Architecture", "🎨 Artisanat", "🕌 Mosquées"],
      itinerary: [
        { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Panorama vallée", desc_en: "Valley panorama" },
        { day: 2, title: "Ksour", title_en: "Ksour", desc: "Visite architecture", desc_en: "Architecture tour" },
        { day: 3, title: "Palmeraie", title_en: "Palm grove", desc: "Atelier local", desc_en: "Local workshop" },
        { day: 4, title: "Départ", title_en: "Departure", desc: "Transfert", desc_en: "Transfer" }
      ]
    },
    
    {
      id: 7,
      name: "Djemila",
      subtitle: "La Perle Romaine",
      subtitle_en: "The Roman Pearl",
      description: "Site archéologique parmi les mieux conservés, classé UNESCO.",
      description_en: "Among the best-preserved archaeological sites, UNESCO-listed.",
      image: "https://visitalgeria.org/wp-content/uploads/2024/04/Djemila-the-archaeological-zone-of-the-well-preserved-Berber-Roman-ruins-in-North-Africa-Algeria.-UNESCO-World-Heritage-Site-15-1024x536.jpg",
      location: "Sétif",
      bestTime: "Mai - Octobre",
      bestTime_en: "May - October",
      duration: "3 jours",
      duration_en: "3 days",
      price: "20000",
      rating: 4.7,
      category: "culture",
      activities: ["🏛️ Ruines", "📜 Mosaïques", "🎭 Théâtre"],
      itinerary: [
        { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Installation", desc_en: "Check-in" },
        { day: 2, title: "Djemila", title_en: "Djemila", desc: "Visite du site", desc_en: "Site visit" },
        { day: 3, title: "Départ", title_en: "Departure", desc: "Transfert", desc_en: "Transfer" }
      ]
    }
  ];

  const filteredDestinations = activeFilter === 'all' 
    ? destinations 
    : destinations.filter(d => d.category === activeFilter);
  
  const displayedDestinations = filteredDestinations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDestinations.length;

  const loadMore = () => setVisibleCount(prev => prev + 4);
  
  const handleBooking = (dest) => {
    alert(`✨ ${t('booking_alert')} ${dest.name} ${t('booking_from')} ${dest.price} DA`);
  };

  const categoryIcons = {
    all: '🌍', culture: '🏛️', desert: '🏜️', nature: '🌿', city: '🏙️', history: '📜'
  };

  const categoryLabels = {
    all: t('filter_all'),
    culture: t('filter_culture'),
    desert: t('filter_desert'),
    nature: t('filter_nature'),
    city: t('filter_culture'),
    history: t('filter_culture'),
  };

  if (isLoading) {
    return (
      <div className="loader-wrapper">
        <div className="loader-spinner"></div>
        <p>{t('dest_loader')}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Hero Section avec image locale */}
      <section className="hero" ref={heroRef}>
        <div className="hero-image"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tag" data-aos="fade-up">{t('dest_hero_tag')}</span>
          <h1 className="hero-title" data-aos="fade-up" data-aos-delay="100">
            {t('dest_hero_title_1')}<br />
            <span>{t('dest_hero_title_2')}</span>
          </h1>
          <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
            {t('dest_hero_subtitle')}
          </p>
          <div className="hero-stats" data-aos="fade-up" data-aos-delay="300">
            <div className="stat"><strong>12+</strong><span>{t('dest_stat_destinations')}</span></div>
            <div className="stat"><strong>50+</strong><span>{t('dest_stat_tours')}</span></div>
            <div className="stat"><strong>4.8★</strong><span>{t('dest_stat_travelers')}</span></div>
          </div>
        </div>
        <div className="hero-scroll">↓</div>
      </section>

      {/* Destinations Section */}
      <section className="destinations">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-subtitle">{t('dest_section_subtitle')}</span>
            <h2 className="section-title">{t('dest_section_title')} <span>{t('dest_section_title_span')}</span></h2>
            <div className="section-line"></div>
          </div>

          {/* Filters */}
          <div className="filters" data-aos="fade-up">
            {Object.entries(categoryIcons).map(([key, icon]) => (
              <button
                key={key}
                className={`filter ${activeFilter === key ? 'active' : ''}`}
                onClick={() => { setActiveFilter(key); setVisibleCount(6); }}
              >
                {icon} {categoryLabels[key] || key}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid">
            {displayedDestinations.map((dest, idx) => {
              const d = getLocalizedDest(dest, pick);
              return (
              <div key={dest.id} className="card" data-aos="fade-up" data-aos-delay={idx * 50}>
                <div className="card-image">
                  <img src={dest.image} alt={dest.name} />
                  <div className="card-overlay"></div>
                  <div className="card-price">{dest.price}DA<span>{t('per_person')}</span></div>
                  <div className="card-rating">★ {dest.rating}</div>
                </div>
                <div className="card-content">
                  <div className="card-location">{dest.location}</div>
                  <h3>{dest.name}</h3>
                  <p className="card-subtitle">{d.subtitle}</p>
                  <p className="card-desc">{d.description}</p>
                  
                  <div className="card-activities">
                    {dest.activities.map((act, i) => (
                      <span key={i} className="activity">{act}</span>
                    ))}
                  </div>
                  
                  <div className="card-info">
                    <span>📅 {d.bestTime}</span>
                    <span>⏱️ {d.duration}</span>
                  </div>
                  
                  <div className="card-buttons">
                    <button 
                      className="btn-outline" 
                      onClick={() => setSelectedItinerary(selectedItinerary === dest.id ? null : dest.id)}
                    >
                      {selectedItinerary === dest.id ? t('btn_hide') : t('btn_itinerary')}
                    </button>
                    <button className="btn-primary" onClick={() => handleBooking(dest)}>{t('btn_book')}</button>
                  </div>
                  
                  {selectedItinerary === dest.id && (
                    <div className="itinerary">
                      <h4>{t('itinerary_title')}</h4>
                      {d.itinerary.map((item, i) => (
                        <div key={i} className="itinerary-item">
                          <span className="day">{t('day_label')}{i+1}</span>
                          <div>
                            <strong>{item.title}</strong>
                            <p>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );})}
          </div>

          {hasMore && (
            <div className="load-more" data-aos="fade-up">
              <button onClick={loadMore}>{t('load_more')} <span>↓</span></button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature" data-aos="fade-up">
              <div className="feature-icon">🏆</div>
              <h3>{t('feature_experts_title')}</h3>
              <p>{t('feature_experts_desc')}</p>
            </div>
            <div className="feature" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-icon">✧</div>
              <h3>{t('feature_custom_title')}</h3>
              <p>{t('feature_custom_desc')}</p>
            </div>
            <div className="feature" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-icon">♡</div>
              <h3>{t('feature_authentic_title')}</h3>
              <p>{t('feature_authentic_desc')}</p>
            </div>
            <div className="feature" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-icon">🕊️</div>
              <h3>{t('feature_support_title')}</h3>
              <p>{t('feature_support_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-content">
          <span className="cta-tag">{t('cta_tag')}</span>
          <h2>{t('cta_title')}</h2>
          <p>{t('cta_subtitle')}</p>
          <button className="cta-button" onClick={() => alert(t('cta_alert'))}>
            {t('cta_button')}
          </button>
        </div>
      </section>

      <Footer />

      <style>{`
        /* RESET & BASE */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
          max-width: 100%;
          overscroll-behavior-x: none;
        }

        /* LOADER */
        .loader-wrapper {
          position: fixed;
          inset: 0;
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          gap: 20px;
          color: #c8a87c;
          font-family: system-ui, sans-serif;
        }
        .loader-spinner {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(200,168,124,0.2);
          border-top-color: #c8a87c;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* HERO - avec image locale */
        .hero {
          position: relative;
          min-height: 90vh;
          min-height: 90svh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          color: white;
          width: 100%;
          max-width: 100%;
        }
        .hero-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/design1.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        } 
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 100%);
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          padding: 60px 20px;
          max-width: 800px;
        }
        .hero-tag {
          font-size: 12px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #c8a87c;
          display: inline-block;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(42px, 10vw, 82px);
          font-weight: 500;
          line-height: 1.1;
          margin-bottom: 24px;
        }
        .hero-title span {
          font-style: italic;
          font-weight: 300;
          color: #c8a87c;
        }
        .hero-subtitle {
          font-size: 16px;
          opacity: 0.85;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
        }
        .stat strong {
          font-size: 28px;
          font-weight: 400;
          color: #c8a87c;
          display: block;
        }
        .stat span {
          font-size: 12px;
          opacity: 0.7;
        }
        .hero-scroll {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 20px;
          animation: bounce 2s infinite;
          cursor: pointer;
          z-index: 2;
          color: white;
        }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }

        /* DESTINATIONS */
        .destinations {
          padding: 80px 0;
          background: #faf8f5;
        }
        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-subtitle {
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #c8a87c;
        }
        .section-title {
          font-size: clamp(28px, 6vw, 44px);
          font-weight: 400;
          margin-top: 12px;
        }
        .section-title span {
          font-weight: 600;
          color: #c8a87c;
        }
        .section-line {
          width: 50px;
          height: 2px;
          background: #c8a87c;
          margin: 20px auto 0;
        }

        /* FILTERS */
        .filters {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 50px;
          flex-wrap: wrap;
        }
        .filter {
          background: transparent;
          border: 1px solid #e0d8d0;
          padding: 8px 24px;
          border-radius: 40px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #5a4a3a;
        }
        .filter:hover, .filter.active {
          background: #c8a87c;
          border-color: #c8a87c;
          color: white;
        }

        /* GRID */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
        }
        .card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(0,0,0,0.05);
        }
        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .card-image {
          position: relative;
          height: 250px;
          overflow: hidden;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .card:hover .card-image img {
          transform: scale(1.03);
        }
        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
        }
        .card-price {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          padding: 6px 14px;
          border-radius: 30px;
          color: #c8a87c;
          font-weight: 600;
          font-size: 18px;
        }
        .card-price span {
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          font-weight: normal;
        }
        .card-rating {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: #ffc107;
        }
        .card-content {
          padding: 24px;
        }
        .card-location {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #c8a87c;
          margin-bottom: 8px;
        }
        .card-content h3 {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .card-subtitle {
          font-size: 13px;
          color: #c8a87c;
          margin-bottom: 12px;
        }
        .card-desc {
          font-size: 13px;
          color: #6b5b4e;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .card-activities {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .activity {
          background: #f0ebe5;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          color: #5a4a3a;
        }
        .card-info {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #8a7a6a;
          padding: 12px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
          margin-bottom: 16px;
        }
        .card-buttons {
          display: flex;
          gap: 12px;
        }
        .btn-outline {
          flex: 1;
          background: transparent;
          border: 1px solid #c8a87c;
          padding: 10px;
          border-radius: 30px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          color: #c8a87c;
        }
        .btn-outline:hover {
          background: #c8a87c10;
        }
        .btn-primary {
          flex: 1;
          background: #c8a87c;
          border: none;
          padding: 10px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }
        .btn-primary:hover {
          background: #b8956a;
        }

        /* ITINERARY */
        .itinerary {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }
        .itinerary h4 {
          font-size: 14px;
          margin-bottom: 12px;
          color: #c8a87c;
        }
        .itinerary-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .itinerary-item .day {
          min-width: 32px;
          height: 32px;
          background: #f0ebe5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #c8a87c;
        }
        .itinerary-item strong {
          font-size: 13px;
          display: block;
          margin-bottom: 2px;
        }
        .itinerary-item p {
          font-size: 11px;
          color: #8a7a6a;
        }

        /* LOAD MORE */
        .load-more {
          text-align: center;
          margin-top: 50px;
        }
        .load-more button {
          background: transparent;
          border: 1px solid #c8a87c;
          padding: 12px 36px;
          border-radius: 40px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          color: #c8a87c;
        }
        .load-more button:hover {
          background: #c8a87c;
          color: white;
        }

        /* FEATURES */
        .features {
          padding: 70px 0;
          background: #1a1a1a;
          color: white;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }
        .feature {
          text-align: center;
          padding: 24px;
        }
        .feature-icon {
          font-size: 40px;
          margin-bottom: 16px;
          opacity: 0.8;
        }
        .feature h3 {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #c8a87c;
        }
        .feature p {
          font-size: 13px;
          opacity: 0.6;
          line-height: 1.5;
        }

        /* CTA */
        .cta {
          padding: 80px 20px;
          text-align: center;
          background: #faf8f5;
        }
        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }
        .cta-tag {
          font-size: 11px;
          letter-spacing: 3px;
          color: #c8a87c;
          text-transform: uppercase;
        }
        .cta-content h2 {
          font-size: clamp(28px, 6vw, 42px);
          font-weight: 400;
          margin: 16px 0 8px;
        }
        .cta-content p {
          font-size: 16px;
          color: #8a7a6a;
          margin-bottom: 32px;
        }
        .cta-button {
          background: #c8a87c;
          border: none;
          padding: 14px 48px;
          border-radius: 40px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }
        .cta-button:hover {
          background: #b8956a;
          transform: translateY(-2px);
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 700px) {
          .hero-stats {
            gap: 24px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 36px;
            word-break: break-word;
          }
          .filters {
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 8px;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
          }
          .container {
            padding: 0 16px;
          }
        }
        @media (max-width: 480px) {
          .hero-stats {
            gap: 16px;
          }
          .stat strong {
            font-size: 20px;
          }
          .filter {
            padding: 6px 16px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default Destinations;