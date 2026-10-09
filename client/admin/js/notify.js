/**
 * Notifications de l’admin : nouveaux commentaires (en attente de validation), nouvelles réservations
 * et modifications faites par les partenaires (chambres, tarifs, disponibilités…).
 * Vérification toutes les 30 s : pastille sur le menu, toast, titre de l’onglet et notification du navigateur.
 */
(function (global) {
  const INTERVAL = 30000;
  const SEEN_BOOKINGS = 'at_seen_bookings';
  const SEEN_PARTNERS = 'at_seen_partner_activity';
  const BASE_TITLE = document.title;

  const counts = { comments: 0, bookings: 0, owners: 0 };
  let lastPending = null;
  let lastPartnerId = null;
  let partnerItems = [];
  let ctx = null;

  const esc = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

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
    setBadge('owners', counts.owners);
    const total = counts.comments + counts.bookings + counts.owners;
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

  const ownersOpen = () => document.getElementById('section-owners')?.classList.contains('is-active');

  function renderPartnerActivity(error) {
    const el = document.getElementById('partnerActivity');
    if (!el) return;
    if (error) {
      el.innerHTML = `<div class="empty">${esc(error)}</div>`;
      return;
    }
    if (!partnerItems.length) {
      el.innerHTML = '<div class="empty">Aucune modification des partenaires pour le moment.</div>';
      return;
    }
    const seen = Number(localStorage.getItem(SEEN_PARTNERS)) || 0;
    el.innerHTML = `<ul class="partner-activity__list">${partnerItems
      .map((i) => {
        const at = new Date(i.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
        const place = i.propertyName ? ` <span class="partner-activity__place">${esc(i.propertyName)}</span>` : '';
        return `<li class="${i.id > seen ? 'is-new' : ''}"><time>${esc(at)}</time><span><strong>${esc(i.ownerName)}</strong> ${esc(i.summary)}${place}</span></li>`;
      })
      .join('')}</ul>`;
  }

  function markPartnersSeen() {
    if (!partnerItems.length) return;
    localStorage.setItem(SEEN_PARTNERS, String(partnerItems[0].id));
    counts.owners = 0;
    paint();
  }

  async function checkPartners() {
    if (!ATStore.remote.enabled) return false;
    try {
      const data = await ATStore.remote.api('/admin/partner-activity?limit=50');
      partnerItems = Array.isArray(data?.items) ? data.items : [];
      const latest = partnerItems[0]?.id || 0;
      if (localStorage.getItem(SEEN_PARTNERS) === null) localStorage.setItem(SEEN_PARTNERS, String(latest));
      const seen = Number(localStorage.getItem(SEEN_PARTNERS)) || 0;
      const fresh = partnerItems.filter((i) => i.id > Math.max(seen, lastPartnerId ?? seen));
      if (lastPartnerId !== null && fresh.length) {
        const i = fresh[0];
        alertAdmin(
          fresh.length > 1 ? `${fresh.length} nouvelles modifications des partenaires` : `Partenaire ${i.ownerName} : ${i.summary}`,
          'owners'
        );
      }
      lastPartnerId = latest;
      counts.owners = partnerItems.filter((i) => i.id > seen).length;
      if (ownersOpen()) {
        renderPartnerActivity();
        markPartnersSeen();
      }
      paint();
      return true;
    } catch {
      return false;
    }
  }

  /** Section Propriétaires ouverte : afficher l’activité puis la marquer comme lue */
  async function showPartnerActivity() {
    if (!ATStore.remote.enabled) {
      renderPartnerActivity('Activité disponible une fois connecté au serveur.');
      return;
    }
    if (!(await checkPartners())) renderPartnerActivity('Activité des partenaires indisponible (serveur injoignable). Réessayez.');
  }

  function tick() {
    checkComments();
    checkBookings();
    checkPartners();
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

  global.ATNotify = { start, askPermission, refreshComments, showPartnerActivity };
})(window);
