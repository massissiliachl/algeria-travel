/**
 * Algeria Travel — Admin data store (localStorage)
 * Clés partagées avec le site public (booking-bridge + overrides React)
 */
(function (global) {
  const KEYS = {
    bookings: 'at_bookings',
    destinations: 'at_destinations',
    stays: 'at_stays',
    settings: 'at_settings',
    clients: 'at_clients',
    media: 'at_media',
    pages: 'at_pages',
    tours: 'at_circuits',
    activities: 'at_activities',
    mediaHidden: 'at_media_hidden',
    gallery: 'at_gallery',
    seeded: 'at_admin_seeded_v2',
  };

  /** Toutes les photos présentes dans le site (dossier public/) */
  const SITE_IMAGES = [
    ['/images/hero.jpeg', 'Hero accueil', 'home'],
    ['/images/heroaccueil.png', 'Hero accueil (variante)', 'home'],
    ['/images/home/acc-hotel.jpg', 'Accueil — Hôtel', 'home'],
    ['/images/home/circuits-4x4.png', 'Accueil — Circuits 4×4', 'home'],
    ['/images/home/dest-alger.jpg', 'Accueil — Alger', 'home'],
    ['/images/home/exp-culture.jpg', 'Accueil — Culture', 'home'],
    ['/images/home/news-coast.jpg', 'Accueil — Côte', 'home'],
    ['/images/galery.jpg', 'Galerie', 'home'],
    ['/images/visitekseurs.webp', 'Visiteurs', 'home'],
    ['/images/alger.jpeg', 'Alger', 'destination'],
    ['/images/bejaia.jpeg', 'Béjaïa', 'destination'],
    ['/images/djanet.jpeg', 'Djanet', 'destination'],
    ['/images/ghardaia.jpeg', 'Ghardaïa', 'destination'],
    ['/images/hogar.jpeg', 'Hoggar', 'destination'],
    ['/images/taghit.jpeg', 'Taghit', 'destination'],
    ['/images/tadrart-djanet.png', 'Tadrart — Djanet', 'destination'],
    ['/images/sahara1.jpeg', 'Sahara 1', 'destination'],
    ['/images/sahara2.jpeg', 'Sahara 2', 'destination'],
    ['/images/sahara3.jpeg', 'Sahara 3', 'destination'],
    ['/images/sahara4.jpeg', 'Sahara 4', 'destination'],
    ['/images/sahara5.jpeg', 'Sahara 5', 'destination'],
    ['/images/sahara6.jpeg', 'Sahara 6', 'destination'],
    ['/images/sahara7.jpeg', 'Sahara 7', 'destination'],
    ['/images/sahara8.jpeg', 'Sahara 8', 'destination'],
    ['/images/taghit-van-hero.png', 'Taghit — Van & dromadaire', 'taghit'],
    ['/images/taghit-sejour.png', 'Taghit — Le séjour', 'taghit'],
    ['/images/brezina-bivouac.png', 'Brezina — Bivouac (jour 1)', 'taghit'],
    ['/images/taghit-maison-hote.png', 'Taghit — Maison d’hôte (jour 2)', 'taghit'],
    ['/images/taghit-jour3.png', 'Taghit — Jour 3', 'taghit'],
    ['/images/taghit-jour5.png', 'Taghit — Jour 5', 'taghit'],
    ['/images/taghit-brezina.png', 'Taghit — Brezina', 'taghit'],
    ['/images/chameau.jpg', 'Dromadaire', 'activity'],
    ['/images/kayak.jpeg', 'Kayak', 'activity'],
    ['/images/quad.jpg', 'Quad', 'activity'],
    ['/images/quad1.jpeg', 'Quad 2', 'activity'],
    ['/images/quatre-quatre.jpg', '4×4', 'activity'],
    ['/images/maison-hote-sud-1.png', 'Maison d’hôte 1', 'stay'],
    ['/images/maison-hote-sud-2.png', 'Maison d’hôte 2', 'stay'],
    ['/images/maison-hote-sud-3.png.jpeg', 'Maison d’hôte 3', 'stay'],
    ['/images/maison-hote-sud-4.png.jpeg', 'Maison d’hôte 4', 'stay'],
    ['/images/maison-hote-sud-5.png.jpeg', 'Maison d’hôte 5', 'stay'],
    ['/images/maison-hote-sud-6.png.jpeg', 'Maison d’hôte 6', 'stay'],
    ['/images/maison-hote-sud-7.png.jpeg', 'Maison d’hôte 7', 'stay'],
    ['/images/hotels/royal-bejaia-1.jpg', 'Hôtel Royal Béjaïa 1', 'stay'],
    ['/images/hotels/royal-bejaia-2.jpg', 'Hôtel Royal Béjaïa 2', 'stay'],
    ['/images/hotels/royal-bejaia-3.jpg', 'Hôtel Royal Béjaïa 3', 'stay'],
    ['/images/hotels/zeriba-djanet-1.jpg', 'Hôtel Zeriba Djanet 1', 'stay'],
    ['/images/hotels/zeriba-djanet-2.jpg', 'Hôtel Zeriba Djanet 2', 'stay'],
    ['/images/hotels/belvedere-ghardaia.jpg', 'Hôtel Belvédère Ghardaïa', 'stay'],
    ['/images/hotels/le-rym-ghardaia.jpg', 'Hôtel Le Rym Ghardaïa', 'stay'],
    ['/images/hotels/tahat-1.jpg', 'Hôtel Tahat 1', 'stay'],
    ['/images/hotels/tahat-2.jpg', 'Hôtel Tahat 2', 'stay'],
    ['/images/hotels/tahat-3.jpg', 'Hôtel Tahat 3', 'stay'],
    ['/images/hotels/sheraton-oran.jpg', 'Sheraton Oran', 'stay'],
    ['/images/hotels/sheraton-oran-pool.jpg', 'Sheraton Oran — Piscine', 'stay'],
    ['/images/hotels/royal-oran.jpg', 'Royal Hotel Oran', 'stay'],
    ['/logo.png', 'Logo Algeria Travel', 'other'],
  ].map(([url, name, category]) => ({
    id: 'site_' + url.replace(/[^a-z0-9]+/gi, '_'),
    name,
    url,
    category,
    site: true,
  }));

  /** Photos affichées par défaut sur la page Galerie (mêmes que client/js/pages/gallery.js) */
  const SEED_GALLERY = [
    '/images/sahara1.jpeg', '/images/sahara2.jpeg', '/images/sahara3.jpeg', '/images/sahara4.jpeg',
    '/images/sahara5.jpeg', '/images/sahara6.jpeg', '/images/sahara7.jpeg', '/images/sahara8.jpeg',
    '/images/galery.jpg', '/images/quad.jpg', '/images/quad1.jpeg', '/images/quatre-quatre.jpg',
    '/images/chameau.jpg', '/images/kayak.jpeg', '/images/visitekseurs.webp',
  ].map((src, i) => ({ id: i + 1, src }));

  /**
   * Préfixe des images du site selon l’hébergement :
   * build React → /images, IONOS (client/) → /public/images, local → ../client/public/images
   */
  let imageBase = '';
  const BASE_CANDIDATES = ['', '/public', '../client/public', '../public', '../frontend/public'];

  function probeImageBase() {
    return new Promise((resolve) => {
      let i = 0;
      const next = () => {
        if (i >= BASE_CANDIDATES.length) return resolve(imageBase);
        const base = BASE_CANDIDATES[i++];
        const img = new Image();
        img.onload = () => {
          imageBase = base;
          resolve(base);
        };
        img.onerror = next;
        img.src = base + '/logo.png?probe=' + Date.now();
      };
      next();
    });
  }

  function src(url) {
    if (!url) return '';
    const u = String(url);
    if (u.startsWith('/') && !u.startsWith('//')) return imageBase + u;
    return u;
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  const SEED_DESTINATIONS = [
    { id: 'taghit', name: 'Taghit', tagline: 'Joyau du Grand Erg', price: 99990, bestTime: 'Octobre – Mars', image: '/images/taghit.jpeg', description: 'Oasis ocre au pied des dunes du Grand Erg occidental.', active: true },
    { id: 'bejaia', name: 'Béjaïa', tagline: 'Perle de la Kabylie', price: 25000, bestTime: 'Mai – Octobre', image: '/images/bejaia.jpeg', description: 'Mer turquoise, Cap Carbon et montagnes du Djurdjura.', active: true },
    { id: 'djanet', name: 'Djanet', tagline: 'Porte du Tassili', price: 85000, bestTime: 'Novembre – Février', image: '/images/djanet.jpeg', description: 'Art rupestre, dunes et bivouacs sous les étoiles.', active: true },
    { id: 'ghardaia', name: 'Ghardaïa', tagline: 'Vallée du M’Zab', price: 45000, bestTime: 'Octobre – Avril', image: '/images/ghardaia.jpeg', description: 'Architecture mozabite et oasis du M’Zab.', active: true },
    { id: 'hoggar', name: 'Hoggar', tagline: 'Montagnes du Sahara', price: 95000, bestTime: 'Novembre – Mars', image: '/images/hogar.jpeg', description: 'Massif volcanique et paysages lunaires.', active: true },
    { id: 'timimoun', name: 'Timimoun', tagline: 'Perle rouge du Sahara', price: 45000, bestTime: 'Octobre – Avril', image: '/images/sahara1.jpeg', description: 'Dunes rouges du Grand Erg Occidental.', active: true },
    { id: 'constantine', name: 'Constantine', tagline: 'Ville des ponts', price: 35000, bestTime: 'Mars – Novembre', image: '/images/constantine.jpeg', description: 'Ponts suspendus et patrimoine ottoman.', active: true },
  ];

  const SEED_STAYS = [
    { id: 'hotel-royal-bejaia', name: 'Hôtel Royal Béjaïa', type: 'hotel', placeId: 'bejaia', price: 14500, image: '/images/hotels/royal-bejaia-1.jpg', description: 'Hôtel au cœur de Béjaïa.', active: true },
    { id: 'hotel-zeriba-djanet', name: 'Hôtel Zeriba', type: 'hotel', placeId: 'djanet', price: 12000, image: '', description: '', active: true },
    { id: 'hotel-belvedere-ghardaia', name: 'Hôtel Belvédère', type: 'hotel', placeId: 'ghardaia', price: 13500, image: '', description: '', active: true },
    { id: 'hotel-le-rym-ghardaia', name: 'Hôtel Le Rym', type: 'hotel', placeId: 'ghardaia', price: 11000, image: '', description: '', active: true },
    { id: 'hotel-tahat', name: 'Hôtel Tahat', type: 'hotel', placeId: 'hoggar', price: 15500, image: '', description: '', active: true },
    { id: 'hotel-sheraton-oran', name: 'Sheraton Oran', type: 'hotel', placeId: 'oran', price: 22000, image: '', description: '', active: true },
    { id: 'hotel-royal-oran', name: 'Royal Hotel Oran', type: 'hotel', placeId: 'oran', price: 25000, image: '', description: '', active: true },
    { id: 'gh-taghit', name: 'Maison d’hôte authentique', type: 'guesthouse', placeId: 'taghit', price: 60000, image: '/images/maison-hote-sud-1.png', description: 'Pension complète · bus Mercedes.', active: true },
  ];

  const SEED_SETTINGS = {
    whatsapp: '213557664089',
    email: 'Algeria.travel@gmail.com',
    phone: '+213 557 66 40 89',
    siteName: 'Algeria Travel',
  };

  const SEED_PAGES = {
    home_brand: 'Algeria Travel',
    home_title_before: 'Découvrez',
    home_title_em: "l'Algérie",
    home_title_after: 'autrement',
    home_subtitle: 'Des paysages à couper le souffle, une culture millénaire et des expériences authentiques vous attendent.',
    home_cta: "Découvrir l'Algérie",
    home_hero_image: '/images/hero.jpeg',
    about_title: 'À propos',
    about_text: 'Voyages authentiques à travers l’Algérie — Sahara, mer et patrimoine.',
  };

  const SEED_MEDIA = [
    { id: 'img_hero', name: 'Hero accueil', url: '/images/hero.jpeg', category: 'home' },
    { id: 'img_taghit', name: 'Taghit', url: '/images/taghit.jpeg', category: 'destination' },
    { id: 'img_bejaia', name: 'Béjaïa', url: '/images/bejaia.jpeg', category: 'destination' },
    { id: 'img_djanet', name: 'Djanet', url: '/images/djanet.jpeg', category: 'destination' },
    { id: 'img_maison', name: 'Maison d’hôte', url: '/images/maison-hote-sud-1.png', category: 'stay' },
  ];

  /** Circuits du site (client/js/data/tours.js) — description vide = texte d’origine du site */
  const SEED_TOURS = [
    { id: 10, name: 'Tadrart Rouge — Djanet', subtitle: '6 jours et 6 nuits en bivouac · vols inclus', location: "Djanet, Tassili n'Ajjer", duration: '6 jours / 6 nuits', price: 94990, category: 'desert', image: '/images/tadrart-djanet.png', placeSlug: 'tadrart' },
    { id: 1, name: 'Timimoun', subtitle: 'Perle du Sahara', location: 'Gourara, Grand Sud', duration: '5 jours', price: 45000, category: 'desert', image: '/images/sahara1.jpeg', placeSlug: 'timimoun' },
    { id: 2, name: "Tassili n'Ajjer", subtitle: 'Patrimoine mondial UNESCO', location: 'Djanet, Sahara', duration: '8 jours', price: 85000, category: 'nature', image: '/images/djanet.jpeg', placeSlug: 'djanet' },
    { id: 3, name: 'Ghardaïa', subtitle: "Vallée du M'Zab", location: "Vallée du M'Zab", duration: '4 jours', price: 35000, category: 'culture', image: '/images/ghardaia.jpeg', placeSlug: 'ghardaia' },
    { id: 4, name: 'Béjaïa', subtitle: 'Mer & Montagne', location: 'Béjaïa, Méditerranée', duration: '3 jours', price: 25000, category: 'nature', image: '/images/bejaia.jpeg', placeSlug: 'bejaia' },
    { id: 5, name: 'Le Hoggar', subtitle: 'Au cœur du désert', location: 'Tamanrasset, Sahara', duration: '9 jours', price: 95000, category: 'desert', image: '/images/hogar.jpeg', placeSlug: 'hoggar' },
    { id: 6, name: 'Constantine', subtitle: 'Ville des ponts', location: 'Constantine, Nord-Est', duration: '3 jours', price: 22000, category: 'culture', image: '/images/alger.jpeg', placeSlug: 'constantine' },
    { id: 7, name: 'Taghit — Hôtel 4★', subtitle: 'Voyage coup de cœur · vol inclus', location: 'Taghit, Béchar', duration: 'Pension complète', price: 99990, category: 'desert', image: '/images/taghit.jpeg', placeSlug: 'taghit' },
    { id: 8, name: 'Taghit — Maison d’hôte', subtitle: 'Voyage coup de cœur · bus Mercedes', location: 'Taghit, Béchar', duration: 'Pension complète', price: 60000, category: 'desert', image: '/images/taghit.jpeg', placeSlug: 'taghit' },
    { id: 9, name: 'Taghit via Brezina', subtitle: '5 jours / 4 nuits · Van Mercedes VIP', location: 'Brezina → Taghit, Béchar', duration: '5 jours / 4 nuits', price: 0, priceOnRequest: true, category: 'desert', image: '/images/taghit-brezina.png', placeSlug: 'taghit' },
  ].map((t) => ({ description: '', priceOnRequest: false, active: true, ...t }));

  const SEED_ACTIVITIES = [
    { id: 'quad', name: 'Quad', price: 8000, description: 'Sensation et liberté sur les dunes en quad.', image: '', active: true },
    { id: '4x4', name: '4×4', price: 12000, description: 'Excursion 4×4 dans le désert.', image: '', active: true },
    { id: 'camel', name: 'Dromadaire', price: 5000, description: 'Balade à dos de dromadaire.', image: '', active: true },
    { id: 'kayak', name: 'Kayak', price: 6000, description: 'Kayak sur la côte.', image: '', active: true },
  ];

  function ensureKey(key, seed) {
    if (!localStorage.getItem(key)) write(key, seed);
  }

  function ensureSeed() {
    ensureKey(KEYS.destinations, SEED_DESTINATIONS);
    ensureKey(KEYS.stays, SEED_STAYS);
    ensureKey(KEYS.settings, SEED_SETTINGS);
    ensureKey(KEYS.bookings, []);
    ensureKey(KEYS.clients, []);
    ensureKey(KEYS.media, SEED_MEDIA);
    ensureKey(KEYS.pages, SEED_PAGES);
    ensureKey(KEYS.tours, SEED_TOURS);
    ensureKey(KEYS.activities, SEED_ACTIVITIES);
    localStorage.setItem(KEYS.seeded, '1');
  }

  function upsertList(getter, saver, item, idField) {
    const list = getter();
    const i = list.findIndex((x) => x[idField] === item[idField]);
    if (i >= 0) list[i] = { ...list[i], ...item };
    else list.push(item);
    saver(list);
    return item;
  }

  const Store = {
    keys: KEYS,
    uid,
    ensureSeed,

    getBookings() { return read(KEYS.bookings, []); },
    saveBookings(list) { write(KEYS.bookings, list); },
    addBooking(data) {
      const list = Store.getBookings();
      const booking = {
        id: uid('bk'),
        status: 'new',
        notes: '',
        createdAt: new Date().toISOString(),
        ...data,
      };
      list.unshift(booking);
      Store.saveBookings(list);
      Store.syncClientFromBooking(booking);
      return booking;
    },
    updateBooking(id, patch) {
      const list = Store.getBookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
      Store.saveBookings(list);
      const b = list.find((x) => x.id === id);
      if (b) Store.syncClientFromBooking(b);
      return b;
    },
    deleteBooking(id) {
      Store.saveBookings(Store.getBookings().filter((b) => b.id !== id));
    },

    getDestinations() { return read(KEYS.destinations, SEED_DESTINATIONS); },
    saveDestinations(list) { write(KEYS.destinations, list); },
    upsertDestination(dest) {
      return upsertList(Store.getDestinations, Store.saveDestinations, dest, 'id');
    },
    deleteDestination(id) {
      Store.saveDestinations(Store.getDestinations().filter((d) => d.id !== id));
    },

    getStays() { return read(KEYS.stays, SEED_STAYS); },
    saveStays(list) { write(KEYS.stays, list); },
    upsertStay(stay) {
      return upsertList(Store.getStays, Store.saveStays, stay, 'id');
    },

    getSettings() { return { ...SEED_SETTINGS, ...read(KEYS.settings, {}) }; },
    saveSettings(settings) { write(KEYS.settings, settings); },

    getPages() { return { ...SEED_PAGES, ...read(KEYS.pages, {}) }; },
    savePages(pages) { write(KEYS.pages, pages); },

    src,
    probeImageBase,
    siteImages: SITE_IMAGES,

    /** Photos de la page Galerie du site */
    getGallery() { return read(KEYS.gallery, SEED_GALLERY); },
    saveGallery(list) {
      try {
        write(KEYS.gallery, list);
        return true;
      } catch {
        return false;
      }
    },
    addGalleryImages(srcs) {
      const list = Store.getGallery();
      let nextId = list.reduce((max, g) => Math.max(max, Number(g.id) || 0), 0) + 1;
      const added = srcs.filter(Boolean).map((src) => ({ id: nextId++, src }));
      return Store.saveGallery([...added, ...list]) ? added.length : -1;
    },
    updateGalleryImage(id, src, position) {
      const list = Store.getGallery();
      const from = list.findIndex((g) => String(g.id) === String(id));
      if (from < 0) return false;
      const [item] = list.splice(from, 1);
      if (src) item.src = src;
      const to = Math.max(0, Math.min(list.length, position == null ? from : position));
      list.splice(to, 0, item);
      return Store.saveGallery(list);
    },
    deleteGalleryImage(id) {
      Store.saveGallery(Store.getGallery().filter((g) => String(g.id) !== String(id)));
    },
    resetGallery() { localStorage.removeItem(KEYS.gallery); },

    /** Images ajoutées par l’admin + toutes les photos du site (sauf celles supprimées) */
    getMedia() {
      const own = Store.getOwnMedia();
      const hidden = read(KEYS.mediaHidden, []);
      const seen = new Set(own.map((m) => m.url));
      const site = SITE_IMAGES.filter((m) => !seen.has(m.url) && !hidden.includes(m.id));
      return [...own, ...site];
    },
    getOwnMedia() { return read(KEYS.media, SEED_MEDIA); },
    saveMedia(list) { write(KEYS.media, list); },
    addMedia(item) {
      const list = Store.getOwnMedia();
      const media = { id: uid('img'), createdAt: new Date().toISOString(), ...item };
      list.unshift(media);
      Store.saveMedia(list);
      return media;
    },
    deleteMedia(id) {
      if (String(id).startsWith('site_')) {
        const hidden = read(KEYS.mediaHidden, []);
        if (!hidden.includes(id)) hidden.push(id);
        write(KEYS.mediaHidden, hidden);
        return;
      }
      Store.saveMedia(Store.getOwnMedia().filter((m) => m.id !== id));
    },
    hiddenSiteMediaCount() { return read(KEYS.mediaHidden, []).length; },
    restoreSiteMedia() { write(KEYS.mediaHidden, []); },

    getTours() { return read(KEYS.tours, SEED_TOURS); },
    saveTours(list) { write(KEYS.tours, list); },
    upsertTour(tour) {
      const list = Store.getTours();
      const i = list.findIndex((x) => String(x.id) === String(tour.id));
      if (i >= 0) list[i] = { ...list[i], ...tour };
      else list.unshift(tour);
      Store.saveTours(list);
      return tour;
    },
    deleteTour(id) {
      Store.saveTours(Store.getTours().filter((t) => String(t.id) !== String(id)));
    },
    resetTours() { localStorage.removeItem(KEYS.tours); },

    getActivities() { return read(KEYS.activities, SEED_ACTIVITIES); },
    saveActivities(list) { write(KEYS.activities, list); },
    upsertActivity(act) {
      return upsertList(Store.getActivities, Store.saveActivities, act, 'id');
    },
    deleteActivity(id) {
      Store.saveActivities(Store.getActivities().filter((a) => a.id !== id));
    },

    getClients() { return read(KEYS.clients, []); },
    saveClients(list) { write(KEYS.clients, list); },
    upsertClient(client) {
      const list = Store.getClients();
      const key = (client.email || '').toLowerCase().trim();
      const i = list.findIndex((c) => (c.email || '').toLowerCase() === key && key);
      if (i >= 0) list[i] = { ...list[i], ...client, updatedAt: new Date().toISOString() };
      else list.unshift({ id: uid('cl'), createdAt: new Date().toISOString(), ...client });
      Store.saveClients(list);
      return list[i >= 0 ? i : 0];
    },
    deleteClient(id) {
      Store.saveClients(Store.getClients().filter((c) => c.id !== id));
    },
    syncClientFromBooking(b) {
      if (!b?.email && !b?.phone) return;
      const existing = Store.getClients().find(
        (c) =>
          (b.email && c.email && c.email.toLowerCase() === b.email.toLowerCase()) ||
          (b.phone && c.phone && c.phone === b.phone)
      );
      Store.upsertClient({
        id: existing?.id,
        name: b.name || existing?.name || '',
        email: b.email || existing?.email || '',
        phone: b.phone || existing?.phone || '',
        notes: existing?.notes || '',
        lastDestination: b.destination || existing?.lastDestination || '',
        bookingsCount: (existing?.bookingsCount || 0) + (existing ? 0 : 1),
      });
      // recount
      const email = (b.email || '').toLowerCase();
      if (!email) return;
      const count = Store.getBookings().filter((x) => (x.email || '').toLowerCase() === email).length;
      const list = Store.getClients();
      const i = list.findIndex((c) => (c.email || '').toLowerCase() === email);
      if (i >= 0) {
        list[i].bookingsCount = count;
        list[i].lastDestination = b.destination || list[i].lastDestination;
        Store.saveClients(list);
      }
    },
    rebuildClientsFromBookings() {
      const map = {};
      Store.getBookings().forEach((b) => {
        const key = (b.email || b.phone || '').toLowerCase();
        if (!key) return;
        if (!map[key]) {
          map[key] = {
            id: uid('cl'),
            name: b.name || '',
            email: b.email || '',
            phone: b.phone || '',
            notes: '',
            lastDestination: b.destination || '',
            bookingsCount: 0,
            createdAt: b.createdAt || new Date().toISOString(),
          };
        }
        map[key].bookingsCount += 1;
        map[key].name = b.name || map[key].name;
        map[key].lastDestination = b.destination || map[key].lastDestination;
      });
      Store.saveClients(Object.values(map));
    },

    stats() {
      const bookings = Store.getBookings();
      return {
        bookingsTotal: bookings.length,
        bookingsNew: bookings.filter((b) => b.status === 'new').length,
        destinations: Store.getDestinations().filter((d) => d.active !== false).length,
        stays: Store.getStays().filter((s) => s.active !== false).length,
        clients: Store.getClients().length,
        media: Store.getGallery().length,
      };
    },
  };

  global.ATStore = Store;
})(window);
