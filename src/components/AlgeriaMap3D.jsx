/* Map3D.css */

.map-3d-container {
    position: relative;
    height: 550px;
    margin: 80px auto;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
    max-width: 1300px;
  }
  
  /* Effet de brillance au survol */
  .map-3d-container::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 28px;
    padding: 2px;
    background: linear-gradient(135deg, 
      rgba(212, 163, 115, 0.4) 0%, 
      rgba(255, 215, 0, 0.2) 50%,
      rgba(212, 163, 115, 0) 100%);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  .map-3d-container:hover::before {
    opacity: 1;
  }
  
  /* Badge "Carte Interactive" */
  .map-3d-container::after {
    content: '🗺️ Explorer la carte';
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    color: #d4a373;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 40px;
    z-index: 10;
    font-family: system-ui, -apple-system, sans-serif;
    letter-spacing: 0.5px;
    border: 1px solid rgba(212, 163, 115, 0.3);
    pointer-events: none;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s ease;
  }
  
  .map-3d-container:hover::after {
    opacity: 1;
    transform: translateX(0);
  }
  
  /* Wrapper avec animation */
  .map-wrapper {
    opacity: 0;
    transform: translateY(60px) scale(0.98);
    transition: all 0.9s cubic-bezier(0.21, 0.98, 0.35, 1);
    height: 100%;
    width: 100%;
  }
  
  .map-wrapper.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  
  /* Style de l'iframe */
  .map-wrapper iframe {
    transition: transform 0.4s ease;
  }
  
  .map-3d-container:hover iframe {
    transform: scale(1.02);
  }
  
  /* Points d'intérêt animés (overlay CSS) */
  .map-3d-container .pin {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #ff6b6b;
    border-radius: 50%;
    z-index: 20;
    cursor: pointer;
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
    animation: pulse 2s infinite;
  }
  
  .map-3d-container .pin::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #ff6b6b;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
    }
    70% {
      box-shadow: 0 0 0 12px rgba(255, 107, 107, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
    }
  }
  
  /* Tooltip pour les villes */
  .map-3d-container .tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    color: #d4a373;
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    z-index: 25;
    pointer-events: none;
    font-family: system-ui, sans-serif;
    letter-spacing: 0.3px;
    border: 1px solid rgba(212, 163, 115, 0.4);
    transform: translateY(-28px);
    transition: opacity 0.2s;
    opacity: 0;
  }
  
  .map-3d-container .pin:hover + .tooltip {
    opacity: 1;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .map-3d-container {
      height: 400px;
      margin: 40px 16px;
      border-radius: 20px;
    }
    
    .map-3d-container::after {
      content: '🗺️ Carte';
      padding: 4px 10px;
      font-size: 0.7rem;
      bottom: 12px;
      right: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .map-3d-container {
      height: 320px;
      margin: 30px 12px;
    }
  }
  
  /* Animation d'entrée pour le conteneur */
  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .map-3d-container {
    animation: fadeSlideUp 0.6s ease-out;
  }
  
  /* Overlay de chargement */
  .map-wrapper::before {
    content: '🌍 Chargement de la carte...';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    color: #d4a373;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 0.9rem;
    z-index: 5;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  
  .map-wrapper:not(.visible)::before {
    opacity: 1;
  }
  
  /* Style pour le dégradé de fond pendant le chargement */
  .map-3d-container {
    background: linear-gradient(135deg, 
      #0f2027 0%, 
      #203a43 50%, 
      #2c5364 100%);
  }
  
  /* Particules animées de sable (effet décoratif) */
  .map-3d-container .sand-particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #d4a373;
    border-radius: 50%;
    opacity: 0.5;
    animation: floatSand 8s infinite linear;
    pointer-events: none;
  }
  
  @keyframes floatSand {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    10% {
      opacity: 0.5;
    }
    90% {
      opacity: 0.3;
    }
    100% {
      transform: translateY(-200px) translateX(20px);
      opacity: 0;
    }
  }