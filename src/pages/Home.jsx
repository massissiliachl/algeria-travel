// src/pages/Home.jsx
import React, { useState, useEffect, lazy, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import { useLang } from '../hooks/useLangHook';
import AOS from 'aos';
import 'aos/dist/aos.css';


const FEATURED_TOURS = [
  {
    id: 1,
    name: "Timimoun la Rouge",
    name_en: "Timimoun the Red",
    tagline: "Perle du Sahara",
    tagline_en: "Pearl of the Sahara",
    description: "Découvrez les dunes rouges de Timimoun, les ksour traditionnels et les couchers de soleil magiques du Grand Erg Occidental.",
    description_en: "Discover the red dunes of Timimoun, traditional ksour and magical sunsets of the Great Western Erg.",
    duration: "5 jours",
    duration_en: "5 days",
    price: 45000,
    oldPrice: 55000,
    rating: 4.9,
    reviews: 234,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9ofb0IQyWwdN7RdPnQ7wFi1unr80uZcHMzA&s",
    badge: "POPULAIRE",
    badge_en: "POPULAR"
  },
  {
    id: 2,
    name: "Le Tassili n'Ajjer",
    name_en: "Tassili n'Ajjer",
    tagline: "Patrimoine mondial UNESCO",
    tagline_en: "UNESCO World Heritage",
    description: "Explorez les célèbres gravures rupestres, les arches rocheuses et les paysages lunaires de Djanet.",
    description_en: "Explore the famous rock engravings, rock arches and lunar landscapes of Djanet.",
    duration: "8 jours",
    duration_en: "8 days",
    price: 85000,
    rating: 5.0,
    reviews: 178,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0QfJHCzON4Am5ZZ6OP5mnPLiQhwdDiGUH4A&s",
    badge: "INCONTOURNABLE",
    badge_en: "MUST-SEE"
  },
  {
    id: 3,
    name: "Ghardaïa & la Vallée du M'Zab",
    name_en: "Ghardaïa & M'Zab Valley",
    tagline: "Architecture unique",
    tagline_en: "Unique architecture",
    description: "Partez à la découverte des cités millénaires du M'Zab et de leur patrimoine exceptionnel.",
    description_en: "Discover the millennia-old cities of M'Zab and their exceptional heritage.",
    duration: "4 jours",
    duration_en: "4 days",
    price: 35000,
    rating: 4.8,
    reviews: 312,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDSh2ht0MFpFw7A-9DBTpYxbY7nGlw_Hn6Qw&s",
    badge: "CULTURE",
    badge_en: "CULTURE"
  },
  {
    id: 4,
    name: "Les Merveilles de Béjaïa",
    name_en: "The Wonders of Béjaïa",
    tagline: "Mer & Montagne",
    tagline_en: "Sea & Mountain",
    description: "Cap Carbon, les Aiguades, les grottes d'Aokas et les magnifiques plages de la côte béjaouie.",
    description_en: "Cap Carbon, Les Aiguades, the caves of Aokas and the magnificent beaches of the Béjaïa coast.",
    duration: "3 jours",
    duration_en: "3 days",
    price: 25000,
    rating: 4.9,
    reviews: 290,
    image: "https://dia-algerie.com/wp-content/uploads/2021/03/cap-carbon.jpg",
    badge: "COUP DE CŒUR",
    badge_en: "FAVORITE"
  },
  {
    id: 5,
    name: "Le Hoggar & Assekrem",
    name_en: "Hoggar & Assekrem",
    tagline: "Au cœur du désert",
    tagline_en: "Heart of the desert",
    description: "Vivez une aventure inoubliable dans les montagnes du Hoggar et admirez le lever du soleil à Assekrem.",
    description_en: "Experience an unforgettable adventure in the Hoggar mountains and watch the sunrise at Assekrem.",
    duration: "9 jours",
    duration_en: "9 days",
    price: 95000,
    rating: 5.0,
    reviews: 167,
    image: "https://www.mosaicnorthafrica.com/wp-content/uploads/2017/01/view-from-assekrem-plateau-in-ahaggar-national-park.jpg",
    badge: "EXPERT",
    badge_en: "EXPERT"
  },
  {
    id: 6,
    name: "Constantine la Suspendue",
    name_en: "Constantine the Hanging",
    tagline: "Ville des ponts",
    tagline_en: "City of bridges",
    description: "Découvrez les ponts suspendus, le palais Ahmed Bey et l'histoire fascinante de Constantine.",
    description_en: "Discover the suspended bridges, the Ahmed Bey palace and the fascinating history of Constantine.",
    duration: "3 jours",
    duration_en: "3 days",
    price: 22000,
    rating: 4.7,
    reviews: 145,
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/5b/31/eb/caption.jpg?w=1200&h=-1&s=1",
    badge: "HISTOIRE",
    badge_en: "HISTORY"
  }
];

const TESTIMONIALS = [
  {
    name: "Lilia",
    role: "Voyageuse",
    role_en: "Traveler",
    content: "Le Tassili n'Ajjer est l'un des plus beaux endroits que j'ai visités. Organisation parfaite.",
    content_en: "Tassili n'Ajjer is one of the most beautiful places I've visited. Perfect organization.",
    rating: 5,
    location: "France",
    location_en: "France"
  },
  {
    name: "Ahmed Benali",
    role: "Voyageur",
    role_en: "Traveler",
    content: "Notre séjour à Béjaïa était exceptionnel. Les paysages sont à couper le souffle.",
    content_en: "Our stay in Béjaïa was exceptional. The landscapes are breathtaking.",
    rating: 5,
    location: "Alger",
    location_en: "Algiers"
  },
  {
    name: "Laura I",
    role: "Voyageuse",
    role_en: "Traveler",
    content: "Timimoun et le Hoggar ont dépassé toutes mes attentes. Une expérience inoubliable.",
    content_en: "Timimoun and Hoggar exceeded all my expectations. An unforgettable experience.",
    rating: 5,
    location: "Belgique",
    location_en: "Belgium"
  }
];

const Home = () => {
  
  const [showBackToTop, setShowBackToTop] = useState(false);
  const newsletterRef = useRef(null);
  const toursScrollRef = useRef(null);
  const { language, t, pick } = useLang();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
    
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTours = (direction) => {
    if (toursScrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      toursScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section - Aligné à gauche */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-560126657.jpg?c=original"
            alt="Dunes du Sahara au coucher du soleil"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content" data-aos="fade-up">
            <span className="hero-tag">ALGERIA TRAVEL</span>
            <h1 className="hero-title">
              Là où le Sahara <br />
              <span className="text-accent">Rencontre la Mer</span>
            </h1>
            <p className="hero-description">
              Explorez des dunes dorées à perte de vue, des vestiges romains surplombant la Méditerranée <br />
              et l'accueil légendaire des oasis algériennes.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
                Découvrir nos Circuits <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Circuits Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('circuits_badge')}</span>
            <h2 className="section-title">{t('circuits_title')}</h2>
            <p className="section-subtitle">{t('circuits_subtitle')}</p>
          </div>
          
          <div className="scroll-wrapper">
            <button className="scroll-btn scroll-left" onClick={() => scrollTours('left')}>
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="tours-scroll" ref={toursScrollRef}>
              {FEATURED_TOURS.map((tour) => (
                <div className="tour-card" key={tour.id}>
                  {tour.badge && <span className="tour-badge">{language === 'fr' ? tour.badge : tour.badge_en}</span>}
                  <div className="tour-image">
                    <img src={tour.image} alt={tour.name} />
                  </div>
                  <div className="tour-info">
                    <div className="tour-header">
                      <h3>{language === 'fr' ? tour.name : tour.name_en}</h3>
                      <div className="tour-rating">
                        <span className="stars">{"★".repeat(Math.floor(tour.rating))}</span>
                        <span>({tour.reviews})</span>
                      </div>
                    </div>
                    <p className="tour-tagline">{language === 'fr' ? tour.tagline : tour.tagline_en}</p>
                    <p className="tour-description">{language === 'fr' ? tour.description : tour.description_en}</p>
                    <div className="tour-footer">
                      <div className="tour-price">
                        {tour.oldPrice && <span className="old-price">{tour.oldPrice}€</span>}
                        <span className="current-price">{tour.price}DA</span>
                      </div>
                      <button className="btn-outline-small">{t('btn_reserver')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="scroll-btn scroll-right" onClick={() => scrollTours('right')}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Témoignages - EN GRILLE (côte à côte) */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('testimonials_badge')}</span>
            <h2 className="section-title">Ce que nos <span className="text-accent">voyageurs</span> disent</h2>
            <p className="section-subtitle">Des centaines de voyageurs satisfaits partagent leur expérience</p>
          </div>
          
          <div className="testimonials-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <div className="testimonial-card" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="testimonial-quote-icon">
                  <i className="fas fa-quote-right"></i>
                </div>
                <div className="testimonial-stars">
                  {"★".repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">
                  "{language === 'fr' ? testimonial.content : testimonial.content_en}"
                </p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    <span>{testimonial.name.charAt(0)}</span>
                  </div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <span>{pick(testimonial.role, testimonial.role_en)} • {pick(testimonial.location, testimonial.location_en)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-newsletter" ref={newsletterRef}>
        <div className="container">
         <Contact />
        </div>
      </section>

      <Footer />
      
      {showBackToTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <i className="fas fa-arrow-up"></i>
        </button>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --accent: #c6a43b;
          --accent-dark: #a07d2c;
          --dark: #111111;
          --dark-gray: #1a1a1a;
          --gray: #666666;
          --light-gray: #f5f5f5;
          --white: #ffffff;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: var(--dark);
          line-height: 1.5;
          overflow-x: hidden;
          max-width: 100%;
        }

        .container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Typography */
        .section-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          color: var(--accent);
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--dark);
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: var(--gray);
          max-width: 600px;
          margin: 0 auto;
        }

        .text-accent {
          color: var(--accent);
        }

        .section {
          padding: 80px 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        /* Hero Section - Aligné à gauche */
        .hero {
          position: relative;
          z-index: 1;
          height: 100vh;
          min-height: 600px;
          display: flex;
          align-items: center;
          overflow: hidden;
          isolation: isolate;
          width: 100%;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-image {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.5) 50%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }

        .hero-container {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          text-align: left;
          color: var(--white);
        }

        .hero-content {
          max-width: 700px;
          width: 100%;
          padding: 0 20px;
          margin-left: 10%;
        }

        .hero-tag {
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 3px;
          color: var(--accent);
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: 3.8rem;
          font-weight: 700;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.1rem;
          margin-bottom: 32px;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: flex-start;
        }

        .btn-primary {
          background: var(--accent);
          color: var(--white);
          padding: 14px 32px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .btn-primary:hover {
          background: var(--accent-dark);
          transform: translateY(-2px);
          gap: 15px;
        }

        /* Buttons */
        .btn-outline, .btn-outline-small {
          padding: 14px 32px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 14px;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid var(--white);
          color: var(--white);
        }

        .btn-outline:hover {
          background: var(--white);
          color: var(--dark);
        }

        .btn-outline-small {
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
          padding: 8px 20px;
          font-size: 13px;
        }

        .btn-outline-small:hover {
          background: var(--accent);
          color: var(--white);
        }

        /* Scroll Wrapper */
        .scroll-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }

        .scroll-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--white);
          border: 1px solid #e0e0e0;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .scroll-btn:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--white);
        }

        /* Tours Scroll */
        .tours-scroll {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 8px 4px 24px;
          flex: 1;
          min-width: 0;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        }

        .tours-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .tours-scroll::-webkit-scrollbar-track {
          background: #e0e0e0;
          border-radius: 4px;
        }

        .tours-scroll::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 4px;
        }

        .tour-card {
          min-width: 360px;
          background: var(--white);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .tour-card:hover {
          transform: translateY(-4px);
        }

        .tour-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: var(--accent);
          color: var(--white);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          z-index: 1;
        }

        .tour-image {
          position: relative;
          height: 220px;
        }

        .tour-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tour-info {
          padding: 20px;
        }

        .tour-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .tour-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .tour-rating {
          font-size: 12px;
          color: var(--gray);
        }

        .tour-rating .stars {
          color: var(--accent);
        }

        .tour-tagline {
          font-size: 12px;
          color: var(--accent);
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .tour-description {
          font-size: 13px;
          color: var(--gray);
          line-height: 1.5;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tour-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }

        .tour-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .old-price {
          font-size: 12px;
          color: var(--gray);
          text-decoration: line-through;
        }

        .current-price {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--accent);
        }

        /* Témoignages - EN GRILLE (côte à côte) */
        .testimonials-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-top: 20px;
        }

        .testimonial-card {
          background: var(--white);
          border-radius: 20px;
          padding: 30px;
          transition: all 0.4s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .testimonial-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: var(--accent);
        }

        .testimonial-quote-icon {
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 3rem;
          color: var(--accent);
          opacity: 0.15;
        }

        .testimonial-stars {
          color: #ffc107;
          font-size: 16px;
          letter-spacing: 3px;
          margin-bottom: 20px;
        }

        .testimonial-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--gray);
          margin-bottom: 25px;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 10px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .testimonial-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .testimonial-info h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 4px;
        }

        .testimonial-info span {
          font-size: 12px;
          color: var(--gray);
        }

        /* Newsletter */
        .section-newsletter {
          padding: 80px 0;
          background: var(--light-gray);
        }

        /* Back to Top */
        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 48px;
          height: 48px;
          background: var(--accent);
          border: none;
          border-radius: 50%;
          color: var(--white);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .back-to-top:hover {
          background: var(--accent-dark);
          transform: translateY(-3px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-title { font-size: 3rem; }
          .hero-content { margin-left: 5%; max-width: 600px; }
          .section-title { font-size: 2rem; }
          .tour-card { min-width: 320px; }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); gap: 25px; }
        }

        @media (max-width: 768px) {
          .container { padding: 0 16px; }
          
          .hero {
            min-height: 100vh;
          }
          
          .hero-content {
            margin-left: 0;
            padding: 0 20px;
            text-align: left;
          }
          
          .hero-title {
            font-size: 2.2rem;
          }
          
          .hero-description {
            font-size: 0.95rem;
          }
          
          .hero-buttons {
            justify-content: flex-start;
          }
          
          .hero-buttons button {
            width: auto;
          }
          
          .hero-overlay {
            background: linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.8) 0%,
              rgba(0, 0, 0, 0.6) 70%,
              rgba(0, 0, 0, 0.3) 100%
            );
          }
          
          .scroll-btn { display: none; }
          .scroll-wrapper { gap: 0; }
          .tour-card { min-width: min(280px, 85vw); }
          .section { padding: 60px 0; }
          .section-title { font-size: 1.75rem; }
          .testimonials-grid { grid-template-columns: 1fr; gap: 20px; }
          .testimonial-card { padding: 25px; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 1.8rem; }
          .hero-tag { font-size: 11px; }
          .hero-description { font-size: 0.85rem; }
          .hero-buttons button { 
            padding: 12px 24px;
            font-size: 13px;
          }
          .testimonial-text { font-size: 0.9rem; }
        }
      `}</style>
    </>
  );
};

export default Home;