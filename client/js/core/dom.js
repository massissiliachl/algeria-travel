const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Échappe un texte pour l'insérer dans du HTML (contenu ou attribut). */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** Chemin d'un fichier public depuis client/pages/ ("/images/x.jpg" → "../public/images/x.jpg"). */
const API_ORIGIN = 'https://algeria-travelbackend-9hpl.onrender.com';

export const asset = (src) => {
  if (!src || typeof src !== 'string') return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/images/cms/') || src.startsWith('/uploads/')) {
    const path = src.startsWith('/uploads/') ? src.replace(/^\/uploads\//, '/images/cms/') : src;
    return API_ORIGIN + path;
  }
  return /^\/(?!\/)/.test(src) ? `../public${src}` : src;
};

/** Concatène des classes CSS en ignorant les valeurs vides. */
export const cx = (...classes) => classes.filter(Boolean).join(' ');

/** Rend une liste en HTML. */
export const list = (items, fn) => (items || []).map(fn).join('');
