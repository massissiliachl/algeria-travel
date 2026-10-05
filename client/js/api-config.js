/**
 * Backend Algeria Travel (Node + Supabase) — partagé par le site public et /admin/.
 * Expose window.AT_API : adresse, identifiant visiteur, requêtes et conversions de format.
 */
(function (global) {
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  /** En local uniquement : localStorage.at_api_base = 'http://localhost:5000/api' pour tester un backend local */
  const BASE = (LOCAL && localStorage.getItem('at_api_base')) || 'https://algeria-travelbackend-9hpl.onrender.com/api';
  /** Relais PHP sur IONOS, utilisé si le navigateur bloque l’appel direct (CORS non autorisé sur Render) */
  const PROXY = new URL('../api/proxy.php', document.currentScript?.src || location.href).href;
  const ON_IONOS = /(^|\.)algeriatravel\.(org|com)$/i.test(location.hostname);
  let useProxy = ON_IONOS && sessionStorage.getItem('at_api_proxy') === '1';
  const CLIENT_KEY = 'at_client_id';
  const ADMIN_KEY = 'at_admin_key';

  function uuid() {
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /** Identifiant anonyme du visiteur (likes, commentaires) */
  function clientId() {
    try {
      let id = localStorage.getItem(CLIENT_KEY);
      if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
        id = uuid();
        localStorage.setItem(CLIENT_KEY, id);
      }
      return id;
    } catch {
      return uuid();
    }
  }

  function adminKey() {
    return sessionStorage.getItem(ADMIN_KEY) || '';
  }

  /**
   * Requête JSON vers le backend. Renvoie { ok, status, data } ; lève une erreur si le serveur est injoignable.
   * Le serveur gratuit Render peut mettre ~50 s à se réveiller : prévoir un timeout large.
   */
  async function request(path, options = {}) {
    if (useProxy) return send(PROXY + '?p=' + encodeURIComponent(path), options);
    try {
      return await send(BASE + path, options);
    } catch (err) {
      if (!ON_IONOS || err.name === 'AbortError') throw err;
      useProxy = true;
      sessionStorage.setItem('at_api_proxy', '1');
      return send(PROXY + '?p=' + encodeURIComponent(path), options);
    }
  }

  async function send(url, { method = 'GET', body, admin = false, token = '', timeout = 60000, keepalive = false } = {}) {
    const headers = { 'x-favorite-client': clientId() };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (admin) headers['x-admin-key'] = adminKey();
    if (token) headers.Authorization = `Bearer ${token}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        signal: controller.signal,
        keepalive,
      });
      const data = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, data };
    } finally {
      clearTimeout(timer);
    }
  }

  const list = (v) => (Array.isArray(v) ? v : []);

  /** Format Supabase → format utilisé par le site et l’admin (clés localStorage at_*) */
  const toLocal = {
    destinations: (rows) =>
      list(rows).map((p) => ({
        id: p.id,
        name: p.name || '',
        tagline: p.tagline || '',
        price: Number(p.price) || 0,
        bestTime: p.bestTime || '',
        image: p.image || '',
        gallery: list(p.gallery),
        description: p.description || '',
        active: p.published !== false,
        bookingOpen: Boolean(p.bookingOpen),
        synced: true,
      })),
    circuits: (rows) =>
      list(rows).map((t) => ({
        id: t.id,
        name: t.name || '',
        subtitle: t.subtitle || '',
        location: t.location || '',
        duration: t.duration || '',
        price: Number(t.price) || 0,
        priceOnRequest: !Number(t.price),
        category: t.category || 'desert',
        image: t.image || '',
        placeSlug: t.placeSlug || '',
        pkg: t.pkg || '',
        description: t.description || '',
        active: t.published !== false,
      })),
    activities: (rows) =>
      list(rows).map((a) => ({
        id: a.id,
        name: a.name || '',
        nameEn: a.nameEn || '',
        nameAr: a.nameAr || '',
        price: Number(a.price) || 0,
        category: a.category || 'adventure',
        filters: list(a.filters),
        places: list(a.places),
        tours: list(a.tags?.tours).map(String),
        tagLabels: Object.fromEntries(Object.entries(a.tags || {}).filter(([k]) => k !== 'tours')),
        description: a.desc || '',
        descriptionEn: a.descEn || '',
        descriptionAr: a.descAr || '',
        image: a.image || '',
        active: a.published !== false,
      })),
    gallery: (rows) =>
      list(rows).map((g) => ({
        id: g.id,
        src: g.src,
        alt: g.alt || '',
        active: g.published !== false,
        likes: Number(g.likes) || 0,
        dislikes: Number(g.dislikes) || 0,
      })),
  };

  /** Format admin → corps attendu par /api/admin/<ressource> */
  const toApi = {
    destinations: (d) => ({
      id: d.id,
      name: d.name,
      tagline: d.tagline || '',
      price: Number(d.price) || 0,
      bestTime: d.bestTime || '',
      image: d.image || '',
      gallery: list(d.gallery),
      description: d.description || '',
      published: d.active !== false,
      bookingOpen: Boolean(d.bookingOpen),
    }),
    circuits: (t) => ({
      name: t.name,
      subtitle: t.subtitle || '',
      location: t.location || '',
      duration: t.duration || '',
      price: t.priceOnRequest ? 0 : Number(t.price) || 0,
      category: t.category || 'desert',
      image: t.image || '',
      placeSlug: t.placeSlug || '',
      pkg: t.pkg || '',
      description: t.description || '',
      published: t.active !== false,
    }),
    activities: (a) => ({
      id: a.id,
      name: a.name,
      price: Number(a.price) || 0,
      category: a.category || 'adventure',
      filters: list(a.filters),
      places: list(a.places),
      tags: { ...(a.tagLabels || {}), tours: list(a.tours).map(String) },
      desc: a.description || '',
      image: a.image || '',
      published: a.active !== false,
    }),
    gallery: (g, index) => ({
      src: g.src,
      alt: g.alt || '',
      sortOrder: index,
      published: g.active !== false,
    }),
  };

  /** Ressources du backend correspondant aux clés localStorage publiées */
  const RESOURCES = {
    at_destinations: { path: 'places', type: 'destinations' },
    at_circuits: { path: 'tours', type: 'circuits' },
    at_activities: { path: 'activities', type: 'activities' },
    at_gallery: { path: 'gallery', type: 'gallery' },
  };

  global.AT_API = { base: BASE, clientId, adminKey, ADMIN_KEY, request, toLocal, toApi, RESOURCES };
})(window);
