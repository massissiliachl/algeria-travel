/**
 * Inventaire des pages Algeria Travel — utilisé par les tests E2E.
 * Ajoutez une ligne ici quand vous créez une nouvelle route.
 *
 * expectSelector : élément visible qui prouve que la page a chargé.
 * La plupart des pages utilisent Navbar (nav), pas <main>.
 */

const NAV = 'nav';

/** Pages listes / statiques */
export const STATIC_PAGES = [
  { path: '/', name: 'Accueil', expectSelector: 'main, nav' },
  { path: '/destinations', name: 'Destinations', expectSelector: NAV },
  { path: '/activities', name: 'Activités', expectSelector: NAV },
  { path: '/tours', name: 'Circuits', expectSelector: NAV },
  { path: '/stays', name: 'Hébergements', expectSelector: NAV },
  { path: '/hotels', name: 'Hôtels', expectSelector: '#hotels-results, .htl-page' },
  { path: '/guesthouses', name: 'Maisons d\'hôtes', expectSelector: NAV },
  { path: '/blog', name: 'Blog', expectSelector: NAV },
  { path: '/gallery', name: 'Galerie', expectSelector: 'main.gal-body, nav' },
  { path: '/contact', name: 'Contact', expectSelector: NAV },
  { path: '/privacy', name: 'Confidentialité', expectSelector: NAV },
  { path: '/suivi', name: 'Suivi réservation', expectSelector: NAV },
  { path: '/search?q=alger', name: 'Recherche', expectSelector: NAV },
];

/** Pages détail — 1 exemple par type */
export const DETAIL_PAGES = [
  { path: '/place/bejaia', name: 'Destination Béjaïa', expectSelector: NAV },
  { path: '/activity/quad', name: 'Activité Quad', expectSelector: NAV },
  { path: '/hotels/hotel-royal-bejaia', name: 'Hôtel Royal Béjaïa', expectSelector: '.htl-detail, .hotel-detail-page' },
  { path: '/blog/timgad-coucher-soleil', name: 'Article blog', expectSelector: NAV },
];

/** Redirections attendues */
export const REDIRECT_PAGES = [
  { path: '/InfoDestination', expectPath: '/destinations' },
];
