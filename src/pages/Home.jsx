// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import { useLang } from '../hooks/useLangHook';
import AOS from 'aos';
import 'aos/dist/aos.css';

const FEATURED_TOURS = [
  {
    id: 1,
    name: "Timimoun",
    name_en: "Timimoun",
    subtitle: "Perle du Sahara",
    subtitle_en: "Pearl of the Sahara",
    description: "Découvrez les dunes rouges de Timimoun, les ksour traditionnels et les couchers de soleil magiques du Grand Erg Occidental.",
    description_en: "Discover the red dunes of Timimoun, traditional ksour and magical sunsets of the Great Western Erg.",
    fullDescription: "Timimoun, surnommée la rouge, est une ville oasis située au cœur du Sahara algérien. Ses dunes de sable rouge offrent des paysages à couper le souffle.",
    fullDescription_en: "Timimoun, nicknamed the red, is an oasis town located in the heart of the Algerian Sahara.",
    location: "Gourara, Grand Sud",
    bestTime: "October – April",
    duration: "5 jours",
    duration_en: "5 days",
    price: 45000,
    oldPrice: 55000,
    rating: 4.9,
    reviews: 234,
    image: "https://elwatan.dz/wp-content/uploads/storage/43970/TIMIMOUN.jpg",
    category: "desert",
    activities: ["🏜️ Dunes", "🕌 Ksour", "🌅 Sunset"],
    itinerary: [
      { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Accueil et thé à la menthe", desc_en: "Welcome and mint tea" },
      { day: 2, title: "Ksour", title_en: "Ksour", desc: "Découverte des villages rouges", desc_en: "Discover the red villages" },
      { day: 3, title: "Dunes", title_en: "Dunes", desc: "Trek et coucher de soleil", desc_en: "Trek and sunset" },
      { day: 4, title: "Artisanat", title_en: "Crafts", desc: "Atelier poterie", desc_en: "Pottery workshop" },
      { day: 5, title: "Départ", title_en: "Departure", desc: "Transfert aéroport", desc_en: "Airport transfer" },
    ],
  },
  {
    id: 2,
    name: "Tassili n'Ajjer",
    name_en: "Tassili n'Ajjer",
    subtitle: "Patrimoine mondial UNESCO",
    subtitle_en: "UNESCO World Heritage",
    description: "Explorez les célèbres gravures rupestres, les arches rocheuses et les paysages lunaires de Djanet.",
    description_en: "Explore the famous rock engravings, rock arches and lunar landscapes of Djanet.",
    fullDescription: "Le Tassili n'Ajjer est l'un des sites les plus extraordinaires au monde. Classé au patrimoine mondial de l'UNESCO.",
    fullDescription_en: "Tassili n'Ajjer is one of the most extraordinary sites in the world.",
    location: "Djanet, Sahara",
    bestTime: "November – February",
    duration: "8 jours",
    duration_en: "8 days",
    price: 85000,
    rating: 5.0,
    reviews: 178,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx0zN9XuJEhMuuosMwDbWxfkCyikBakJBMIQ&s",
    category: "nature",
    activities: ["🎨 Rock art", "🥾 Trek", "⛺ Bivouac"],
    itinerary: [
      { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Préparation trek", desc_en: "Trek preparation" },
      { day: 2, title: "Départ", title_en: "Departure", desc: "Route en 4x4", desc_en: "4x4 route" },
      { day: 3, title: "Gravures", title_en: "Engravings", desc: "Art préhistorique", desc_en: "Prehistoric art" },
      { day: 4, title: "Canyons", title_en: "Canyons", desc: "Trek dans les gorges", desc_en: "Gorge trek" },
      { day: 5, title: "Bivouac", title_en: "Bivouac", desc: "Nuit sous les étoiles", desc_en: "Night under the stars" },
      { day: 6, title: "Retour", title_en: "Return", desc: "Route retour", desc_en: "Return route" },
      { day: 7, title: "Départ", title_en: "Departure", desc: "Transfert aéroport", desc_en: "Airport transfer" },
    ],
  },
  {
    id: 3,
    name: "Ghardaïa",
    name_en: "Ghardaïa",
    subtitle: "Vallée du M'Zab",
    subtitle_en: "M'Zab Valley",
    description: "Partez à la découverte des cités millénaires du M'Zab et de leur patrimoine exceptionnel.",
    description_en: "Discover the millennia-old cities of M'Zab and their exceptional heritage.",
    fullDescription: "La vallée du M'Zab est un chef-d'œuvre d'architecture adaptée à l'environnement désertique.",
    fullDescription_en: "The M'Zab valley is a masterpiece of architecture adapted to the desert environment.",
    location: "Vallée du M'Zab",
    bestTime: "October – March",
    duration: "4 jours",
    duration_en: "4 days",
    price: 35000,
    rating: 4.8,
    reviews: 312,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMp3AEa2r0Ro7w0Z5u8NpkdqqSY_1zHKUFxg&s",
    category: "culture",
    activities: ["🏛️ Architecture", "🎨 Crafts", "🕌 Mosques"],
    itinerary: [
      { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Panorama sur la vallée", desc_en: "Valley panorama" },
      { day: 2, title: "Ksour", title_en: "Ksour", desc: "Tour architectural", desc_en: "Architecture tour" },
      { day: 3, title: "Palmeraie", title_en: "Palm grove", desc: "Atelier local", desc_en: "Local workshop" },
      { day: 4, title: "Départ", title_en: "Departure", desc: "Transfert", desc_en: "Transfer" },
    ],
  },
  {
    id: 4,
    name: "Béjaïa",
    name_en: "Béjaïa",
    subtitle: "Mer & Montagne",
    subtitle_en: "Sea & Mountain",
    description: "Cap Carbon, les grottes d'Aokas et les magnifiques plages de la côte béjaouie.",
    description_en: "Cap Carbon, Aokas caves and the magnificent beaches of the Béjaïa coast.",
    fullDescription: "Béjaïa offre un cadre naturel exceptionnel où la mer Méditerranée rencontre les montagnes du Djurdjura.",
    fullDescription_en: "Béjaïa offers an exceptional natural setting where the Mediterranean Sea meets the Djurdjura mountains.",
    location: "Béjaïa, Méditerranée",
    bestTime: "May – October",
    duration: "3 jours",
    duration_en: "3 days",
    price: 25000,
    rating: 4.9,
    reviews: 290,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5WbXBs5PN4-mk7IaBTQnOISb_0pCl7XqxKw&s",
    category: "nature",
    activities: ["🏖️ Beach", "⛰️ Hiking", "🦜 Birds"],
    itinerary: [
      { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Installation", desc_en: "Check-in" },
      { day: 2, title: "Cap Carbon", title_en: "Cap Carbon", desc: "Visite du cap", desc_en: "Visit the cape" },
      { day: 3, title: "Départ", title_en: "Departure", desc: "Transfert", desc_en: "Transfer" },
    ],
  },
  {
    id: 5,
    name: "Le Hoggar",
    name_en: "Hoggar",
    subtitle: "Au cœur du désert",
    subtitle_en: "Heart of the desert",
    description: "Vivez une aventure inoubliable dans les montagnes du Hoggar et admirez le lever du soleil à Assekrem.",
    description_en: "Experience an unforgettable adventure in the Hoggar mountains and watch the sunrise at Assekrem.",
    fullDescription: "Le Hoggar est un massif montagneux d'origine volcanique situé au cœur du Sahara.",
    fullDescription_en: "The Hoggar is a volcanic mountain range located in the heart of the Sahara.",
    location: "Tamanrasset, Sahara",
    bestTime: "November – February",
    duration: "9 jours",
    duration_en: "9 days",
    price: 95000,
    rating: 5.0,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=450&fit=crop",
    category: "desert",
    activities: ["🏔️ Mountains", "🌄 Sunrise", "⛺ Camping"],
    itinerary: [
      { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Accueil", desc_en: "Welcome" },
      { day: 2, title: "Départ", title_en: "Departure", desc: "Route vers Assekrem", desc_en: "Road to Assekrem" },
      { day: 3, title: "Assekrem", title_en: "Assekrem", desc: "Lever du soleil", desc_en: "Sunrise" },
      { day: 4, title: "Trek", title_en: "Trek", desc: "Randonnée", desc_en: "Hiking" },
      { day: 5, title: "Camp", title_en: "Camp", desc: "Nuit au bivouac", desc_en: "Night at the bivouac" },
      { day: 6, title: "Retour", title_en: "Return", desc: "Route retour", desc_en: "Return route" },
      { day: 7, title: "Tamanrasset", title_en: "Tamanrasset", desc: "Visite", desc_en: "Visit" },
      { day: 8, title: "Départ", title_en: "Departure", desc: "Transfert", desc_en: "Transfer" },
    ],
  },
  {
    id: 6,
    name: "Constantine",
    name_en: "Constantine",
    subtitle: "Ville des ponts",
    subtitle_en: "City of bridges",
    description: "Découvrez les ponts suspendus, le palais Ahmed Bey et l'histoire fascinante de Constantine.",
    description_en: "Discover the suspended bridges, the Ahmed Bey palace and the fascinating history of Constantine.",
    fullDescription: "Constantine, perchée sur un rocher vertigineux, est l'une des villes les plus impressionnantes d'Afrique.",
    fullDescription_en: "Constantine, perched on a dizzying rock, is one of the most impressive cities in Africa.",
    location: "Constantine, Nord-Est",
    bestTime: "March – June / September – November",
    duration: "3 jours",
    duration_en: "3 days",
    price: 22000,
    rating: 4.7,
    reviews: 145,
    image: "https://www.visa-algerie.com/wp-content/uploads/2020/07/constantine.jpg.webp",
    category: "culture",
    activities: ["🌉 Bridges", "🏛️ Palace", "🏺 Museum"],
    itinerary: [
      { day: 1, title: "Arrivée", title_en: "Arrival", desc: "Installation", desc_en: "Check-in" },
      { day: 2, title: "Ponts", title_en: "Bridges", desc: "Visite des ponts suspendus", desc_en: "Visit the suspended bridges" },
      { day: 3, title: "Départ", title_en: "Departure", desc: "Transfert", desc_en: "Transfer" },
    ],
  },
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

// Composant Modal pour afficher les détails
const DestinationModal = ({ tour, onClose, language }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-image">
          <img src={tour.image} alt={tour.name} />
        </div>
        
        <div className="modal-content">
          <h2>{language === 'fr' ? tour.name : tour.name_en}</h2>
          <p className="modal-subtitle">{language === 'fr' ? tour.subtitle : tour.subtitle_en}</p>
          
          <div className="modal-rating">
            <span>★</span> {tour.rating} ({tour.reviews} {language === 'fr' ? 'avis' : 'reviews'})
          </div>
          
          <div className="modal-info">
            <div>📅 {language === 'fr' ? tour.duration : tour.duration_en}</div>
            <div>📍 {language === 'fr' ? 'Algérie' : 'Algeria'}</div>
            <div>⏰ {tour.bestTime}</div>
          </div>
          
          <div className="modal-description">
            <p>{language === 'fr' ? tour.fullDescription : tour.fullDescription_en}</p>
          </div>
          
          <div className="modal-price">
            {tour.oldPrice && <span className="old">{tour.oldPrice.toLocaleString()} DA</span>}
            <span className="current">{tour.price.toLocaleString()} DA</span>
            <span>/ {language === 'fr' ? 'personne' : 'person'}</span>
          </div>
          
          <div className="modal-actions">
            <button className="btn-reserver">{language === 'fr' ? 'Réserver maintenant' : 'Book now'}</button>
            <button className="btn-contact">{language === 'fr' ? 'Contacter un conseiller' : 'Contact advisor'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant AboutSection avec VIDÉO QUI MARCHE
const AboutSection = ({ language }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-grid">
          <div className="about-content" data-aos="fade-right">
            <span className="section-badge">{language === 'fr' ? 'QUI SOMMES-NOUS' : 'ABOUT US'}</span>
            <h2>{language === 'fr' ? 'Votre expert voyage' : 'Your travel expert'} <span className="text-accent">{language === 'fr' ? 'en Algérie' : 'in Algeria'}</span></h2>
            <p>{language === 'fr' ? 'Avec plus de 10 ans d\'expérience, Algeria Travel est votre partenaire de confiance pour découvrir les merveilles de l\'Algérie.' : 'With over 10 years of experience, Algeria Travel is your trusted partner to discover the wonders of Algeria.'}</p>
            
            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">🗺️</div>
                <div>
                  <h4>{language === 'fr' ? 'Itinéraires personnalisés' : 'Custom itineraries'}</h4>
                  <p>{language === 'fr' ? 'Des voyages conçus sur mesure' : 'Tailor-made trips'}</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">👥</div>
                <div>
                  <h4>{language === 'fr' ? 'Guides locaux passionnés' : 'Passionate local guides'}</h4>
                  <p>{language === 'fr' ? 'Des accompagnateurs experts' : 'Expert companions'}</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">❤️</div>
                <div>
                  <h4>{language === 'fr' ? 'Voyages responsables' : 'Responsible travel'}</h4>
                  <p>{language === 'fr' ? 'Un tourisme éthique' : 'Ethical tourism'}</p>
                </div>
              </div>
            </div>
            
            <div className="about-stats">
              <div className="stat"><span>10+</span><br />{language === 'fr' ? 'Années' : 'Years'}</div>
              <div className="stat"><span>5000+</span><br />{language === 'fr' ? 'Voyageurs' : 'Travelers'}</div>
              <div className="stat"><span>50+</span><br />{language === 'fr' ? 'Destinations' : 'Destinations'}</div>
            </div>
          </div>
          
          <div className="about-video" data-aos="fade-left">
            <div className="video-wrapper">
              <video 
                ref={videoRef}
                poster="logo.png"
                className="about-video-element"
                playsInline
              >
<source src="/videos/v.mp4" type="video/mp4" />                {language === 'fr' ? 'Votre navigateur ne supporte pas la vidéo.' : 'Your browser does not support the video tag.'}
              </video>
              
              {!isPlaying && (
                <div className="video-overlay">
                  <button className="video-play-btn" onClick={handlePlayVideo}>
                    <div className="play-icon"></div>
                  </button>
                </div>
              )}
              
              {!isPlaying && (
                <div className="video-badge">
                  <span>▶</span>
                  <span>{language === 'fr' ? 'Découvrez notre aventure' : 'Discover our adventure'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);
  const toursScrollRef = useRef(null);
  const { language, pick } = useLang();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-560126657.jpg?c=original" alt="Sahara" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content" data-aos="fade-up">
            <span className="hero-tag">ALGERIA TRAVEL</span>
            <h1 className="hero-title">{language === 'fr' ? 'Là où le Sahara' : 'Where the Sahara'} <br /><span className="text-accent">{language === 'fr' ? 'Rencontre la Mer' : 'Meets the Sea'}</span></h1>
            <p className="hero-description">{language === 'fr' ? 'Explorez des dunes dorées à perte de vue, des vestiges romains surplombant la Méditerranée et l\'accueil légendaire des oasis algériennes.' : 'Explore golden dunes as far as the eye can see, Roman ruins overlooking the Mediterranean, and the legendary hospitality of Algerian oases.'}</p>
            <button className="btn-primary">{language === 'fr' ? 'Découvrir nos Circuits' : 'Discover our Tours'} →</button>
          </div>
        </div>
      </section>

      {/* Circuits Section */}
      <section className="section-destinations">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{language === 'fr' ? 'NOS CIRCUITS' : 'OUR TOURS'}</span>
            <h2 className="section-title">{language === 'fr' ? 'Découvrez l\'Algérie' : 'Discover Algeria'} <span className="text-accent">{language === 'fr' ? 'autrement' : 'differently'}</span></h2>
            <p className="section-subtitle">{language === 'fr' ? 'Des circuits authentiques pour explorer les trésors cachés' : 'Authentic tours to explore hidden treasures'}</p>
          </div>
          
          <div className="scroll-wrapper">
            <button className="scroll-btn left" onClick={() => scrollTours('left')}>←</button>
            
            <div className="tours-grid" ref={toursScrollRef}>
              {FEATURED_TOURS.map((tour) => (
                <div
                  key={tour.id}
                  className={`tour-card-dest${flippedCard === tour.id ? " flipped" : ""}`}
                  onClick={() => setFlippedCard(flippedCard === tour.id ? null : tour.id)}
                >
                  <img src={tour.image} alt={tour.name} className="card-img" loading="lazy" />
                  <div className="card-overlay" />
                  <div className="card-rating">★ {tour.rating}</div>

                  <div className="card-base">
                    <span className="card-location">{tour.location}</span>
                    <h3 className="card-name">{language === 'fr' ? tour.name : tour.name_en}</h3>
                    <p className="card-subtitle">{language === 'fr' ? tour.subtitle : tour.subtitle_en}</p>
                    <div className="card-pills">
                      {tour.activities.slice(0, 2).map((a, i) => (
                        <span key={i} className="card-pill">{a}</span>
                      ))}
                    </div>
                  </div>

                  <div className="card-hover-panel">
                    <p className="panel-location">{tour.location}</p>
                    <h3 className="panel-name">{language === 'fr' ? tour.name : tour.name_en}</h3>
                    <p className="panel-subtitle">{language === 'fr' ? tour.subtitle : tour.subtitle_en}</p>
                    <p className="panel-desc">{language === 'fr' ? tour.description : tour.description_en}</p>

                    <div className="panel-info">
                      <div className="panel-info-item">
                        <span className="panel-label">{language === 'fr' ? 'Durée' : 'Duration'}</span>
                        <span className="panel-value">{language === 'fr' ? tour.duration : tour.duration_en}</span>
                      </div>
                      <div className="panel-info-item">
                        <span className="panel-label">{language === 'fr' ? 'Meilleure période' : 'Best time'}</span>
                        <span className="panel-value">{tour.bestTime}</span>
                      </div>
                      <div className="panel-info-item price-item">
                        <div className="panel-price">{tour.price.toLocaleString()} <span>DA</span></div>
                        <div className="panel-price-label">{language === 'fr' ? '/ personne' : '/ person'}</div>
                      </div>
                    </div>

                    <div className="panel-divider" />
                    
                    <div className="panel-itinerary">
                      {tour.itinerary.slice(0, 3).map((item, i) => (
                        <div key={i} className="panel-itin-row">
                          <div className="panel-day">{i + 1}</div>
                          <div>
                            <div className="panel-itin-title">{language === 'fr' ? item.title : item.title_en}</div>
                            <div className="panel-itin-desc">{language === 'fr' ? item.desc : item.desc_en}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="panel-actions">
                      <button className="btn-gold" onClick={(e) => { e.stopPropagation(); setSelectedTour(tour); }}>
                        {language === 'fr' ? 'Réserver' : 'Book'}
                      </button>
                      <button className="btn-outline" onClick={(e) => { e.stopPropagation(); setFlippedCard(null); }}>
                        {language === 'fr' ? 'Fermer' : 'Close'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="scroll-btn right" onClick={() => scrollTours('right')}>→</button>
          </div>
        </div>
      </section>

      <AboutSection language={language} />

      {selectedTour && (
        <DestinationModal 
          tour={selectedTour} 
          onClose={() => setSelectedTour(null)} 
          language={language}
        />
      )}

      {/* Témoignages */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{language === 'fr' ? 'TÉMOIGNAGES' : 'TESTIMONIALS'}</span>
            <h2 className="section-title">{language === 'fr' ? 'Ce que nos' : 'What our'} <span className="text-accent">{language === 'fr' ? 'voyageurs' : 'travelers'}</span> {language === 'fr' ? 'disent' : 'say'}</h2>
          </div>
          
          <div className="testimonials-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <div className="testimonial-card" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="quote">"</div>
                <div className="stars">{"★".repeat(testimonial.rating)}</div>
                <p className="testimonial-text">"{language === 'fr' ? testimonial.content : testimonial.content_en}"</p>
                <div className="testimonial-author">
                  <div className="avatar">{testimonial.name.charAt(0)}</div>
                  <div>
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
      <section className="newsletter-section">
        <div className="container">
          <Contact />
        </div>
      </section>

      <Footer />
      
      {showBackToTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑
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
          --dark: #111;
          --gray: #666;
          --light: #f5f5f5;
          --white: #fff;
        }

        body {
          font-family: 'Segoe UI', Roboto, sans-serif;
          color: var(--dark);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section-badge {
          display: inline-block;
          font-size: 12px;
          letter-spacing: 2px;
          color: var(--accent);
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: var(--gray);
        }

        .text-accent {
          color: var(--accent);
        }

        /* Hero */
        .hero {
          position: relative;
          height: 100vh;
          min-height: 600px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
        }

        .hero-container {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .hero-content {
          max-width: 700px;
          padding: 0 20px;
          margin-left: 10%;
          color: var(--white);
        }

        .hero-tag {
          font-size: 14px;
          letter-spacing: 3px;
          color: var(--accent);
          margin-bottom: 20px;
          display: inline-block;
        }

        .hero-title {
          font-size: 3.5rem;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.1rem;
          margin-bottom: 32px;
          opacity: 0.9;
        }

        .btn-primary {
          background: var(--accent);
          color: var(--white);
          padding: 14px 32px;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background: var(--accent-dark);
          transform: translateY(-2px);
        }

        /* Section Destinations */
        .section-destinations {
          padding: 80px 0;
          background: #f5f0e8;
        }

        .section-destinations .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-destinations .section-title {
          color: #0f0d0a;
        }

        /* Scroll wrapper */
        .scroll-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .scroll-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--white);
          border: 1px solid #ddd;
          cursor: pointer;
          font-size: 20px;
          flex-shrink: 0;
          transition: all 0.3s;
        }

        .scroll-btn:hover {
          background: var(--accent);
          color: var(--white);
          border-color: var(--accent);
        }

        .tours-grid {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 8px 4px 24px;
          flex: 1;
        }

        .tours-grid::-webkit-scrollbar {
          height: 4px;
        }

        .tours-grid::-webkit-scrollbar-track {
          background: #e0e0e0;
          border-radius: 4px;
        }

        .tours-grid::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 4px;
        }

        /* CARD STYLE */
        .tour-card-dest {
          position: relative;
          min-width: 320px;
          max-width: 320px;
          aspect-ratio: 3/4;
          overflow: hidden;
          cursor: pointer;
          background: #1c1a17;
          border-radius: 16px;
          flex-shrink: 0;
          transition: transform 0.3s;
        }

        .tour-card-dest:hover {
          transform: translateY(-8px);
        }

        .card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .tour-card-dest:hover .card-img {
          transform: scale(1.06);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
        }

        .card-rating {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: var(--accent);
          z-index: 2;
        }

        .card-base {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          z-index: 2;
          transition: transform 0.3s;
        }

        .tour-card-dest:hover .card-base {
          transform: translateY(-8px);
        }

        .card-location {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
          display: block;
          margin-bottom: 6px;
        }

        .card-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 4px;
        }

        .card-subtitle {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          font-style: italic;
          margin-bottom: 12px;
        }

        .card-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .card-pill {
          font-size: 10px;
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          color: rgba(255,255,255,0.7);
        }

        .card-hover-panel {
          position: absolute;
          inset: 0;
          background: rgba(15,13,10,0.95);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px;
          z-index: 3;
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.35s ease;
          pointer-events: none;
        }

        .tour-card-dest.flipped .card-hover-panel,
        .tour-card-dest:hover .card-hover-panel {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .panel-location {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 6px;
        }

        .panel-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 4px;
        }

        .panel-subtitle {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          font-style: italic;
          margin-bottom: 16px;
        }

        .panel-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .panel-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .panel-info-item {
          text-align: left;
        }

        .panel-label {
          font-size: 9px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          display: block;
        }

        .panel-value {
          font-size: 12px;
          color: var(--white);
          font-weight: 500;
        }

        .price-item {
          text-align: right;
        }

        .panel-price {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent);
        }

        .panel-price span {
          font-size: 12px;
        }

        .panel-price-label {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
        }

        .panel-divider {
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin-bottom: 16px;
        }

        .panel-itinerary {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
          max-height: 100px;
          overflow-y: auto;
        }

        .panel-itinerary::-webkit-scrollbar {
          width: 2px;
        }

        .panel-itinerary::-webkit-scrollbar-thumb {
          background: var(--accent);
        }

        .panel-itin-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .panel-day {
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(212,168,83,0.15);
          border: 1px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: var(--accent);
          font-weight: 600;
        }

        .panel-itin-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--white);
        }

        .panel-itin-desc {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
        }

        .panel-actions {
          display: flex;
          gap: 10px;
        }

        .btn-gold {
          flex: 1;
          background: var(--accent);
          border: none;
          padding: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #0f0d0a;
          cursor: pointer;
          border-radius: 30px;
          transition: all 0.2s;
        }

        .btn-gold:hover {
          background: var(--accent-dark);
        }

        .btn-outline {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 10px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          border-radius: 30px;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* About Section */
        .about-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
        }

        .about-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .about-content h2 {
          font-size: 2rem;
          margin-bottom: 20px;
        }

        .about-content > p {
          color: var(--gray);
          line-height: 1.8;
          margin-bottom: 30px;
        }

        .feature {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .feature-icon {
          font-size: 28px;
        }

        .feature h4 {
          margin-bottom: 5px;
        }

        .feature p {
          font-size: 13px;
          color: var(--gray);
        }

        .about-stats {
          display: flex;
          gap: 40px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          flex-wrap: wrap;
        }

        .about-stats .stat span {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--accent);
        }

        /* VIDEO STYLES - CORRIGÉS */
        .video-wrapper {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          aspect-ratio: 16/9;
          background: #000;
          cursor: pointer;
        }

        .about-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .video-overlay:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .video-play-btn {
          width: 90px;
          height: 90px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .video-play-btn:hover {
          transform: scale(1.1);
          background: rgba(0, 0, 0, 0.8);
        }

        .play-icon {
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 18px 0 18px 32px;
          border-color: transparent transparent transparent white;
          margin-left: 8px;
        }

        .video-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          pointer-events: none;
        }

        .video-badge span:first-child {
          background: var(--accent);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        /* Testimonials */
        .testimonials {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .testimonial-card {
          background: var(--white);
          border-radius: 20px;
          padding: 30px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .quote {
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 60px;
          color: var(--accent);
          opacity: 0.2;
        }

        .stars {
          color: #ffc107;
          margin-bottom: 20px;
        }

        .testimonial-text {
          font-style: italic;
          color: var(--gray);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .testimonial-author h4 {
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .testimonial-author span {
          font-size: 12px;
          color: var(--gray);
        }

        .newsletter-section {
          padding: 80px 0;
          background: var(--light);
        }

        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 20px;
          z-index: 100;
        }

        .back-to-top:hover {
          background: var(--accent-dark);
          transform: translateY(-3px);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.85);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-container {
          background: white;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          border-radius: 24px;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: none;
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
        }

        .modal-image {
          height: 250px;
          overflow: hidden;
        }

        .modal-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-content {
          padding: 24px;
        }

        .modal-content h2 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 12px;
        }

        .modal-rating {
          margin-bottom: 16px;
          color: var(--gray);
        }

        .modal-rating span {
          color: #ffc107;
        }

        .modal-info {
          display: flex;
          gap: 24px;
          padding: 16px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .modal-price {
          margin: 20px 0;
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }

        .modal-price .current {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent);
        }

        .modal-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-reserver, .btn-contact {
          padding: 12px 28px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-reserver {
          background: var(--accent);
          color: white;
          border: none;
        }

        .btn-contact {
          background: transparent;
          border: 2px solid var(--accent);
          color: var(--accent);
        }

        /* RESPONSIVE */
        @media (max-width: 1200px) {
          .container { padding: 0 20px; }
          .tour-card-dest { min-width: 300px; max-width: 300px; }
          .testimonials-grid { gap: 20px; }
        }

        @media (max-width: 992px) {
          .hero-title { font-size: 3rem; }
          .hero-content { margin-left: 5%; }
          .section-title { font-size: 2.2rem; }
          .tour-card-dest { min-width: 280px; max-width: 280px; }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .about-grid { gap: 40px; }
          .about-stats { gap: 25px; }
          .video-play-btn { width: 70px; height: 70px; }
          .play-icon { border-width: 14px 0 14px 24px; }
        }

        @media (max-width: 768px) {
          .container { padding: 0 16px; }
          .hero { min-height: 100vh; }
          .hero-content { margin-left: 0; text-align: center; padding: 0 16px; }
          .hero-title { font-size: 2.2rem; }
          .hero-description { font-size: 0.95rem; }
          .hero-buttons { justify-content: center; }
          .scroll-btn { display: none; }
          .scroll-wrapper { gap: 0; }
          .tour-card-dest { min-width: 260px; max-width: 260px; }
          .section { padding: 60px 0; }
          .section-title { font-size: 1.75rem; }
          .testimonials-grid { grid-template-columns: 1fr; gap: 20px; }
          .testimonial-card { padding: 25px; }
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .about-stats { flex-wrap: wrap; justify-content: center; gap: 20px; }
          .about-stats .stat { flex: 1; min-width: 80px; text-align: center; }
          .about-stats .stat span { font-size: 1.5rem; }
          .about-content h2 { font-size: 1.6rem; }
          .modal-info { gap: 16px; }
          .modal-actions { flex-direction: column; }
          .btn-reserver, .btn-contact { text-align: center; width: 100%; }
          .modal-price .current { font-size: 1.5rem; }
          .video-play-btn { width: 60px; height: 60px; }
          .play-icon { border-width: 12px 0 12px 20px; }
          .video-badge { font-size: 11px; padding: 5px 12px; bottom: 12px; left: 12px; }
        }

        @media (max-width: 576px) {
          .hero-title { font-size: 1.8rem; }
          .hero-tag { font-size: 11px; }
          .hero-description { font-size: 0.85rem; }
          .btn-primary { padding: 12px 24px; font-size: 13px; }
          .section-title { font-size: 1.5rem; }
          .section-subtitle { font-size: 0.9rem; }
          .tour-card-dest { min-width: 100%; max-width: 100%; aspect-ratio: 4/3; }
          .card-name { font-size: 1.1rem; }
          .panel-name { font-size: 1.1rem; }
          .panel-price { font-size: 18px; }
          .feature { flex-direction: column; align-items: center; text-align: center; }
          .about-stats .stat span { font-size: 1.3rem; }
          .testimonial-text { font-size: 0.9rem; }
          .modal-content { padding: 16px; }
          .modal-info { gap: 12px; font-size: 12px; }
          .video-play-btn { width: 50px; height: 50px; }
          .play-icon { border-width: 10px 0 10px 16px; }
          .video-badge { font-size: 10px; padding: 4px 10px; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 1.5rem; }
          .hero-tag { font-size: 10px; }
          .btn-primary { padding: 10px 20px; font-size: 12px; }
          .section-title { font-size: 1.3rem; }
          .card-base { padding: 16px; }
          .card-subtitle { font-size: 10px; }
          .card-pill { font-size: 8px; padding: 3px 8px; }
          .panel-info { flex-direction: column; align-items: flex-start; }
          .price-item { text-align: left; width: 100%; }
          .panel-itin-title { font-size: 10px; }
          .panel-itin-desc { font-size: 9px; }
          .btn-gold, .btn-outline { padding: 8px; font-size: 10px; }
        }
      `}</style>
    </>
  );
};

export default Home;