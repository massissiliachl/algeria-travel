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
    name: "Timimoun la Rouge",
    name_en: "Timimoun the Red",
    tagline: "Perle du Sahara",
    tagline_en: "Pearl of the Sahara",
    description: "Découvrez les dunes rouges de Timimoun, les ksour traditionnels et les couchers de soleil magiques du Grand Erg Occidental.",
    description_en: "Discover the red dunes of Timimoun, traditional ksour and magical sunsets of the Great Western Erg.",
    fullDescription: "Timimoun, surnommée la rouge, est une ville oasis située au cœur du Sahara algérien. Ses dunes de sable rouge offrent des paysages à couper le souffle, particulièrement au coucher du soleil. Les ksour traditionnels, construits en terre battue, témoignent d'une architecture ancestrale unique. Le Grand Erg Occidental, mer de dunes s'étendant à perte de vue, est un paradis pour les amoureux de désert et de photographie. Les habitants, accueillants et fiers de leur culture, vous feront découvrir leurs traditions, leur artisanat et leur cuisine locale.",
    fullDescription_en: "Timimoun, nicknamed the red, is an oasis town located in the heart of the Algerian Sahara. Its red sand dunes offer breathtaking landscapes, especially at sunset. The traditional ksour, built in rammed earth, bear witness to unique ancestral architecture. The Great Western Erg, a sea of dunes stretching as far as the eye can see, is a paradise for desert lovers and photographers.",
    duration: "5 jours",
    duration_en: "5 days",
    price: 45000,
    oldPrice: 55000,
    rating: 4.9,
    reviews: 234,
    image: "image.png",
    badge: "POPULAIRE",
    badge_en: "POPULAR",
    gallery: ["image.png", "image.png", "image.png"],
    included: ["Transport aller-retour", "Hébergement 4 nuits", "Petit-déjeuner inclus", "Guide local", "Activités incluses"],
    notIncluded: ["Vols internationaux", "Déjeuners et dîners", "Assurance voyage", "Pourboires"]
  },
  {
    id: 2,
    name: "Le Tassili n'Ajjer",
    name_en: "Tassili n'Ajjer",
    tagline: "Patrimoine mondial UNESCO",
    tagline_en: "UNESCO World Heritage",
    description: "Explorez les célèbres gravures rupestres, les arches rocheuses et les paysages lunaires de Djanet.",
    description_en: "Explore the famous rock engravings, rock arches and lunar landscapes of Djanet.",
    fullDescription: "Le Tassili n'Ajjer est l'un des sites les plus extraordinaires au monde. Classé au patrimoine mondial de l'UNESCO, ce plateau rocheux abrite l'une des plus importantes collections d'art rupestre au monde, avec plus de 15 000 gravures et peintures datant de 10 000 ans. Les formations géologiques, véritables forêts de pierre, créent des paysages lunaires uniques. Les arches rocheuses naturelles, dont la célèbre Arche du Tassili, sont des merveilles à ne pas manquer.",
    fullDescription_en: "Tassili n'Ajjer is one of the most extraordinary sites in the world. A UNESCO World Heritage site, this rocky plateau houses one of the most important collections of rock art in the world, with over 15,000 engravings and paintings dating back 10,000 years.",
    duration: "8 jours",
    duration_en: "8 days",
    price: 85000,
    rating: 5.0,
    reviews: 178,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0QfJHCzON4Am5ZZ6OP5mnPLiQhwdDiGUH4A&s",
    badge: "INCONTOURNABLE",
    badge_en: "MUST-SEE",
    gallery: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0QfJHCzON4Am5ZZ6OP5mnPLiQhwdDiGUH4A&s"],
    included: ["Transport", "Guide expert", "Hébergement", "Repas", "Entrée site"],
    notIncluded: ["Vols", "Boissons", "Dépenses personnelles"]
  },
  {
    id: 3,
    name: "Ghardaïa & la Vallée du M'Zab",
    name_en: "Ghardaïa & M'Zab Valley",
    tagline: "Architecture unique",
    tagline_en: "Unique architecture",
    description: "Partez à la découverte des cités millénaires du M'Zab et de leur patrimoine exceptionnel.",
    description_en: "Discover the millennia-old cities of M'Zab and their exceptional heritage.",
    fullDescription: "La vallée du M'Zab est un chef-d'œuvre d'architecture adaptée à l'environnement désertique. Les cinq ksour (villes fortifiées) qui la composent ont été fondés au XIe siècle par les Mozabites. Leur architecture simple mais ingénieuse, avec des maisons cubiques blanchies à la chaux, a inspiré de nombreux architectes modernes, dont Le Corbusier. Le patrimoine culturel et religieux unique de cette région ibadite en fait un lieu fascinant à découvrir.",
    fullDescription_en: "The M'Zab valley is a masterpiece of architecture adapted to the desert environment. The five ksour (fortified cities) that compose it were founded in the 11th century by the Mozabites.",
    duration: "4 jours",
    duration_en: "4 days",
    price: 35000,
    rating: 4.8,
    reviews: 312,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDSh2ht0MFpFw7A-9DBTpYxbY7nGlw_Hn6Qw&s",
    badge: "CULTURE",
    badge_en: "CULTURE",
    gallery: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDSh2ht0MFpFw7A-9DBTpYxbY7nGlw_Hn6Qw&s"],
    included: ["Visite guidée", "Transport", "Hébergement", "Petit-déjeuner"],
    notIncluded: ["Déjeuner", "Dîner", "Billets d'avion"]
  },
  {
    id: 4,
    name: "Les Merveilles de Béjaïa",
    name_en: "The Wonders of Béjaïa",
    tagline: "Mer & Montagne",
    tagline_en: "Sea & Mountain",
    description: "Cap Carbon, les Aiguades, les grottes d'Aokas et les magnifiques plages de la côte béjaouie.",
    description_en: "Cap Carbon, Les Aiguades, the caves of Aokas and the magnificent beaches of the Béjaïa coast.",
    fullDescription: "Béjaïa, surnommée la ville aux deux visages, offre un cadre naturel exceptionnel où la mer Méditerranée rencontre les montagnes du Djurdjura. Le Cap Carbon offre une vue panoramique à couper le souffle sur la baie. Les grottes d'Aokas, véritables cathédrales souterraines, vous émerveilleront par leurs concrétions minérales. Les plages de sable fin, comme la plage des Aiguades, sont des havres de paix pour se détendre après une journée de randonnée.",
    fullDescription_en: "Béjaïa, nicknamed the city with two faces, offers an exceptional natural setting where the Mediterranean Sea meets the Djurdjura mountains.",
    duration: "3 jours",
    duration_en: "3 days",
    price: 25000,
    rating: 4.9,
    reviews: 290,
    image: "https://dia-algerie.com/wp-content/uploads/2021/03/cap-carbon.jpg",
    badge: "COUP DE CŒUR",
    badge_en: "FAVORITE",
    gallery: ["https://dia-algerie.com/wp-content/uploads/2021/03/cap-carbon.jpg"],
    included: ["Hébergement", "Petit-déjeuner", "Excursions", "Guide"],
    notIncluded: ["Déjeuner", "Dîner", "Transport personnel"]
  },
  {
    id: 5,
    name: "Le Hoggar & Assekrem",
    name_en: "Hoggar & Assekrem",
    tagline: "Au cœur du désert",
    tagline_en: "Heart of the desert",
    description: "Vivez une aventure inoubliable dans les montagnes du Hoggar et admirez le lever du soleil à Assekrem.",
    description_en: "Experience an unforgettable adventure in the Hoggar mountains and watch the sunrise at Assekrem.",
    fullDescription: "Le Hoggar est un massif montagneux d'origine volcanique situé au cœur du Sahara. Ses paysages lunaires, ses pics spectaculaires et ses plateaux rocheux attirent les aventuriers du monde entier. L'Assekrem, à 2 800 m d'altitude, offre l'un des plus beaux levers de soleil au monde. C'est ici que le Père Charles de Foucauld a vécu en ermite. Les gravures rupestres et les tombeaux préhistoriques témoignent d'une occupation humaine très ancienne.",
    fullDescription_en: "The Hoggar is a volcanic mountain range located in the heart of the Sahara. Its lunar landscapes, spectacular peaks and rocky plateaus attract adventurers from around the world.",
    duration: "9 jours",
    duration_en: "9 days",
    price: 95000,
    rating: 5.0,
    reviews: 167,
    image: "https://www.mosaicnorthafrica.com/wp-content/uploads/2017/01/view-from-assekrem-plateau-in-ahaggar-national-park.jpg",
    badge: "EXPERT",
    badge_en: "EXPERT",
    gallery: ["https://www.mosaicnorthafrica.com/wp-content/uploads/2017/01/view-from-assekrem-plateau-in-ahaggar-national-park.jpg"],
    included: ["4x4", "Guide expérimenté", "Camping complet", "Repas", "Eau"],
    notIncluded: ["Vols", "Équipement personnel", "Assurance"]
  },
  {
    id: 6,
    name: "Constantine la Suspendue",
    name_en: "Constantine the Hanging",
    tagline: "Ville des ponts",
    tagline_en: "City of bridges",
    description: "Découvrez les ponts suspendus, le palais Ahmed Bey et l'histoire fascinante de Constantine.",
    description_en: "Discover the suspended bridges, the Ahmed Bey palace and the fascinating history of Constantine.",
    fullDescription: "Constantine, perchée sur un rocher vertigineux entaillé par les gorges du Rhummel, est l'une des villes les plus impressionnantes d'Afrique. Ses ponts suspendus, dont le célèbre pont Sidi M'Cid, offrent des vues spectaculaires sur les gorges. Le palais d'Ahmed Bey, magnifique exemple d'architecture ottomane, témoigne de la riche histoire de la ville. La médina, avec ses ruelles étroites et ses maisons traditionnelles, mérite une visite approfondie.",
    fullDescription_en: "Constantine, perched on a dizzying rock carved by the Rhummel gorges, is one of the most impressive cities in Africa.",
    duration: "3 jours",
    duration_en: "3 days",
    price: 22000,
    rating: 4.7,
    reviews: 145,
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/5b/31/eb/caption.jpg?w=1200&h=-1&s=1",
    badge: "HISTOIRE",
    badge_en: "HISTORY",
    gallery: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/5b/31/eb/caption.jpg?w=1200&h=-1&s=1"],
    included: ["Visite guidée", "Transport local", "Entrée sites"],
    notIncluded: ["Hébergement", "Repas", "Vols"]
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
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="modal-image">
          <img src={tour.image} alt={tour.name} />
          <div className="modal-badge">{language === 'fr' ? tour.badge : tour.badge_en}</div>
        </div>
        
        <div className="modal-content">
          <h2 className="modal-title">{language === 'fr' ? tour.name : tour.name_en}</h2>
          <p className="modal-tagline">{language === 'fr' ? tour.tagline : tour.tagline_en}</p>
          
          <div className="modal-rating">
            <span className="stars">{"★".repeat(Math.floor(tour.rating))}</span>
            <span>({tour.reviews} avis)</span>
          </div>
          
          <div className="modal-info-grid">
            <div className="info-item">
              <i className="far fa-clock"></i>
              <span>{language === 'fr' ? tour.duration : tour.duration_en}</span>
            </div>
            <div className="info-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Algérie</span>
            </div>
            <div className="info-item">
              <i className="fas fa-tag"></i>
              <span>{language === 'fr' ? tour.badge : tour.badge_en}</span>
            </div>
          </div>
          
          <div className="modal-description">
            <h3>Description</h3>
            <p>{language === 'fr' ? tour.fullDescription || tour.description : tour.fullDescription_en || tour.description_en}</p>
          </div>
          
          <div className="modal-inclusions">
            <div className="inclusion">
              <h3><i className="fas fa-check-circle"></i> Inclus</h3>
              <ul>
                {tour.included.map((item, index) => (
                  <li key={index}><i className="fas fa-check"></i> {item}</li>
                ))}
              </ul>
            </div>
            <div className="exclusion">
              <h3><i className="fas fa-times-circle"></i> Non inclus</h3>
              <ul>
                {tour.notIncluded.map((item, index) => (
                  <li key={index}><i className="fas fa-times"></i> {item}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="modal-price-section">
            <div className="price-info">
              {tour.oldPrice && <span className="old-price">{tour.oldPrice}€</span>}
              <span className="current-price">{tour.price.toLocaleString()} DA</span>
              <span className="per-person">/ personne</span>
            </div>
            <div className="modal-actions">
              <button className="btn-reserver">Réserver maintenant</button>
              <button className="btn-contact">Contacter un conseiller</button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-container {
          background: white;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 24px;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .modal-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .modal-container::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 4px;
        }
        
        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        
        .modal-close:hover {
          background: var(--accent);
          color: white;
          transform: rotate(90deg);
        }
        
        .modal-image {
          position: relative;
          height: 300px;
          overflow: hidden;
        }
        
        .modal-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .modal-badge {
          position: absolute;
          top: 20px;
          left: 20px;
          background: var(--accent);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .modal-content {
          padding: 30px;
        }
        
        .modal-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--dark);
        }
        
        .modal-tagline {
          font-size: 14px;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .modal-rating {
          margin-bottom: 20px;
        }
        
        .modal-rating .stars {
          color: #ffc107;
          margin-right: 8px;
        }
        
        .modal-info-grid {
          display: flex;
          gap: 30px;
          padding: 20px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
        }
        
        .modal-description h3 {
          font-size: 1.2rem;
          margin-bottom: 15px;
          color: var(--dark);
        }
        
        .modal-description p {
          line-height: 1.8;
          color: var(--gray);
          margin-bottom: 25px;
        }
        
        .modal-inclusions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          padding: 20px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
          margin-bottom: 25px;
        }
        
        .inclusion h3, .exclusion h3 {
          font-size: 1rem;
          margin-bottom: 15px;
        }
        
        .inclusion h3 i {
          color: #28a745;
          margin-right: 8px;
        }
        
        .exclusion h3 i {
          color: #dc3545;
          margin-right: 8px;
        }
        
        .inclusion ul, .exclusion ul {
          list-style: none;
          padding: 0;
        }
        
        .inclusion li, .exclusion li {
          padding: 6px 0;
          font-size: 14px;
          color: var(--gray);
        }
        
        .inclusion li i {
          color: #28a745;
          margin-right: 10px;
          font-size: 12px;
        }
        
        .exclusion li i {
          color: #dc3545;
          margin-right: 10px;
          font-size: 12px;
        }
        
        .modal-price-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .price-info {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        
        .current-price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent);
        }
        
        .old-price {
          font-size: 1rem;
          color: var(--gray);
          text-decoration: line-through;
        }
        
        .per-person {
          font-size: 14px;
          color: var(--gray);
        }
        
        .modal-actions {
          display: flex;
          gap: 15px;
        }
        
        .btn-reserver {
          background: var(--accent);
          color: white;
          padding: 12px 28px;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-reserver:hover {
          background: var(--accent-dark);
          transform: translateY(-2px);
        }
        
        .btn-contact {
          background: transparent;
          color: var(--accent);
          padding: 12px 28px;
          border: 2px solid var(--accent);
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-contact:hover {
          background: var(--accent);
          color: white;
        }
        
        @media (max-width: 768px) {
          .modal-content {
            padding: 20px;
          }
          
          .modal-title {
            font-size: 1.4rem;
          }
          
          .modal-inclusions {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .modal-price-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .btn-reserver, .btn-contact {
            text-align: center;
          }
          
          .modal-image {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

// Composant AboutSection
const AboutSection = () => {
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
          {/* Partie gauche - Texte */}
          <div className="about-content" data-aos="fade-right">
            <span className="section-badge">QUI SOMMES-NOUS</span>
            <h2 className="about-title">
              Votre expert voyage <span className="text-accent">en Algérie</span>
            </h2>
            <p className="about-description">
              Avec plus de 10 ans d'expérience, Algeria Travel est votre partenaire de confiance pour découvrir 
              les merveilles de l'Algérie. Des dunes du Sahara aux villes côtières méditerranéennes, 
              nous créons des voyages sur mesure qui répondent à toutes vos envies.
            </p>
            
            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-map-marked-alt"></i>
                </div>
                <div className="feature-text">
                  <h4>Itinéraires personnalisés</h4>
                  <p>Des voyages conçus sur mesure selon vos envies et votre budget</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="feature-text">
                  <h4>Guides locaux passionnés</h4>
                  <p>Des accompagnateurs qui connaissent les moindres recoins du pays</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-hand-holding-heart"></i>
                </div>
                <div className="feature-text">
                  <h4>Voyages responsables</h4>
                  <p>Un tourisme éthique qui respecte l'environnement et les populations</p>
                </div>
              </div>
            </div>
            
            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">10+</span>
                <span className="stat-label">Années d'expérience</span>
              </div>
              <div className="stat">
                <span className="stat-number">5000+</span>
                <span className="stat-label">Voyageurs satisfaits</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Destinations</span>
              </div>
            </div>
            
            <button className="about-btn">
              En savoir plus <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          
          {/* Partie droite - Vidéo */}
          <div className="about-video" data-aos="fade-left">
            <div className="video-wrapper">
              <video 
                ref={videoRef}
                poster="logo.png"
                className="about-video-element"
              >
                <source src="v.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la vidéo.
              </video>
              
              <div className="video-overlay">
              <button className="video-play-btn" onClick={handlePlayVideo}>
  {!isPlaying ? (
    <div className="play-icon"></div>
  ) : (
    <i className="fas fa-pause"></i>
  )}
</button>
              </div>
              
              <div className="video-badge">
                <i className="fas fa-play-circle"></i>
                <span>Découvrez notre aventure</span>
              </div>
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
      
      {/* Hero Section */}
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

      {/* Circuits Section - Cartes cliquables */}
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
                <div 
                  className="tour-card" 
                  key={tour.id} 
                  onClick={() => setSelectedTour(tour)}
                  style={{ cursor: 'pointer' }}
                >
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
                        {tour.oldPrice && <span className="old-price">{tour.oldPrice}DA</span>}
                        <span className="current-price">{tour.price}DA</span>
                      </div>
                      <button 
                        className="btn-outline-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTour(tour);
                        }}
                      >
                        {t('btn_reserver')}
                      </button>
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

      {/* SECTION À PROPOS - Texte à gauche, Vidéo à droite */}
      <AboutSection />

      {/* Modal des détails */}
      {selectedTour && (
        <DestinationModal 
          tour={selectedTour} 
          onClose={() => setSelectedTour(null)} 
          language={language}
        />
      )}

      {/* Témoignages */}
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
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          flex-shrink: 0;
          cursor: pointer;
        }

        .tour-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
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
          transition: transform 0.5s ease;
        }

        .tour-card:hover .tour-image img {
          transform: scale(1.05);
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

        /* About Section Styles */
        .about-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
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
        
        .about-title {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--dark);
          line-height: 1.3;
        }
        
        .about-description {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--gray);
          margin-bottom: 30px;
        }
        
        .about-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .feature-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }
        
        .feature-icon {
          width: 50px;
          height: 50px;
          background: rgba(198, 164, 59, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .feature-icon i {
          font-size: 24px;
          color: var(--accent);
        }
        
        .feature-text h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 5px;
          color: var(--dark);
        }
        
        .feature-text p {
          font-size: 14px;
          color: var(--gray);
          line-height: 1.5;
        }
        
        .about-stats {
          display: flex;
          gap: 40px;
          margin-bottom: 30px;
          padding: 20px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent);
        }
        
        .stat-label {
          font-size: 12px;
          color: var(--gray);
        }
        
        .about-btn {
          background: var(--accent);
          color: white;
          padding: 12px 32px;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        
        .about-btn:hover {
          background: var(--accent-dark);
          gap: 15px;
          transform: translateY(-2px);
        }
        
        .video-wrapper {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .about-video-element {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
        }
        
        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }
        
        .video-overlay:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        
       .video-play-btn {
  width: 80px;
  height: 80px;
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
  border-width: 15px 0 15px 25px;
  border-color: transparent transparent transparent white;
  margin-left: 5px;
}

.video-play-btn i {
  font-size: 32px;
  color: white;
}

@media (max-width: 768px) {
  .video-play-btn {
    width: 60px;
    height: 60px;
  }
  .play-icon {
    border-width: 12px 0 12px 20px;
  }
}

@media (max-width: 480px) {
  .video-play-btn {
    width: 50px;
    height: 50px;
  }
  .play-icon {
    border-width: 10px 0 10px 16px;
  }
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
          gap: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
        }
        
        .video-badge i {
          color: var(--accent);
          font-size: 18px;
        }

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

        .section-newsletter {
          padding: 80px 0;
          background: var(--light-gray);
        }

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
          .about-title { font-size: 1.8rem; }
          .about-stats { gap: 25px; }
        }

        @media (max-width: 968px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .about-content { order: 1; }
          .about-video { order: 2; }
          .about-title { font-size: 1.6rem; }
          .about-description { font-size: 0.95rem; }
          .about-stats { justify-content: center; }
          .about-video-element { height: 350px; }
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
          
          .about-section { padding: 60px 0; }
          .about-container { padding: 0 16px; }
          .about-title { font-size: 1.4rem; }
          .about-stats { flex-wrap: wrap; gap: 20px; }
          .stat { flex: 1; min-width: 80px; }
          .stat-number { font-size: 1.5rem; }
          .about-video-element { height: 280px; }
          .video-play-btn { width: 60px; height: 60px; }
          .video-play-btn i { font-size: 24px; }
          .about-btn { width: 100%; justify-content: center; }
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
          .about-title { font-size: 1.3rem; }
          .feature-text h4 { font-size: 1rem; }
          .feature-text p { font-size: 12px; }
          .about-video-element { height: 220px; }
          .video-play-btn { width: 50px; height: 50px; }
          .video-play-btn i { font-size: 20px; }
        }
      `}</style>
    </>
  );
};

export default Home;