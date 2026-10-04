/**
 * Notifications de l’admin : nouveaux commentaires (en attente de validation) et nouvelles réservations.
 * Vérification toutes les 30 s : pastille sur le menu, toast, titre de l’onglet et notification du navigateur.
 */
(function (global) {
  const INTERVAL = 30000;
  const SEEN_BOOKINGS = 'at_seen_bookings';
  const BASE_TITLE = document.title;

  const counts = { comments: 0, bookings: 0 };
  let lastPending = null;
  let ctx = null;

  function readSeen() {
    try {
      return new Set(JSON.parse(localStorage.getItem(SEEN_BOOKINGS) || '[]'));
    } catch {
      return new Set();
    }
  }

  function setBadge(section, n) {
    const btn = document.querySelector(`.nav-btn[data-section="${section}"]`);
    if (!btn) return;
    let badge = btn.querySelector('.nav-badge');
    if (!n) return badge?.remove();
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      btn.appendChild(badge);
    }
    badge.textContent = n > 99 ? '99+' : String(n);
  }

  function paint() {
    setBadge('comments', counts.comments);
    setBadge('bookings', counts.bookings);
    const total = counts.comments + counts.bookings;
    document.title = total ? `(${total}) ${BASE_TITLE}` : BASE_TITLE;
  }

  function alertAdmin(message, section) {
    ctx.toast(message);
    if (!('Notification' in global) || Notification.permission !== 'granted') return;
    const n = new Notification('Algeria Travel — Admin', { body: message, icon: '../public/logo192.png', tag: section });
    n.onclick = () => {
      global.focus();
      ctx.showSection(section);
      n.close();
    };
  }

  async function checkComments() {
    if (!ATStore.remote.enabled) return;
    try {
      const stats = await ATStore.remote.api('/admin/comments/stats');
      const pending = Number(stats?.pending) || 0;
      if (lastPending !== null && pending > lastPending) {
        const added = pending - lastPending;
        alertAdmin(added > 1 ? `${added} nouveaux commentaires à valider` : 'Nouveau commentaire à valider', 'comments');
        if (document.getElementById('section-comments')?.classList.contains('is-active')) ATCommentsUI.load(ctx.toast);
      }
      lastPending = pending;
      counts.comments = pending;
      paint();
    } catch {
      /* backend momentanément indisponible */
    }
  }

  async function checkBookings() {
    const ok = await ATStore.remote.pullBookings();
    if (!ok) return;
    ctx.refresh();
    const seen = readSeen();
    const bookings = ATStore.getBookings();
    const firstRun = !localStorage.getItem(SEEN_BOOKINGS);
    const fresh = bookings.filter((b) => !seen.has(b.id));
    if (!firstRun && fresh.length) {
      const b = fresh[0];
      alertAdmin(
        fresh.length > 1 ? `${fresh.length} nouvelles réservations` : `Nouvelle réservation : ${b.name || 'client'} — ${b.destination || ''}`,
        'bookings'
      );
    }
    localStorage.setItem(SEEN_BOOKINGS, JSON.stringify(bookings.map((b) => b.id)));
    counts.bookings = bookings.filter((b) => b.status === 'new').length;
    paint();
  }

  function tick() {
    checkComments();
    checkBookings();
  }

  /** À appeler depuis un clic (connexion) : le navigateur n’autorise la demande qu’après une action de l’utilisateur */
  function askPermission() {
    if ('Notification' in global && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
  }

  function start(options) {
    ctx = options;
    tick();
    setInterval(tick, INTERVAL);
  }

  /** Après une modération, mettre la pastille à jour sans attendre */
  function refreshComments() {
    lastPending = null;
    return checkComments();
  }

  global.ATNotify = { start, askPermission, refreshComments };
})(window);
