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
        nameEn: p.nameEn || '',
        nameAr: p.nameAr || '',
        tagline: p.tagline || '',
        taglineEn: p.taglineEn || '',
        taglineAr: p.taglineAr || '',
        price: Number(p.price) || 0,
        bestTime: p.bestTime || '',
        bestTimeEn: p.bestTimeEn || '',
        bestTimeAr: p.bestTimeAr || '',
        image: p.image || '',
        gallery: list(p.gallery),
        description: p.description || '',
        descriptionEn: p.descriptionEn || '',
        descriptionAr: p.descriptionAr || '',
        active: p.published !== false,
        archived: Boolean(p.archivedAt),
        archivedAt: p.archivedAt || '',
        bookingOpen: Boolean(p.bookingOpen),
        synced: true,
      })),
    circuits: (rows) =>
      list(rows).map((t) => ({
        id: t.id,
        name: t.name || '',
        nameEn: t.nameEn || '',
        nameAr: t.nameAr || '',
        subtitle: t.subtitle || '',
        subtitleEn: t.subtitleEn || '',
        subtitleAr: t.subtitleAr || '',
        location: t.location || '',
        locationEn: t.locationEn || '',
        locationAr: t.locationAr || '',
        duration: t.duration || '',
        durationEn: t.durationEn || '',
        durationAr: t.durationAr || '',
        price: Number(t.price) || 0,
        priceOnRequest: !Number(t.price),
        category: t.category || 'desert',
        image: t.image || '',
        placeSlug: t.placeSlug || '',
        pkg: t.pkg || '',
        description: t.description || '',
        descriptionEn: t.descriptionEn || '',
        descriptionAr: t.descriptionAr || '',
        priceTiers: Array.isArray(t.priceTiers) ? t.priceTiers : null,
        priceChild: Array.isArray(t.priceTiers) && t.priceTiers[1] ? Number(t.priceTiers[1].price) || 0 : 0,
        priceInfant: Array.isArray(t.priceTiers) && t.priceTiers[2] ? Number(t.priceTiers[2].price) || 0 : 0,
        active: t.published !== false,
        archived: Boolean(t.archivedAt),
        archivedAt: t.archivedAt || '',
        bookingOpen: t.bookingOpen !== false,
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
        archived: Boolean(a.archivedAt),
        archivedAt: a.archivedAt || '',
      })),
    gallery: (rows) =>
      list(rows).map((g) => ({
        id: g.id,
        src: g.src,
        alt: g.alt || '',
        active: g.published !== false,
        archived: Boolean(g.archivedAt),
        likes: Number(g.likes) || 0,
        dislikes: Number(g.dislikes) || 0,
      })),
  };

  /** Format admin → corps attendu par /api/admin/<ressource> */
  const toApi = {
    destinations: (d) => ({
      id: d.id,
      name: d.name,
      ...(d.nameEn ? { nameEn: d.nameEn } : {}),
      ...(d.nameAr ? { nameAr: d.nameAr } : {}),
      tagline: d.tagline || '',
      ...(d.taglineEn ? { taglineEn: d.taglineEn } : {}),
      ...(d.taglineAr ? { taglineAr: d.taglineAr } : {}),
      price: Number(d.price) || 0,
      bestTime: d.bestTime || '',
      ...(d.bestTimeEn ? { bestTimeEn: d.bestTimeEn } : {}),
      ...(d.bestTimeAr ? { bestTimeAr: d.bestTimeAr } : {}),
      image: d.image || '',
      gallery: list(d.gallery),
      description: d.description || '',
      ...(d.descriptionEn ? { descriptionEn: d.descriptionEn } : {}),
      ...(d.descriptionAr ? { descriptionAr: d.descriptionAr } : {}),
      published: d.active !== false,
      ...(typeof d.archived === 'boolean' ? { archived: d.archived } : {}),
      bookingOpen: Boolean(d.bookingOpen),
    }),
    circuits: (t) => ({
      name: t.name,
      ...(t.nameEn ? { nameEn: t.nameEn } : {}),
      ...(t.nameAr ? { nameAr: t.nameAr } : {}),
      subtitle: t.subtitle || '',
      ...(t.subtitleEn ? { subtitleEn: t.subtitleEn } : {}),
      ...(t.subtitleAr ? { subtitleAr: t.subtitleAr } : {}),
      location: t.location || '',
      ...(t.locationEn ? { locationEn: t.locationEn } : {}),
      ...(t.locationAr ? { locationAr: t.locationAr } : {}),
      duration: t.duration || '',
      ...(t.durationEn ? { durationEn: t.durationEn } : {}),
      ...(t.durationAr ? { durationAr: t.durationAr } : {}),
      price: t.priceOnRequest ? 0 : Number(t.price) || 0,
      category: t.category || 'desert',
      image: t.image || '',
      placeSlug: t.placeSlug || '',
      pkg: t.pkg || '',
      description: t.description || '',
      ...(t.descriptionEn ? { descriptionEn: t.descriptionEn } : {}),
      ...(t.descriptionAr ? { descriptionAr: t.descriptionAr } : {}),
      published: t.active !== false,
      ...(typeof t.archived === 'boolean' ? { archived: t.archived } : {}),
      bookingOpen: t.bookingOpen !== false,
      ...(Array.isArray(t.priceTiers) && t.priceTiers.length
        ? { priceTiers: t.priceTiers }
        : t.priceChild || t.priceInfant
          ? {
              priceTiers: [
                { fr: '+ 10 ans', en: 'Over 10', ar: 'أكثر من 10 سنوات', price: t.priceOnRequest ? 0 : Number(t.price) || 0 },
                { fr: 'De 2 à 10 ans', en: '2 to 10 years', ar: 'من 2 إلى 10 سنوات', price: Number(t.priceChild) || 0 },
                { fr: '- 2 ans', en: 'Under 2', ar: 'أقل من سنتين', price: Number(t.priceInfant) || 0 },
              ],
            }
          : {}),
    }),
    activities: (a) => ({
      id: a.id,
      name: a.name,
      ...(a.nameEn ? { nameEn: a.nameEn } : {}),
      ...(a.nameAr ? { nameAr: a.nameAr } : {}),
      price: Number(a.price) || 0,
      category: a.category || 'adventure',
      filters: list(a.filters),
      places: list(a.places),
      tags: { ...(a.tagLabels || {}), tours: list(a.tours).map(String) },
      desc: a.description || '',
      ...(a.descriptionEn ? { descEn: a.descriptionEn } : {}),
      ...(a.descriptionAr ? { descAr: a.descriptionAr } : {}),
      image: a.image || '',
      published: a.active !== false,
      ...(typeof a.archived === 'boolean' ? { archived: a.archived } : {}),
    }),
    gallery: (g, index) => ({
      src: g.src,
      alt: g.alt || '',
      sortOrder: index,
      published: g.active !== false,
      ...(typeof g.archived === 'boolean' ? { archived: g.archived } : {}),
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

  /** Reprend le catalogue publié (destinations, activités, circuits) pour tout le site, y compris l’accueil. */
  const CATALOG = [
    ['at_destinations', '/places', 'destinations'],
    ['at_activities', '/activities', 'activities'],
    ['at_circuits', '/tours', 'circuits'],
  ];

  async function refreshCatalog() {
    if (adminKey()) return;
    let changed = false;
    await Promise.all(
      CATALOG.map(async ([key, path, type]) => {
        try {
          const res = await request(path, { timeout: 20000 });
          const rows = Array.isArray(res.data) ? res.data : res.data?.items;
          if (!res.ok || !Array.isArray(rows)) return;
          const next = JSON.stringify(toLocal[type](rows));
          if (localStorage.getItem(key) !== next) {
            localStorage.setItem(key, next);
            changed = true;
          }
        } catch {
          /* le site garde le dernier catalogue connu */
        }
      })
    );
    if (!changed) return;
    global.__atCatalogVersion = (global.__atCatalogVersion || 0) + 1;
    global.dispatchEvent(new Event('at-catalog'));
  }

  refreshCatalog();
})(window);
