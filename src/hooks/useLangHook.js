import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from '../i18n/fr.json';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';

const translations = { fr, en, ar };
const RTL_LANGS = ['ar'];

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGS.includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key) => {
    const langObj = translations[language];
    if (langObj && typeof langObj[key] !== 'undefined') return langObj[key];
    if (translations.fr && typeof translations.fr[key] !== 'undefined') return translations.fr[key];
    return key;
  };

  const pick = (frText, enText, arText) => {
    if (language === 'en') return enText;
    if (language === 'ar') return arText ?? frText;
    return frText;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) setLanguage(lang);
  };

  const isRTL = RTL_LANGS.includes(language);

  return (
    <LangContext.Provider value={{ language, changeLanguage, t, pick, isRTL }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang must be used within LangProvider');
  return context;
};
