import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const location = useLocation();
  const [pulse, setPulse] = useState(true);
  const [hidden, setHidden] = useState(false);

  const phoneNumber = '213557664089';
  const message = 'Bonjour, je souhaite réserver une activité sur Algeria Travel';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const check = () => {
      const mobile = window.matchMedia('(max-width: 960px)').matches;
      const hasBar = document.querySelector(
        '.mobile-booking-bar, .place-mobile-bar, .stays-mobile-bar'
      );
      const modalOpen = document.querySelector('.bottom-sheet, .stays-detail.is-open');
      setHidden(mobile && (!!hasBar || !!modalOpen));
    };

    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', check);
    return () => {
      mo.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [location.pathname]);

  if (hidden) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`wa-fab${pulse ? ' is-pulse' : ''}`}
      aria-label="WhatsApp"
      title="WhatsApp"
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.514 0-10 4.486-10 10 0 1.767.461 3.488 1.334 5.002L2 22l5.115-1.314c1.486.804 3.157 1.229 4.891 1.229 5.514 0 10-4.486 10-10 0-2.677-1.041-5.185-2.929-7.073zm-7.071 15.299c-1.519 0-3.005-.413-4.274-1.188l-.306-.181-3.036.779.81-2.959-.199-.317c-.859-1.363-1.313-2.926-1.313-4.535 0-4.597 3.741-8.338 8.338-8.338 2.226 0 4.319.867 5.891 2.439 1.572 1.572 2.439 3.665 2.439 5.891.001 4.597-3.74 8.338-8.35 8.338zm4.573-6.247c-.251-.125-1.485-.734-1.715-.817-.23-.084-.397-.125-.565.125-.167.25-.645.817-.791.985-.146.168-.293.188-.543.063-.25-.125-1.056-.39-2.012-1.242-.744-.66-1.246-1.476-1.392-1.726-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438s.167-.25.25-.417c.084-.167.042-.312-.021-.438-.062-.125-.564-1.361-.773-1.864-.203-.488-.411-.422-.565-.43-.146-.008-.312-.01-.479-.01s-.438.063-.668.313c-.229.25-.875.854-.875 2.083 0 1.229.896 2.416 1.021 2.583.125.167 1.761 2.688 4.266 3.77.596.256 1.062.41 1.426.525.599.191 1.145.163 1.576.099.481-.073 1.485-.607 1.694-1.193.209-.586.209-1.089.146-1.193-.062-.104-.229-.167-.479-.292z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
