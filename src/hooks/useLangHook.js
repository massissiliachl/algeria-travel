import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from '../i18n/fr.json';
import en from '../i18n/en.json';

const translations = { fr, en };

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => translations[language]?.[key] ?? translations.fr[key] ?? key;

  const pick = (frText, enText) => (language === 'en' ? enText : frText);

  const changeLanguage = (lang) => {
    if (lang === 'fr' || lang === 'en') {
      setLanguage(lang);
    }
  };

  return (
    <LangContext.Provider value={{ language, changeLanguage, t, pick }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within LangProvider');
  }
  return context;
};
