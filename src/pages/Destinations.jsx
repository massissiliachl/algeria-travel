import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLang } from '../hooks/useLangHook';

const destinations = [
  {
    id: 1,
    name: "Timgad",
    name_fr: "Timgad",
    name_en: "Timgad",
    subtitle: "The Pompeii of Africa",
    subtitle_fr: "La Pompéi de l'Afrique",
    subtitle_en: "The Pompeii of Africa",
    description: "UNESCO-listed Roman ruins among the best preserved in North Africa.",
    description_fr: "Ruines romaines classées à l'UNESCO parmi les mieux préservées d'Afrique du Nord.",
    description_en: "UNESCO-listed Roman ruins among the best preserved in North Africa.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHaUG1Z_ZV2gwi8RAX55XRmHI3fqbAziuyrg&s",
    location: "Batna, Aurès",
    bestTime: "Mar – May / Sep – Nov",
    bestTime_fr: "Mars – Mai / Sep – Nov",
    bestTime_en: "Mar – May / Sep – Nov",
    duration: "4 days",
    duration_fr: "4 jours",
    duration_en: "4 days",
    price: "45,000",
    rating: 4.8,
    category: "culture",
    activities: ["🏛️ Antique site", "📜 Mosaics", "🚶 Hiking"],
    activities_fr: ["🏛️ Site antique", "📜 Mosai͏̈ques", "🚶 Randonnée"],
    itinerary: [
      { day: 1, title: "Arrival in Batna", title_fr: "Arrivée à Batna", desc: "Welcome and check-in", desc_fr: "Accueil et installation" },
      { day: 2, title: "Timgad", title_fr: "Timgad", desc: "Full tour of the Roman site", desc_fr: "Visite complète du site romain" },
      { day: 3, title: "Exploration", title_fr: "Exploration", desc: "Baths and forum", desc_fr: "Thermes et forum" },
      { day: 4, title: "Departure", title_fr: "Départ", desc: "Airport transfer", desc_fr: "Transfert aéroport" },
    ],
  },
  {
    id: 2,
    name: "Timimoun",
    name_fr: "Timimoun",
    name_en: "Timimoun",
    subtitle: "The Red Oasis",
    subtitle_fr: "L'Oasis Rouge",
    subtitle_en: "The Red Oasis",
    description: "Red-earth ksour perched on Sahara dunes. A truly unique spectacle.",
    description_fr: "Ksour en terre rouge perchés sur les dunes du Sahara. Un spectacle unique.",
    description_en: "Red-earth ksour perched on Sahara dunes. A truly unique spectacle.",
    image: "https://elwatan.dz/wp-content/uploads/storage/43970/TIMIMOUN.jpg",
    location: "Gourara, Grand Sud",
    bestTime: "October – April",
    bestTime_fr: "Octobre – Avril",
    bestTime_en: "October – April",
    duration: "5 days",
    duration_fr: "5 jours",
    duration_en: "5 days",
    price: "35,000",
    rating: 4.9,
    category: "desert",
    activities: ["🏜️ Dunes", "🕌 Ksour", "🌅 Sunset"],
    activities_fr: ["🏜️ Dunes", "🕌 Ksour", "🌅 Coucher de soleil"],
    itinerary: [
      { day: 1, title: "Arrival", title_fr: "Arrivée", desc: "Welcome and mint tea", desc_fr: "Accueil et thé à la menthe" },
      { day: 2, title: "Ksour", title_fr: "Ksour", desc: "Discover the red villages", desc_fr: "Découverte des villages rouges" },
      { day: 3, title: "Dunes", title_fr: "Dunes", desc: "Trek and sunset", desc_fr: "Trek et coucher de soleil" },
      { day: 4, title: "Crafts", title_fr: "Artisanat", desc: "Pottery workshop", desc_fr: "Atelier poterie" },
      { day: 5, title: "Departure", title_fr: "Départ", desc: "Airport transfer", desc_fr: "Transfert aéroport" },
    ],
  },
  {
    id: 3,
    name: "Tassili n'Ajjer",
    name_fr: "Tassili n'Ajjer",
    name_en: "Tassili n'Ajjer",
    subtitle: "The Open-Air Museum",
    subtitle_fr: "Le Musée à Ciel Ouvert",
    subtitle_en: "The Open-Air Museum",
    description: "Prehistoric rock art and UNESCO-listed lunar landscapes in the deep Sahara.",
    description_fr: "Art rupestre préhistorique et paysages lunaires classés à l'UNESCO dans le Grand Sud.",
    description_en: "Prehistoric rock art and UNESCO-listed lunar landscapes in the deep Sahara.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx0zN9XuJEhMuuosMwDbWxfkCyikBakJBMIQ&s",
    location: "Djanet, Sahara",
    bestTime: "November – February",
    bestTime_fr: "Novembre – Février",
    bestTime_en: "November – February",
    duration: "7 days",
    duration_fr: "7 jours",
    duration_en: "7 days",
    price: "12,500",
    rating: 4.9,
    category: "nature",
    activities: ["🎨 Rock art", "🥾 Trek", "⛺ Bivouac"],
    activities_fr: ["🎨 Art rupestre", "🥾 Trek", "⛺ Bivouac"],
    itinerary: [
      { day: 1, title: "Arrival", title_fr: "Arrivée", desc: "Trek preparation", desc_fr: "Préparation du trek" },
      { day: 2, title: "Departure", title_fr: "Départ", desc: "4x4 route", desc_fr: "Route en 4x4" },
      { day: 3, title: "Engravings", title_fr: "Gravures", desc: "Prehistoric art", desc_fr: "Art préhistorique" },
      { day: 4, title: "Canyons", title_fr: "Canyons", desc: "Gorge trek", desc_fr: "Trek dans les gorges" },
      { day: 5, title: "Bivouac", title_fr: "Bivouac", desc: "Night under the stars", desc_fr: "Nuit sous les étoiles" },
      { day: 6, title: "Return", title_fr: "Retour", desc: "Return route", desc_fr: "Route retour" },
      { day: 7, title: "Departure", title_fr: "Départ", desc: "Airport transfer", desc_fr: "Transfert aéroport" },
    ],
  },
  {
    id: 4,
    name: "Ghardaïa",
    name_fr: "Ghardaïa",
    name_en: "Ghardaïa",
    subtitle: "M'Zab Valley",
    subtitle_fr: "Vallée du M'Zab",
    subtitle_en: "M'Zab Valley",
    description: "Unique Berber architecture, fortified cities and lush oases of the valley.",
    description_fr: "Architecture berbère unique, cités fortifiées et oasis verdoyantes de la vallée.",
    description_en: "Unique Berber architecture, fortified cities and lush oases of the valley.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgbwTu5UUydTv5_SwzjDeb9f75Fj4J_L9OyA&s",
    location: "Vallée du M'Zab",
    bestTime: "October – March",
    bestTime_fr: "Octobre – Mars",
    bestTime_en: "October – March",
    duration: "4 days",
    duration_fr: "4 jours",
    duration_en: "4 days",
    price: "48,000",
    rating: 4.8,
    category: "culture",
    activities: ["🏛️ Architecture", "🎨 Crafts", "🕌 Mosques"],
    activities_fr: ["🏛️ Architecture", "🎨 Artisanat", "🕌 Mosquées"],
    itinerary: [
      { day: 1, title: "Arrival", title_fr: "Arrivée", desc: "Valley panorama", desc_fr: "Panorama sur la vallée" },
      { day: 2, title: "Ksour", title_fr: "Ksour", desc: "Architecture tour", desc_fr: "Tour architectural" },
      { day: 3, title: "Palm grove", title_fr: "Palmeraie", desc: "Local workshop", desc_fr: "Atelier local" },
      { day: 4, title: "Departure", title_fr: "Départ", desc: "Transfer", desc_fr: "Transfert" },
    ],
  },
  {
    id: 5,
    name: "Djemila",
    name_fr: "Djemila",
    name_en: "Djemila",
    subtitle: "The Roman Pearl",
    subtitle_fr: "La Perle Romaine",
    subtitle_en: "The Roman Pearl",
    description: "Among the best-preserved archaeological sites in the world, UNESCO-listed.",
    description_fr: "Parmi les sites archéologiques les mieux préservés au monde, classé UNESCO.",
    description_en: "Among the best-preserved archaeological sites in the world, UNESCO-listed.",
    image: "https://visitalgeria.org/wp-content/uploads/2024/04/Djemila-the-archaeological-zone-of-the-well-preserved-Berber-Roman-ruins-in-North-Africa-Algeria.-UNESCO-World-Heritage-Site-15-1024x536.jpg",
    location: "Sétif",
    bestTime: "May – October",
    bestTime_fr: "Mai – Octobre",
    bestTime_en: "May – October",
    duration: "3 days",
    duration_fr: "3 jours",
    duration_en: "3 days",
    price: "20,000",
    rating: 4.7,
    category: "culture",
    activities: ["🏛️ Ruins", "📜 Mosaics", "🎭 Theatre"],
    activities_fr: ["🏛️ Ruines", "📜 Mosai͏̈ques", "🎭 Théâtre"],
    itinerary: [
      { day: 1, title: "Arrival", title_fr: "Arrivée", desc: "Check-in", desc_fr: "Installation" },
      { day: 2, title: "Djemila", title_fr: "Djemila", desc: "Site visit", desc_fr: "Visite du site" },
      { day: 3, title: "Departure", title_fr: "Départ", desc: "Transfer", desc_fr: "Transfert" },
    ],
  },
  {
    id: 6,
    name: "Taghit",
    name_fr: "Taghit",
    name_en: "Taghit",
    subtitle: "The Secret Oasis",
    subtitle_fr: "L'Oasis Secrète",
    subtitle_en: "The Secret Oasis",
    description: "Majestic dunes and a preserved oasis in the heart of the Algerian Sahara.",
    description_fr: "Dunes majestueuses et oasis préservée au cœur du Sahara algérien.",
    description_en: "Majestic dunes and a preserved oasis in the heart of the Algerian Sahara.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxC8ziUGgisBwriU1vhBnxClvWqqsfs8c2kA&s",
    location: "Béchar, Sahara",
    bestTime: "October – March",
    bestTime_fr: "Octobre – Mars",
    bestTime_en: "October – March",
    duration: "4 days",
    duration_fr: "4 jours",
    duration_en: "4 days",
    price: "720",
    rating: 4.8,
    category: "desert",
    activities: ["🏜️ Dunes", "🌴 Palm grove", "🌅 Sunset"],
    activities_fr: ["🏜️ Dunes", "🌴 Palmeraie", "🌅 Coucher de soleil"],
    itinerary: [
      { day: 1, title: "Arrival", title_fr: "Arrivée", desc: "Welcome", desc_fr: "Accueil" },
      { day: 2, title: "Dunes", title_fr: "Dunes", desc: "Camel trek", desc_fr: "Trek à dos de chameau" },
      { day: 3, title: "Oasis", title_fr: "Oasis", desc: "Palm grove visit", desc_fr: "Visite de la palmeraie" },
      { day: 4, title: "Departure", title_fr: "Départ", desc: "Transfer", desc_fr: "Transfert" },
    ],
  },
];

