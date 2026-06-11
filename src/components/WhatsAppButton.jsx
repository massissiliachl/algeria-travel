import React, { useState, useEffect } from "react";

const WhatsAppButton = () => {
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Correction : enlever les espaces du numéro de téléphone
  const phoneNumber = "213557664089"; // Sans le 00213, juste 213
  const message = "Bonjour, je souhaite réserver une activité sur Algeria Travel";

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    // Arrêter la pulsation après 5 secondes
    const timer = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        backgroundColor: "#25D366",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textDecoration: "none",
        boxShadow: hover 
          ? "0 6px 15px rgba(0,0,0,0.3)" 
          : "0 4px 10px rgba(0,0,0,0.3)",
        zIndex: 9999,
        transform: hover ? "scale(1.1)" : "scale(1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        animation: pulse ? "pulse 1.5s infinite" : "none",
      }}
    >
      {/* Logo WhatsApp officiel en SVG */}
      <svg 
        viewBox="0 0 24 24" 
        width="32" 
        height="32" 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.514 0-10 4.486-10 10 0 1.767.461 3.488 1.334 5.002L2 22l5.115-1.314c1.486.804 3.157 1.229 4.891 1.229 5.514 0 10-4.486 10-10 0-2.677-1.041-5.185-2.929-7.073zm-7.071 15.299c-1.519 0-3.005-.413-4.274-1.188l-.306-.181-3.036.779.81-2.959-.199-.317c-.859-1.363-1.313-2.926-1.313-4.535 0-4.597 3.741-8.338 8.338-8.338 2.226 0 4.319.867 5.891 2.439 1.572 1.572 2.439 3.665 2.439 5.891.001 4.597-3.74 8.338-8.35 8.338zm4.573-6.247c-.251-.125-1.485-.734-1.715-.817-.23-.084-.397-.125-.565.125-.167.25-.645.817-.791.985-.146.168-.293.188-.543.063-.25-.125-1.056-.39-2.012-1.242-.744-.66-1.246-1.476-1.392-1.726-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438s.167-.25.25-.417c.084-.167.042-.312-.021-.438-.062-.125-.564-1.361-.773-1.864-.203-.488-.411-.422-.565-.43-.146-.008-.312-.01-.479-.01s-.438.063-.668.313c-.229.25-.875.854-.875 2.083 0 1.229.896 2.416 1.021 2.583.125.167 1.761 2.688 4.266 3.77.596.256 1.062.41 1.426.525.599.191 1.145.163 1.576.099.481-.073 1.485-.607 1.694-1.193.209-.586.209-1.089.146-1.193-.062-.104-.229-.167-.479-.292z"/>
      </svg>
      
      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
            }
          }
        `}
      </style>
    </a>
  );
};

export default WhatsAppButton;