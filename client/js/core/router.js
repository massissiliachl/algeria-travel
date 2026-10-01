import { getPlacePathFromTourId } from '../data/placeRoutes.js';

const SIMPLE = {
  '/': '../',
  '/destinations': 'destinations.html',
  '/activities': 'activities.html',
  '/stays': 'stays.html',
  '/tours': 'tours.html',
  '/blog': 'blog.html',
  '/search': 'search.html',
  '/gallery': 'gallery.html',
  '/contact': 'contact.html',
  '/InfoDestination': 'destinations.html',
};

const withFirst = (key, value, rest) => {
  const out = new URLSearchParams();
  out.set(key, value);
  rest.forEach((v, k) => {
    if (k !== key) out.append(k, v);
  });
  return out;
};

/**
 * Convertit une route du site React ("/place/taghit?pkg=hotel", "/blog/slug"…)
 * en URL de page HTML ("place.html?id=taghit&pkg=hotel", "article.html?slug=…").
 */
export function href(route) {
  if (route == null || route === '') return '#';
  const s = String(route);
  if (/^(https?:|mailto:|tel:|#|data:|\.\.\/)/.test(s) || /\.html(\?|#|$)/.test(s)) return s;

  const [beforeHash, hash = ''] = s.split('#');
  const [rawPath, query = ''] = beforeHash.split('?');
  const pathname = rawPath.replace(/\/+$/, '') || '/';
  let qs = new URLSearchParams(query);
  let page = SIMPLE[pathname];
  let m;

  if (!page && (m = pathname.match(/^\/place\/([^/]+)$/))) {
    page = 'place.html';
    qs = withFirst('id', decodeURIComponent(m[1]), qs);
  } else if (!page && (m = pathname.match(/^\/activity\/([^/]+)$/))) {
    page = 'activity.html';
    qs = withFirst('id', decodeURIComponent(m[1]), qs);
  } else if (!page && (m = pathname.match(/^\/blog\/([^/]+)$/))) {
    page = 'article.html';
    qs = withFirst('slug', decodeURIComponent(m[1]), qs);
  } else if (!page && (pathname === '/hotels' || pathname === '/guesthouses')) {
    page = 'stays.html';
    qs = withFirst('view', pathname.slice(1), qs);
  } else if (!page && (m = pathname.match(/^\/destination\/([^/]+)$/))) {
    return href(getPlacePathFromTourId(decodeURIComponent(m[1])));
  }

  if (!page) page = '../';
  const search = qs.toString();
  return page + (search ? `?${search}` : '') + (hash ? `#${hash}` : '');
}

/** Navigue vers une route React (ou une URL). navigate(-1) revient en arrière. */
export function navigate(route, { replace = false } = {}) {
  if (route === -1) {
    window.history.back();
    return;
  }
  const url = href(route);
  if (replace) window.location.replace(url);
  else window.location.assign(url);
}

/** Paramètres de l'URL courante. */
export const params = () => new URLSearchParams(window.location.search);
