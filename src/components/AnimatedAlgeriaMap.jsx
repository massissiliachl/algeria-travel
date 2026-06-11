// src/components/AnimatedAlgeriaMap.jsx
import React, { useEffect, useRef, useState } from 'react';

const AnimatedAlgeriaMap = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [backgroundType, setBackgroundType] = useState('default');
  const mapRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  // Configuration des régions avec leurs types et backgrounds
  const regionConfig = {
    // Région Nord (Mer/Méditerranée)
    alger: { type: 'nord', name: 'Alger', background: 'mer', bgImage: 'url(https://images.unsplash.com/photo-1598977128117-a2d194d2f20e?w=1200)' },
    oran: { type: 'nord', name: 'Oran', background: 'mer', bgImage: 'url(https://images.unsplash.com/photo-1598977128117-a2d194d2f20e?w=1200)' },
    tipaza: { type: 'nord', name: 'Tipaza', background: 'mer', bgImage: 'url(https://images.unsplash.com/photo-1598977128117-a2d194d2f20e?w=1200)' },
    bejaia: { type: 'nord', name: 'Béjaïa', background: 'mer', bgImage: 'url(https://images.unsplash.com/photo-1598977128117-a2d194d2f20e?w=1200)' },
    annaba: { type: 'nord', name: 'Annaba', background: 'mer', bgImage: 'url(https://images.unsplash.com/photo-1598977128117-a2d194d2f20e?w=1200)' },
    
    // Région Kabylie (Montagnes)
    tizi: { type: 'kabylie', name: 'Tizi Ouzou', background: 'montagne', bgImage: 'url(https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200)' },
    bejaia_mont: { type: 'kabylie', name: 'Béjaïa (Montagnes)', background: 'montagne', bgImage: 'url(https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200)' },
    setif: { type: 'kabylie', name: 'Sétif', background: 'montagne', bgImage: 'url(https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200)' },
    
    // Région Sahara (Désert rouge)
    djanet: { type: 'sahara', name: 'Djanet', background: 'desert', bgImage: 'url(https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200)' },
    timimoun: { type: 'sahara', name: 'Timimoun', background: 'desert', bgImage: 'url(https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200)' },
    tamanrasset: { type: 'sahara', name: 'Tamanrasset', background: 'desert', bgImage: 'url(https://images.pexels.com/photos/2567327/pexels-photo-2567327.jpeg?w=1200)' },
    ghardaia: { type: 'sahara', name: 'Ghardaïa', background: 'desert', bgImage: 'url(https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200)' },
    taghit: { type: 'sahara', name: 'Taghit', background: 'desert', bgImage: 'url(https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200)' },
  };

  const cities = [
    // Nord (Mer)
    { id: 'alger', name: 'Alger', cx: 384, cy: 210, type: 'nord' },
    { id: 'oran', name: 'Oran', cx: 224, cy: 198, type: 'nord' },
    { id: 'tipaza', name: 'Tipaza', cx: 330, cy: 205, type: 'nord' },
    { id: 'bejaia', name: 'Béjaïa', cx: 450, cy: 215, type: 'nord' },
    { id: 'annaba', name: 'Annaba', cx: 560, cy: 225, type: 'nord' },
    
    // Kabylie (Montagnes)
    { id: 'tizi', name: 'Tizi Ouzou', cx: 400, cy: 230, type: 'kabylie' },
    { id: 'setif', name: 'Sétif', cx: 470, cy: 250, type: 'kabylie' },
    
    // Sahara (Désert)
    { id: 'djanet', name: 'Djanet', cx: 624, cy: 408, type: 'sahara' },
    { id: 'timimoun', name: 'Timimoun', cx: 280, cy: 420, type: 'sahara' },
    { id: 'tamanrasset', name: 'Tamanrasset', cx: 496, cy: 432, type: 'sahara' },
    { id: 'ghardaia', name: 'Ghardaïa', cx: 384, cy: 340, type: 'sahara' },
    { id: 'taghit', name: 'Taghit', cx: 240, cy: 440, type: 'sahara' },
  ];

  const handleCityClick = (city) => {
    const config = regionConfig[city.id] || { background: 'default', name: city.name };
    setSelectedRegion(city);
    setBackgroundType(config.background);
    
    // Message d'information sur la région
    let message = '';
    if (city.type === 'nord') {
      message = `🌊 ${city.name} - La Méditerranée vous attend !\n\nDécouvrez nos circuits côtiers : plages magnifiques, vestiges romains et gastronomie méditerranéenne.`;
    } else if (city.type === 'kabylie') {
      message = `⛰️ ${city.name} - Au cœur des montagnes de Kabylie !\n\nRandonnées, villages authentiques et paysages à couper le souffle vous attendent.`;
    } else {
      message = `🏜️ ${city.name} - Au cœur du Sahara algérien !\n\nTrekking, dunes dorées et nuits étoilées vous attendent.`;
    }
    alert(message);
  };

  const resetBackground = () => {
    setSelectedRegion(null);
    setBackgroundType('default');
  };

  // Styles de fond selon le type sélectionné
  const getBackgroundStyle = () => {
    switch(backgroundType) {
      case 'mer':
        return {
          background: 'linear-gradient(135deg, #006994 0%, #48A9C5 50%, #8BB8D6 100%)',
          overlay: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15), transparent 60%)'
        };
      case 'montagne':
        return {
          background: 'linear-gradient(135deg, #1B4D3E 0%, #2D6A4F 50%, #40916C 100%)',
          overlay: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1), transparent 60%)'
        };
      case 'desert':
        return {
          background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 30%, #DEB887 70%, #F4A460 100%)',
          overlay: 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.15), transparent 60%)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c3f 100%)',
          overlay: 'none'
        };
    }
  };

  const currentStyle = getBackgroundStyle();

  return (
    <div className="map-3d-container" ref={mapRef}>
      <style>{`
        .map-3d-container {
          position: relative;
          height: 550px;
          margin: 50px auto;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          transition: all 0.5s ease;
          max-width: 1300px;
          cursor: pointer;
        }

        .map-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }

        .map-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--overlay);
          z-index: 1;
        }

        /* Particules animées selon le type */
        .map-bg.mer::after {
          content: '🌊';
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 60px;
          opacity: 0.3;
          animation: float 4s ease-in-out infinite;
        }

        .map-bg.montagne::after {
          content: '⛰️';
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 60px;
          opacity: 0.3;
          animation: float 4s ease-in-out infinite;
        }

        .map-bg.desert::after {
          content: '🏜️';
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 60px;
          opacity: 0.3;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .algeria-svg-map {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          transition: transform 0.4s ease;
        }

        .map-3d-container:hover .algeria-svg-map {
          transform: scale(1.02);
        }

        .algeria-outline {
          fill: rgba(45, 90, 39, 0.7);
          stroke: #d4a373;
          stroke-width: 2;
          filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
          transition: all 0.3s ease;
        }

        .sand-dune {
          fill: #e8b45e;
          opacity: 0.5;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .mediterranean-sea {
          fill: rgba(74, 144, 217, 0.4);
        }

        .mountain {
          fill: #556B2F;
          opacity: 0.4;
        }

        .city-pin {
          fill: #ff6b6b;
          stroke: white;
          stroke-width: 1.5;
          cursor: pointer;
          transition: all 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .city-pin:hover {
          fill: #ff4444;
          r: 8;
          cursor: pointer;
        }

        .city-label {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: bold;
          fill: white;
          cursor: pointer;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          transition: all 0.2s ease;
        }

        .city-label:hover {
          font-size: 13px;
          fill: #d4a373;
        }

        .map-wrapper {
          opacity: 0;
          transform: translateY(60px) scale(0.98);
          transition: all 0.9s cubic-bezier(0.21, 0.98, 0.35, 1);
          height: 100%;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .map-wrapper.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Info panel de la région sélectionnée */
        .region-info-panel {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          padding: 12px 20px;
          border-radius: 30px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 4px solid #d4a373;
          animation: slideInLeft 0.4s ease;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .region-info-panel .region-icon {
          font-size: 28px;
        }

        .region-info-panel .region-text h4 {
          margin: 0;
          font-size: 14px;
          color: #d4a373;
        }

        .region-info-panel .region-text p {
          margin: 0;
          font-size: 12px;
          color: white;
        }

        .region-info-panel .close-panel {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .region-info-panel .close-panel:hover {
          background: #ff4444;
        }

        .reset-view-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 12px;
          cursor: pointer;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .reset-view-btn:hover {
          background: #d4a373;
          transform: translateY(-2px);
        }

        .legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 10px;
          color: white;
          z-index: 20;
          display: flex;
          gap: 15px;
        }

        .legend span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        @media (max-width: 768px) {
          .map-3d-container {
            height: 400px;
            margin: 30px 16px;
          }
          .city-label {
            font-size: 8px;
          }
          .region-info-panel {
            padding: 8px 16px;
          }
          .region-icon {
            font-size: 20px;
          }
        }
      `}</style>

      <div 
        className={`map-bg ${backgroundType}`}
        style={{
          background: currentStyle.background,
          '--overlay': currentStyle.overlay
        }}
      ></div>

      <div className={`map-wrapper ${isVisible ? 'visible' : ''}`}>
        {/* Bouton reset */}
        {selectedRegion && (
          <button className="reset-view-btn" onClick={resetBackground}>
            <i className="fas fa-undo-alt"></i> Vue complète
          </button>
        )}

        {/* Panneau d'information de la région */}
        {selectedRegion && (
          <div className="region-info-panel">
            <div className="region-icon">
              {selectedRegion.type === 'nord' && '🌊'}
              {selectedRegion.type === 'kabylie' && '⛰️'}
              {selectedRegion.type === 'sahara' && '🏜️'}
            </div>
            <div className="region-text">
              <h4>{selectedRegion.name}</h4>
              <p>
                {selectedRegion.type === 'nord' && 'Découvrez les trésors de la Méditerranée algérienne'}
                {selectedRegion.type === 'kabylie' && 'Explorez les majestueuses montagnes de Kabylie'}
                {selectedRegion.type === 'sahara' && 'Plongez dans l\'immensité du désert rouge'}
              </p>
            </div>
            <button className="close-panel" onClick={resetBackground}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <svg 
          className="algeria-svg-map" 
          viewBox="0 0 800 600" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Mer Méditerranée */}
          <rect x="0" y="0" width="800" height="200" className="mediterranean-sea" />
          
          {/* Fond désert */}
          <rect x="0" y="150" width="800" height="450" fill="#e8c99e" opacity="0.3" />
          
          {/* Dunes du Sahara */}
          <ellipse cx="400" cy="400" rx="350" ry="120" className="sand-dune" />
          <ellipse cx="250" cy="450" rx="200" ry="80" className="sand-dune" />
          <ellipse cx="600" cy="420" rx="180" ry="70" className="sand-dune" />
          
          {/* Montagnes du Hoggar */}
          <polygon points="500,250 520,180 540,250" className="mountain" />
          <polygon points="530,260 555,190 580,260" className="mountain" />
          <polygon points="470,270 490,210 510,270" className="mountain" />

          {/* Montagnes de l'Atlas (Kabylie) */}
          <polygon points="100,200 120,150 140,200" className="mountain" />
          <polygon points="200,180 220,130 240,180" className="mountain" />
          <polygon points="350,160 370,110 390,160" className="mountain" />
          <polygon points="380,200 400,140 420,200" className="mountain" />
          <polygon points="420,210 440,160 460,210" className="mountain" />

          {/* Contour de l'Algérie */}
          <path 
            className="algeria-outline"
            d="M 0,200 
               C 80,180 150,170 180,190 
               C 220,210 280,200 320,180 
               C 360,160 420,165 460,190 
               C 500,215 540,220 580,210 
               C 620,200 680,210 720,230 
               L 800,250 
               L 800,600 
               L 0,600 
               Z"
          />

          {/* Villes */}
          {cities.map((city) => (
            <g key={city.id}>
              <circle 
                cx={city.cx}
                cy={city.cy}
                r="6" 
                className="city-pin"
                onClick={() => handleCityClick(city)}
              />
              <text 
                x={city.cx + 8}
                y={city.cy - 5}
                className="city-label"
                onClick={() => handleCityClick(city)}
              >
                {city.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Légende */}
        <div className="legend">
          <span><span style={{ color: '#ff6b6b' }}>●</span> Villes</span>
          <span>🌊 Mer Méditerranée</span>
          <span>⛰️ Montagnes</span>
          <span>🏜️ Dunes</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedAlgeriaMap;