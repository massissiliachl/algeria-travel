/** Lecture des contenus gérés par l’admin (localStorage) */

const readJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const getAdminPages = () => readJson('at_pages', null);

export const getAdminPageValue = (key, fallback = '') => {
  const pages = getAdminPages();
  if (!pages || pages[key] == null || pages[key] === '') return fallback;
  return pages[key];
};

