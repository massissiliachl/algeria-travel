/**
 * Contenus publiés par l’admin (galerie, circuits, destinations, activités) : récupérés sur le serveur
 * avant que les pages ne lisent localStorage. Sans serveur PHP (dev local), rien ne change.
 */

const API = new URL('../../api/content.php', import.meta.url);
const KEYS = ['at_gallery', 'at_circuits', 'at_destinations', 'at_activities'];

try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  const res = await fetch(API, { cache: 'no-store', signal: controller.signal });
  clearTimeout(timer);
  const data = res.ok ? await res.json() : null;
  if (data && typeof data.content === 'object' && data.content) {
    KEYS.forEach((key) => {
      if (key in data.content) localStorage.setItem(key, JSON.stringify(data.content[key]));
      else localStorage.removeItem(key);
    });
  }
} catch {
  /* serveur indisponible : on garde les données locales */
}