const FILTERS = [
  { key: "all", label: "All", label_fr: "Tous", icon: "✦" },
  { key: "culture", label: "Culture", label_fr: "Culture", icon: "🏛️" },
  { key: "desert", label: "Desert", label_fr: "Désert", icon: "🏜️" },
  { key: "nature", label: "Nature", label_fr: "Nature", icon: "🌿" },
];

export default function Destinations() {
  const { language, t, pick } = useLang();
  const [activeFilter, setActiveFilter] = useState("all");
  const [flippedCard, setFlippedCard] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroScale = Math.max(0.95, 1 - scrollY / 4000);

  const filtered =
    activeFilter === "all"
      ? destinations
      : destinations.filter((d) => d.category === activeFilter);
  const displayed = filtered.slice(0, visibleCount);

  // Helper pour obtenir la valeur traduite
  const getText = (item, field, frField, enField) => {
    if (language === 'fr' && item[frField]) return item[frField];
    return item[enField] || item[field];
  };

  const getItineraryText = (item, field, frField) => {
    if (language === 'fr' && item[frField]) return item[frField];
    return item[field];
  };

  return (
    <>
      <Navbar />
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0f0d0a", color: "#f5f0e8", overflowX: "hidden" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { overflow-x: hidden; }

          /* ── HERO ── */
          .hero {
            position: relative;
            height: 100vh;
            min-height: 600px;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
          }
          .hero-bg {
            position: absolute;
            inset: 0;
            background-image: url('https://voyage-en-algerie.com/wp-content/uploads/2026/04/culture-touareg-1.jpg');
            background-size: cover;
            background-position: center 30%;
            will-change: transform;
          }
          .hero-vignette {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(15,13,10,0.1) 0%,
              rgba(15,13,10,0.0) 30%,
              rgba(15,13,10,0.6) 65%,
              rgba(15,13,10,0.98) 100%
            );
          }
          .hero-content {
            position: relative;
            z-index: 2;
            padding: 0 clamp(24px, 6vw, 100px) 80px;
            max-width: 900px;
            width: 100%;
          }
          .hero-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 11px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #d4a853;
            margin-bottom: 20px;
          }
          .hero-eyebrow::before {
            content: '';
            display: block;
            width: 32px;
            height: 1px;
            background: #d4a853;
          }
          .hero-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(48px, 9vw, 96px);
            font-weight: 400;
            line-height: 1.0;
            color: #f5f0e8;
            margin-bottom: 28px;
          }
          .hero-title em {
            font-style: italic;
            color: #d4a853;
          }
          .hero-meta {
            display: flex;
            align-items: center;
            gap: 32px;
            flex-wrap: wrap;
          }
          .hero-stat {
            text-align: left;
          }
          .hero-stat strong {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 400;
            color: #d4a853;
            display: block;
            line-height: 1;
          }
          .hero-stat span {
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: rgba(245,240,232,0.5);
          }
          .hero-divider {
            width: 1px;
            height: 40px;
            background: rgba(245,240,232,0.15);
          }
          .hero-scroll-line {
            position: absolute;
            bottom: 32px;
            right: clamp(24px, 6vw, 100px);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: rgba(245,240,232,0.4);
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            z-index: 2;
          }
          .hero-scroll-line::after {
            content: '';
            display: block;
            width: 1px;
            height: 48px;
            background: linear-gradient(to bottom, rgba(245,240,232,0.4), transparent);
            animation: scrollLine 2s ease-in-out infinite;
          }
          @keyframes scrollLine {
            0%, 100% { transform: scaleY(1); opacity: 0.4; }
            50% { transform: scaleY(0.6); opacity: 0.8; }
          }

          /* ── SECTION DESTINATIONS ── */
          .section-dest {
            background: #f5f0e8;
            color: #0f0d0a;
            padding: clamp(60px, 8vw, 120px) clamp(24px, 6vw, 80px);
          }
          .section-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 52px;
            gap: 20px;
            flex-wrap: wrap;
          }
          .section-label {
            font-size: 10px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #d4a853;
            margin-bottom: 10px;
          }
          .section-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(32px, 5vw, 52px);
            font-weight: 400;
            line-height: 1.1;
            color: #0f0d0a;
          }
          .section-title em {
            font-style: italic;
            color: #d4a853;
          }

          /* FILTERS */
          .filters {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .filter-btn {
            background: transparent;
            border: 1px solid rgba(15,13,10,0.2);
            padding: 8px 20px;
            border-radius: 2px;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.5px;
            cursor: pointer;
            color: #5a4a3a;
            transition: all 0.2s;
            font-family: inherit;
          }
          .filter-btn:hover {
            border-color: #d4a853;
            color: #d4a853;
          }
          .filter-btn.active {
            background: #d4a853;
            border-color: #d4a853;
            color: #fff;
          }

          /* ── GRID ── */
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2px;
            margin-bottom: 2px;
          }
          @media (max-width: 1024px) { .grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 640px)  { .grid { grid-template-columns: 1fr; } }

          /* ── CARD ── */
          .card {
            position: relative;
            aspect-ratio: 3/4;
            overflow: hidden;
            cursor: pointer;
            background: #1c1a17;
          }
          @media (max-width: 640px) { .card { aspect-ratio: 4/3; } }

          .card-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            will-change: transform;
          }
          .card:hover .card-img {
            transform: scale(1.06);
          }
          .card-base-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to top,
              rgba(15,13,10,0.92) 0%,
              rgba(15,13,10,0.4) 50%,
              rgba(15,13,10,0.05) 100%
            );
            transition: opacity 0.4s;
          }
          .card:hover .card-base-overlay {
            opacity: 0.5;
          }

          /* Card base content (always visible) */
          .card-base {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 28px;
            transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index: 2;
          }
          .card:hover .card-base {
            transform: translateY(-8px);
          }
          .card-location-tag {
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #d4a853;
            margin-bottom: 6px;
            display: block;
          }
          .card-name {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(22px, 3vw, 30px);
            font-weight: 400;
            color: #f5f0e8;
            line-height: 1.1;
            margin-bottom: 4px;
          }
          .card-subtitle {
            font-size: 12px;
            color: rgba(245,240,232,0.5);
            font-style: italic;
            margin-bottom: 12px;
          }
          .card-pills {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }
          .card-pill {
            font-size: 10px;
            padding: 3px 10px;
            border: 1px solid rgba(245,240,232,0.25);
            border-radius: 20px;
            color: rgba(245,240,232,0.7);
          }

          /* Card hover panel */
          .card-hover-panel {
            position: absolute;
            inset: 0;
            background: rgba(15,13,10,0.92);
            backdrop-filter: blur(4px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 32px;
            z-index: 3;
            opacity: 0;
            transform: translateY(16px);
            transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: none;
          }
          .card.flipped .card-hover-panel,
          .card:hover .card-hover-panel {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
          .panel-eyebrow {
            font-size: 9px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #d4a853;
            margin-bottom: 6px;
          }
          .panel-name {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(24px, 3vw, 32px);
            font-weight: 400;
            color: #f5f0e8;
            margin-bottom: 4px;
          }
          .panel-subtitle {
            font-size: 12px;
            color: rgba(245,240,232,0.5);
            font-style: italic;
            margin-bottom: 18px;
          }
          .panel-desc {
            font-size: 13px;
            color: rgba(245,240,232,0.75);
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .panel-info {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          .panel-info-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .panel-info-label {
            font-size: 9px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(245,240,232,0.4);
          }
          .panel-info-value {
            font-size: 13px;
            color: #f5f0e8;
            font-weight: 500;
          }
          .panel-price {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #d4a853;
            font-weight: 400;
            margin-bottom: 4px;
          }
          .panel-price-label {
            font-size: 10px;
            color: rgba(245,240,232,0.4);
            letter-spacing: 1px;
          }
          .panel-divider {
            height: 1px;
            background: rgba(245,240,232,0.1);
            margin-bottom: 20px;
          }
          .panel-itinerary {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 22px;
            max-height: 120px;
            overflow-y: auto;
          }
          .panel-itinerary::-webkit-scrollbar { width: 2px; }
          .panel-itinerary::-webkit-scrollbar-thumb { background: #d4a853; border-radius: 1px; }
          .panel-itin-row {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }
          .panel-day-dot {
            min-width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(212,168,83,0.15);
            border: 1px solid #d4a853;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #d4a853;
            font-weight: 600;
            margin-top: 1px;
            flex-shrink: 0;
          }
          .panel-itin-title {
            font-size: 11px;
            font-weight: 600;
            color: #f5f0e8;
            margin-bottom: 1px;
          }
          .panel-itin-desc {
            font-size: 10px;
            color: rgba(245,240,232,0.45);
          }
          .panel-actions {
            display: flex;
            gap: 10px;
          }
          .btn-gold {
            flex: 1;
            background: #d4a853;
            border: none;
            padding: 12px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #0f0d0a;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          }
          .btn-gold:hover { background: #c49642; }
          .btn-outline-white {
            flex: 1;
            background: transparent;
            border: 1px solid rgba(245,240,232,0.3);
            padding: 12px;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: rgba(245,240,232,0.7);
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          }
          .btn-outline-white:hover { border-color: #d4a853; color: #d4a853; }

          /* Card rating badge */
          .card-rating {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(15,13,10,0.7);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(212,168,83,0.3);
            padding: 5px 10px;
            font-size: 11px;
            color: #d4a853;
            z-index: 4;
          }

          /* ── LOAD MORE ── */
          .load-more-wrap {
            background: #f5f0e8;
            padding: 0 clamp(24px, 6vw, 80px) 80px;
            text-align: center;
          }
          .btn-load-more {
            background: transparent;
            border: 1px solid rgba(15,13,10,0.3);
            padding: 14px 48px;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #0f0d0a;
            cursor: pointer;
            transition: all 0.25s;
            font-family: inherit;
          }
          .btn-load-more:hover {
            background: #0f0d0a;
            color: #f5f0e8;
            border-color: #0f0d0a;
          }

          /* ── WHY US ── */
          .why-section {
            background: #1c1a17;
            padding: clamp(60px, 8vw, 120px) clamp(24px, 6vw, 80px);
          }
          .why-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
          }
          @media (max-width: 900px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 520px)  { .why-grid { grid-template-columns: 1fr; gap: 32px; } }

          .why-item {
            border-top: 1px solid rgba(245,240,232,0.1);
            padding-top: 28px;
          }
          .why-num {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            color: rgba(212,168,83,0.15);
            line-height: 1;
            margin-bottom: 16px;
            font-weight: 400;
          }
          .why-icon { font-size: 24px; margin-bottom: 12px; }
          .why-title {
            font-size: 15px;
            font-weight: 600;
            color: #f5f0e8;
            margin-bottom: 8px;
            letter-spacing: 0.3px;
          }
          .why-desc {
            font-size: 13px;
            color: rgba(245,240,232,0.45);
            line-height: 1.6;
          }

          /* ── CTA ── */
          .cta-section {
            position: relative;
            overflow: hidden;
            padding: clamp(80px, 12vw, 160px) clamp(24px, 6vw, 80px);
            background: #0f0d0a;
            text-align: center;
          }
          .cta-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%);
            pointer-events: none;
          }
          .cta-label {
            font-size: 10px;
            letter-spacing: 5px;
            text-transform: uppercase;
            color: #d4a853;
            margin-bottom: 20px;
          }
          .cta-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(36px, 6vw, 64px);
            font-weight: 400;
            color: #f5f0e8;
            line-height: 1.1;
            margin-bottom: 20px;
          }
          .cta-title em {
            font-style: italic;
            color: #d4a853;
          }
          .cta-sub {
            font-size: 15px;
            color: rgba(245,240,232,0.5);
            margin-bottom: 44px;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.6;
          }
          .btn-cta {
            background: #d4a853;
            border: none;
            padding: 16px 56px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #0f0d0a;
            cursor: pointer;
            transition: all 0.25s;
            font-family: inherit;
          }
          .btn-cta:hover {
            background: #c49642;
            transform: translateY(-2px);
          }

          /* ── MOBILE FILTER SCROLL ── */
          @media (max-width: 640px) {
            .filters {
              overflow-x: auto;
              flex-wrap: nowrap;
              padding-bottom: 4px;
              -webkit-overflow-scrolling: touch;
            }
            .filter-btn { white-space: nowrap; }
            .section-header {
              flex-direction: column;
              align-items: flex-start;
            }
          }

          /* touch-friendly: on mobile, tap to flip card */
          @media (hover: none) {
            .card:hover .card-hover-panel { opacity: 0; transform: translateY(16px); }
            .card:hover .card-img { transform: none; }
            .card:hover .card-base { transform: none; }
            .card.flipped .card-hover-panel { opacity: 1; transform: translateY(0); pointer-events: auto; }
          }
        `}</style>

        {/* ── HERO ── */}
        <section className="hero" ref={heroRef}>
          <div
            className="hero-bg"
            style={{
              opacity: heroOpacity,
              transform: `scale(${heroScale})`,
              transformOrigin: "center bottom",
            }}
          />
          <div className="hero-vignette" />
          <div className="hero-content">
            <div className="hero-eyebrow">{language === 'fr' ? 'Explorez l\'Algérie' : 'Explore Algeria'}</div>
            <h1 className="hero-title">
              {language === 'fr' ? 'Découvrez' : 'Discover'}<br /><em>{language === 'fr' ? 'Destinations' : 'Destinations'}</em>
            </h1>
            <div className="hero-meta">
              <div className="hero-stat">
                <strong>12+</strong>
                <span>{language === 'fr' ? 'Destinations' : 'Destinations'}</span>
              </div>
              <div className="hero-divider" />
              <div className="hero-stat">
                <strong>50+</strong>
                <span>{language === 'fr' ? 'Circuits' : 'Tours'}</span>
              </div>
              <div className="hero-divider" />
              <div className="hero-stat">
                <strong>4.8★</strong>
                <span>{language === 'fr' ? 'Note moyenne' : 'Avg Rating'}</span>
              </div>
            </div>
          </div>
          <div className="hero-scroll-line">{language === 'fr' ? 'Défiler' : 'Scroll'}</div>
        </section>

        {/* ── DESTINATIONS ── */}
        <section className="section-dest">
          <div className="section-header">
            <div>
              <p className="section-label">{language === 'fr' ? 'Notre Collection' : 'Our Collection'}</p>
              <h2 className="section-title">
                {language === 'fr' ? 'Voyages' : 'Curated'}<br /><em>{language === 'fr' ? 'sur mesure' : 'Journeys'}</em>
              </h2>
            </div>
            <div className="filters">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`filter-btn${activeFilter === f.key ? " active" : ""}`}
                  onClick={() => { setActiveFilter(f.key); setVisibleCount(6); }}
                >
                  {f.icon} {language === 'fr' ? f.label_fr : f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid">
            {displayed.map((dest) => (
              <div
                key={dest.id}
                className={`card${flippedCard === dest.id ? " flipped" : ""}`}
                onClick={() => setFlippedCard(flippedCard === dest.id ? null : dest.id)}
              >
                <img src={dest.image} alt={dest.name} className="card-img" loading="lazy" />
                <div className="card-base-overlay" />
                <div className="card-rating">★ {dest.rating}</div>

                {/* Base content */}
                <div className="card-base">
                  <span className="card-location-tag">{dest.location}</span>
                  <h3 className="card-name">{language === 'fr' ? dest.name_fr : dest.name_en}</h3>
                  <p className="card-subtitle">{language === 'fr' ? dest.subtitle_fr : dest.subtitle_en}</p>
                  <div className="card-pills">
                    {(language === 'fr' ? dest.activities_fr : dest.activities).slice(0, 2).map((a, i) => (
                      <span key={i} className="card-pill">{a}</span>
                    ))}
                  </div>
                </div>

                {/* Hover / tap panel */}
                <div className="card-hover-panel">
                  <p className="panel-eyebrow">{dest.location}</p>
                  <h3 className="panel-name">{language === 'fr' ? dest.name_fr : dest.name_en}</h3>
                  <p className="panel-subtitle">{language === 'fr' ? dest.subtitle_fr : dest.subtitle_en}</p>
                  <p className="panel-desc">{language === 'fr' ? dest.description_fr : dest.description_en}</p>

                  <div className="panel-info" style={{ marginBottom: 16 }}>
                    <div className="panel-info-item">
                      <span className="panel-info-label">{language === 'fr' ? 'Durée' : 'Duration'}</span>
                      <span className="panel-info-value">{language === 'fr' ? dest.duration_fr : dest.duration}</span>
                    </div>
                    <div className="panel-info-item">
                      <span className="panel-info-label">{language === 'fr' ? 'Meilleure période' : 'Best time'}</span>
                      <span className="panel-info-value" style={{ fontSize: 11 }}>{language === 'fr' ? dest.bestTime_fr : dest.bestTime}</span>
                    </div>
                    <div className="panel-info-item" style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div className="panel-price">{dest.price}<span style={{ fontSize: 14 }}>DA</span></div>
                      <div className="panel-price-label">{language === 'fr' ? 'par personne' : 'per person'}</div>
                    </div>
                  </div>

                  <div className="panel-divider" />
                  <div className="panel-itinerary">
                    {dest.itinerary.map((item, i) => (
                      <div key={i} className="panel-itin-row">
                        <div className="panel-day-dot">{i + 1}</div>
                        <div>
                          <div className="panel-itin-title">{language === 'fr' ? item.title_fr : item.title}</div>
                          <div className="panel-itin-desc">{language === 'fr' ? item.desc_fr : item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="panel-actions">
                    <button className="btn-gold" onClick={(e) => { e.stopPropagation(); alert(`${language === 'fr' ? 'Réservation' : 'Booking'} ${dest.name} — ${language === 'fr' ? 'à partir de' : 'from'} ${dest.price} DA`); }}>
                      {language === 'fr' ? 'Réserver' : 'Book Now'}
                    </button>
                    <button className="btn-outline-white" onClick={(e) => { e.stopPropagation(); setFlippedCard(null); }}>
                      {language === 'fr' ? 'Fermer' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Load more */}
        {visibleCount < filtered.length && (
          <div className="load-more-wrap">
            <button className="btn-load-more" onClick={() => setVisibleCount((v) => v + 4)}>
              {language === 'fr' ? 'Charger plus de destinations' : 'Load More Destinations'}
            </button>
          </div>
        )}

        {/* ── WHY US ── */}
        <section className="why-section">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p className="section-label" style={{ marginBottom: 48 }}>{language === 'fr' ? 'Pourquoi voyager avec nous' : 'Why travel with us'}</p>
            <div className="why-grid">
              {[
                { icon: "🏆", title: language === 'fr' ? "Guides experts" : "Expert Guides", desc: language === 'fr' ? "Des spécialistes locaux avec des décennies d'expérience." : "Local specialists with decades of experience in every region." },
                { icon: "✦", title: language === 'fr' ? "Sur mesure" : "Tailor-Made", desc: language === 'fr' ? "Chaque itinéraire adapté à votre rythme." : "Every itinerary crafted to fit your rhythm and interests." },
                { icon: "♡", title: language === 'fr' ? "Authentique" : "Authentic", desc: language === 'fr' ? "Des expériences hors des sentiers battus." : "Off-the-beaten-path experiences you won't find in any brochure." },
                { icon: "🕊️", title: language === 'fr' ? "Assistance 24/7" : "Full Support", desc: language === 'fr' ? "Une aide de la planification au transfert final." : "24/7 assistance from planning through the final transfer." },
              ].map((w, i) => (
                <div key={i} className="why-item">
                  <div className="why-num">0{i + 1}</div>
                  <div className="why-icon">{w.icon}</div>
                  <div className="why-title">{w.title}</div>
                  <p className="why-desc">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-glow" />
          <p className="cta-label">{language === 'fr' ? 'Prêt à explorer ?' : 'Ready to explore?'}</p>
          <h2 className="cta-title">{language === 'fr' ? 'Votre prochaine' : 'Your next'}<br /><em>{language === 'fr' ? 'aventure vous attend' : 'adventure awaits'}</em></h2>
          <p className="cta-sub">{language === 'fr' ? 'Laissez-nous créer un voyage qui restera avec vous longtemps après votre retour.' : 'Let us craft a journey that stays with you long after you return home.'}</p>
          <button className="btn-cta" onClick={() => alert(language === 'fr' ? "Redirection vers la page contact..." : "Redirecting to contact...")}>
            {language === 'fr' ? 'Planifier mon voyage' : 'Plan My Trip'}
          </button>
        </section>
      </div>
      <Footer />
    </>
  );
}