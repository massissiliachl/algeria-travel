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
    tours: 'at_tours',
    activities: 'at_activities',
    seeded: 'at_admin_seeded_v2',
  };

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

  const SEED_TOURS = [
    { id: 'tour-taghit-hotel', name: 'Taghit — Hôtel 4★', destination: 'Taghit', price: 99990, description: 'Pension complète, vol Alger–Béchar–Alger, activités.', image: '/images/taghit.jpeg', active: true },
    { id: 'tour-taghit-guest', name: 'Taghit — Maison d’hôte', destination: 'Taghit', price: 60000, description: 'Maison d’hôte, bus Mercedes, activités.', image: '/images/taghit.jpeg', active: true },
  ];

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

    getMedia() { return read(KEYS.media, SEED_MEDIA); },
    saveMedia(list) { write(KEYS.media, list); },
    addMedia(item) {
      const list = Store.getMedia();
      const media = { id: uid('img'), createdAt: new Date().toISOString(), ...item };
      list.unshift(media);
      Store.saveMedia(list);
      return media;
    },
    deleteMedia(id) {
      Store.saveMedia(Store.getMedia().filter((m) => m.id !== id));
    },

    getTours() { return read(KEYS.tours, SEED_TOURS); },
    saveTours(list) { write(KEYS.tours, list); },
    upsertTour(tour) {
      return upsertList(Store.getTours, Store.saveTours, tour, 'id');
    },
    deleteTour(id) {
      Store.saveTours(Store.getTours().filter((t) => t.id !== id));
    },

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
        media: Store.getMedia().length,
      };
    },
  };

  global.ATStore = Store;
})(window);
