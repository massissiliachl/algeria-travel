import fr from '../i18n/fr.js';
import en from '../i18n/en.js';
import ar from '../i18n/ar.js';

const translations = { fr, en, ar };
const RTL_LANGS = ['ar'];
const listeners = new Set();

const readLang = () => {
  try {
    const saved = localStorage.getItem('language');
    return translations[saved] ? saved : 'fr';
  } catch {
    return 'fr';
  }
};

let language = readLang();

const applyDocumentLang = () => {
  document.documentElement.lang = language;
  document.documentElement.dir = RTL_LANGS.includes(language) ? 'rtl' : 'ltr';
};
applyDocumentLang();

export const getLang = () => language;

export const isRTL = () => RTL_LANGS.includes(language);

export const t = (key) => {
  const langObj = translations[language];
  if (langObj && typeof langObj[key] !== 'undefined') return langObj[key];
  if (typeof translations.fr[key] !== 'undefined') return translations.fr[key];
  return key;
};

export const pick = (frText, enText, arText) => {
  if (language === 'en') return enText;
  if (language === 'ar') return arText ?? frText;
  return frText;
};

export const setLang = (lang) => {
  if (!translations[lang] || lang === language) return;
  language = lang;
  try {
    localStorage.setItem('language', lang);
  } catch {
    /* stockage indisponible */
  }
  applyDocumentLang();
  listeners.forEach((fn) => fn(lang));
};

export const onLangChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
