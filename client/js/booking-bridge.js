/**
 * Bridge réservations — site public → localStorage (lu par /admin/)
 * Expose window.ATBooking.create(payload)
 */
(function (global) {
  const KEY = 'at_bookings';
  const CLIENTS_KEY = 'at_clients';

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
      return booking;
    },
  };
})(window);
