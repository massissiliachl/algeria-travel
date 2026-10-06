/**
 * Bridge réservations — site public → backend Supabase (window.AT_API), sinon api/bookings.php (IONOS)
 * + localStorage. Expose window.ATBooking.create(payload)
 */
(function (global) {
  const KEY = 'at_bookings';
  const CLIENTS_KEY = 'at_clients';
  const PHP_API = new URL('../api/bookings.php', document.currentScript?.src || location.href).href;

  function sendToPhp(booking) {
    const fields = ['id', 'name', 'email', 'phone', 'date', 'travelers', 'stay', 'destination', 'message', 'source'];
    const payload = Object.fromEntries(fields.map((f) => [f, booking[f]]));
    return fetch(PHP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking: payload }),
      keepalive: true,
    }).catch(() => {
      /* serveur indisponible (dev local) : la réservation reste dans le navigateur */
    });
  }

  /** Demande de réservation enregistrée dans Supabase (POST /api/reservations) */
  async function sendToBackend(booking, extra) {
    if (!global.AT_API || !extra.itemId) return false;
    try {
      const { ok, data } = await global.AT_API.request('/reservations', {
        method: 'POST',
        body: {
          item_type: extra.itemType || 'place',
          item_id: String(extra.itemId),
          item_name: booking.destination,
          item_pkg: extra.pkg || undefined,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          travel_date: booking.date,
          travelers: Math.min(20, Math.max(1, parseInt(booking.travelers, 10) || 1)),
          message: [booking.stay && `Hébergement : ${booking.stay}`, booking.message].filter(Boolean).join('\n'),
          unit_price: Number(extra.unitPrice) || 0,
          price_per_person: true,
          gdpr_consent: true,
          payment_method: 'pre_request',
          website: '',
        },
      });
      if (ok && data?.referenceCode) booking.ref = data.referenceCode;
      return ok;
    } catch {
      return false;
    }
  }

  function sendToServer(booking, extra) {
    sendToBackend(booking, extra).then((saved) => {
      if (saved) updateStored(booking);
      else sendToPhp(booking);
    });
  }

  function updateStored(booking) {
    const list = read(KEY, []).map((b) => (b.id === booking.id ? { ...b, ref: booking.ref } : b));
    write(KEY, list);
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function syncClient(booking) {
    if (!booking.email && !booking.phone) return;
    const clients = read(CLIENTS_KEY, []);
    const email = (booking.email || '').toLowerCase();
    const i = clients.findIndex(
      (c) =>
        (email && (c.email || '').toLowerCase() === email) ||
        (booking.phone && c.phone === booking.phone)
    );
    if (i < 0) {
      clients.unshift({
        id: uid('cl'),
        name: booking.name || '',
        email: booking.email || '',
        phone: booking.phone || '',
        notes: '',
        lastDestination: booking.destination || '',
        bookingsCount: 1,
        createdAt: new Date().toISOString(),
      });
    } else {
      clients[i] = {
        ...clients[i],
        name: booking.name || clients[i].name,
        phone: booking.phone || clients[i].phone,
        lastDestination: booking.destination || clients[i].lastDestination,
        bookingsCount: (clients[i].bookingsCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
    }
    write(CLIENTS_KEY, clients);
  }

  global.ATBooking = {
    create(data) {
      const list = read(KEY, []);
      const booking = {
        id: uid('bk'),
        status: 'new',
        notes: '',
        createdAt: new Date().toISOString(),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        date: data.date || '',
        travelers: data.travelers || '',
        stay: data.stay || '',
        destination: data.destination || '',
        message: data.message || '',
        source: data.source || 'site',
      };
      list.unshift(booking);
      write(KEY, list);
      syncClient(booking);
      sendToServer(booking, data);
      return booking;
    },
  };
})(window);
