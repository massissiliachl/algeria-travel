(function () {
  const TITLES = {
    dashboard: 'Dashboard',
    bookings: 'Réservations',
    clients: 'Clients',
    destinations: 'Destinations',
    stays: 'Hébergements',
    owners: 'Propriétaires',
    tours: 'Circuits',
    activities: 'Activités',
    media: 'Galerie',
    comments: 'Commentaires',
    chat: 'Chat / Messages clients',
    pages: 'Textes du site',
    settings: 'Réglages',
  };

  const loginPage = document.getElementById('loginPage');
  const app = document.getElementById('app');
  const drawer = document.getElementById('drawer');
  const drawerPanel = document.getElementById('drawerPanel');
  const toastEl = document.getElementById('toast');
  const sidebar = document.getElementById('sidebar');

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  }

  function openDrawer(html) {
    drawerPanel.innerHTML =
      html +
      `<div class="form-actions"><button type="button" class="btn btn--ghost" id="drawerClose">Fermer</button></div>`;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.getElementById('drawerClose').onclick = closeDrawer;
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerPanel.innerHTML = '';
  }

  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  const PUBLISH_LABELS = {
    local: ['is-local', 'Mode local — non publié (serveur indisponible)'],
    pending: ['is-pending', 'Synchronisation avec la base…'],
    published: ['is-ok', 'Publié sur le site ✓'],
    error: ['is-error', 'Échec de la publication — réessayez'],
    auth: ['is-error', 'Session expirée — reconnectez-vous pour publier'],
  };

  function setPublishBadge(status) {
    const badge = document.getElementById('publishBadge');
    const [cls, label] = PUBLISH_LABELS[status] || PUBLISH_LABELS.local;
    badge.hidden = false;
    badge.className = 'publish-badge ' + cls;
    badge.textContent = label;
  }

  ATStore.remote.onStatus = (status) => {
    setPublishBadge(status);
    if (status === 'published') toast('Publié sur le site ✓');
    if (status === 'error') toast('Échec de la publication sur le site');
    if (status === 'auth') toast('Reconnectez-vous pour publier sur le site');
  };

  function showApp() {
    loginPage.style.display = 'none';
    app.classList.add('is-visible');
    ATStore.ensureSeed();
    refresh();
    ATStore.probeImageBase().then(refresh);
    setPublishBadge('pending');
    ATStore.remote.pull().then((online) => {
      ATStore.ensureSeed();
      refresh();
      setPublishBadge(online ? 'published' : 'local');
      ATNotify.start({ toast, showSection, refresh });
    });
    document.addEventListener('click', ATNotify.askPermission, { once: true });
  }

  function showLogin() {
    app.classList.remove('is-visible');
    loginPage.style.display = 'grid';
  }

  function showSection(id) {
    document.querySelectorAll('.section').forEach((s) => s.classList.remove('is-active'));
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('is-active'));
    const section = document.getElementById('section-' + id);
    const btn = document.querySelector(`.nav-btn[data-section="${id}"]`);
    if (section) section.classList.add('is-active');
    if (btn) btn.classList.add('is-active');
    document.getElementById('pageTitle').textContent = TITLES[id] || id;
    sidebar.classList.remove('is-open');
    if (id === 'settings') ATContentUI.fillSettingsForm();
    if (id === 'pages') ATManageUI.fillPagesForm();
    if (id === 'comments') ATCommentsUI.load(toast);
    if (id === 'chat') ATChatUI.load(toast);
    if (id === 'owners') ATOwnersUI.load(toast, openDrawer);
  }

  function refresh() {
    const stats = ATStore.stats();
    document.getElementById('dashStats').innerHTML = `
      <div class="stat"><div class="stat__label">Nouvelles demandes</div><div class="stat__value">${stats.bookingsNew}</div></div>
      <div class="stat"><div class="stat__label">Réservations</div><div class="stat__value">${stats.bookingsTotal}</div></div>
      <div class="stat"><div class="stat__label">Clients</div><div class="stat__value">${stats.clients}</div></div>
      <div class="stat"><div class="stat__label">Destinations</div><div class="stat__value">${stats.destinations}</div></div>
      <div class="stat"><div class="stat__label">Photos galerie</div><div class="stat__value">${stats.media}</div></div>
      <div class="stat"><div class="stat__label">Hébergements</div><div class="stat__value">${stats.stays}</div></div>
    `;

    const recent = ATStore.getBookings().slice(0, 5);
    document.getElementById('dashBookings').innerHTML = ATBookingsUI.renderRows(recent, { compact: true });

    const filter = document.getElementById('bookingFilter').value;
    let bookings = ATStore.getBookings();
    if (filter !== 'all') bookings = bookings.filter((b) => b.status === filter);
    document.getElementById('bookingsTable').innerHTML = ATBookingsUI.renderRows(bookings);

    document.getElementById('clientsTable').innerHTML = ATManageUI.renderClients();
    document.getElementById('destinationsTable').innerHTML = ATDestinationsUI.renderTable();
    document.getElementById('staysTable').innerHTML = ATContentUI.renderStaysTable();
    document.getElementById('toursTable').innerHTML = ATManageUI.renderTours();
    document.getElementById('activitiesTable').innerHTML = ATManageUI.renderActivities();
    document.getElementById('galleryGrid').innerHTML = ATManageUI.renderGallery();
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('loginError');
    ATNotify.askPermission();
    const submit = e.target.querySelector('[type="submit"]');
    const label = submit?.textContent;
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Connexion… (réveil du serveur, jusqu’à 1 min)';
    }
    const { ok } = await ATAuth.login(document.getElementById('loginUser').value, document.getElementById('loginPass').value);
    if (submit) {
      submit.disabled = false;
      submit.textContent = label;
    }
    if (ok) {
      err.classList.remove('is-visible');
      showApp();
    } else {
      err.classList.add('is-visible');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    ATAuth.logout();
    showLogin();
  });

  document.getElementById('menuToggle').addEventListener('click', () => sidebar.classList.toggle('is-open'));

  document.querySelectorAll('.nav-btn[data-section]').forEach((btn) => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => showSection(btn.dataset.goto));
  });

  document.getElementById('bookingFilter').addEventListener('change', refresh);
  document.getElementById('destAddBtn').addEventListener('click', () => ATDestinationsUI.openForm(null, openDrawer, toast));
  document.getElementById('clientAddBtn').addEventListener('click', () => ATManageUI.openClientForm(null, openDrawer, toast));
  document.getElementById('clientsRebuild').addEventListener('click', () => {
    ATStore.rebuildClientsFromBookings();
    toast('Clients synchronisés');
    refresh();
  });
  document.getElementById('galleryAddBtn').addEventListener('click', () => ATManageUI.openGalleryAddForm(openDrawer, toast));
  document.getElementById('tourAddBtn').addEventListener('click', () => ATManageUI.openTourForm(null, openDrawer, toast));
  document.getElementById('actAddBtn').addEventListener('click', () => ATManageUI.openActivityForm(null, openDrawer, toast));
  document.getElementById('commentsReload').addEventListener('click', () => ATCommentsUI.load(toast));
  ATCommentsUI.bind(toast);
  document.getElementById('chatReload').addEventListener('click', () => ATChatUI.load(toast));
  ATChatUI.bind(toast);
  ATOwnersUI.bind(toast, openDrawer);

  document.body.addEventListener('click', (e) => {
    const openBk = e.target.closest('[data-booking-open]');
    if (openBk) {
      ATBookingsUI.openDetail(openBk.dataset.bookingOpen, openDrawer, toast);
      return;
    }
    const editDest = e.target.closest('[data-dest-edit]');
    if (editDest) {
      ATDestinationsUI.openForm(
        ATStore.getDestinations().find((d) => d.id === editDest.dataset.destEdit),
        openDrawer,
        toast
      );
      return;
    }
    const bookingDest = e.target.closest('[data-dest-booking]');
    if (bookingDest) {
      const dest = ATStore.getDestinations().find((d) => d.id === bookingDest.dataset.destBooking);
      if (!dest) return;
      ATStore.upsertDestination({ ...dest, bookingOpen: !dest.bookingOpen });
      toast(`Réservations ${dest.bookingOpen ? 'fermées' : 'ouvertes'} : ${dest.name}`);
      refresh();
      return;
    }
    const bookingTour = e.target.closest('[data-tour-booking]');
    if (bookingTour) {
      const tour = ATStore.getTours().find((t) => String(t.id) === bookingTour.dataset.tourBooking);
      if (!tour) return;
      const open = tour.bookingOpen !== false;
      ATStore.upsertTour({ ...tour, bookingOpen: !open });
      toast(`Réservations ${open ? 'fermées' : 'ouvertes'} : ${tour.name}`);
      refresh();
      return;
    }
    const calTour = e.target.closest('[data-tour-calendar]');
    if (calTour) {
      const tour = ATStore.getTours().find((t) => String(t.id) === calTour.dataset.tourCalendar);
      if (!tour?.placeSlug) return;
      const dest = ATStore.getDestinations().find((d) => d.id === tour.placeSlug) || { id: tour.placeSlug, name: tour.name };
      ATBookingCalendarUI.open(dest, openDrawer, toast, tour.pkg ? `${tour.placeSlug}:${tour.pkg}` : tour.placeSlug);
      return;
    }
    const calDest = e.target.closest('[data-dest-calendar]');
    if (calDest) {
      const dest = ATStore.getDestinations().find((d) => d.id === calDest.dataset.destCalendar);
      if (dest) ATBookingCalendarUI.open(dest, openDrawer, toast);
      return;
    }
    const editStay = e.target.closest('[data-stay-edit]');
    if (editStay) {
      ATContentUI.openStayForm(
        ATStore.getStays().find((s) => s.id === editStay.dataset.stayEdit),
        openDrawer,
        toast
      );
      return;
    }
    const editClient = e.target.closest('[data-client-edit]');
    if (editClient) {
      ATManageUI.openClientForm(
        ATStore.getClients().find((c) => c.id === editClient.dataset.clientEdit),
        openDrawer,
        toast
      );
      return;
    }
    const delTour = e.target.closest('[data-tour-del]');
    if (delTour) {
      const tour = ATStore.getTours().find((t) => String(t.id) === delTour.dataset.tourDel);
      if (!confirm(`Supprimer le circuit « ${tour?.name || ''} » ?`)) return;
      ATStore.deleteTour(delTour.dataset.tourDel);
      toast('Circuit supprimé');
      refresh();
      return;
    }
    if (e.target.closest('[data-tour-reset]')) {
      if (!confirm('Remettre les circuits d’origine ? Vos ajouts et modifications seront perdus.')) return;
      ATStore.resetTours();
      ATStore.ensureSeed();
      toast('Circuits réinitialisés');
      refresh();
      return;
    }
    const editTour = e.target.closest('[data-tour-edit]');
    if (editTour) {
      ATManageUI.openTourForm(
        ATStore.getTours().find((t) => String(t.id) === editTour.dataset.tourEdit),
        openDrawer,
        toast
      );
      return;
    }
    const editAct = e.target.closest('[data-act-edit]');
    if (editAct) {
      ATManageUI.openActivityForm(
        ATStore.getActivities().find((a) => a.id === editAct.dataset.actEdit),
        openDrawer,
        toast
      );
      return;
    }
    const copyMedia = e.target.closest('[data-media-copy]');
    if (copyMedia) {
      navigator.clipboard?.writeText(copyMedia.dataset.mediaCopy).then(
        () => toast('URL copiée'),
        () => toast(copyMedia.dataset.mediaCopy)
      );
      return;
    }
    const editGallery = e.target.closest('[data-gallery-edit]');
    if (editGallery) {
      ATManageUI.openGalleryEditForm(editGallery.dataset.galleryEdit, openDrawer, toast);
      return;
    }
    const delGallery = e.target.closest('[data-gallery-del]');
    if (delGallery) {
      if (!confirm('Supprimer cette photo de la page Galerie ?')) return;
      ATStore.deleteGalleryImage(delGallery.dataset.galleryDel);
      toast('Photo supprimée de la galerie');
      refresh();
      return;
    }
    if (e.target.closest('[data-gallery-reset]')) {
      if (!confirm('Remettre les photos d’origine de la galerie ? Vos ajouts seront retirés.')) return;
      ATStore.resetGallery();
      toast('Galerie réinitialisée');
      refresh();
      return;
    }
    const filterMedia = e.target.closest('[data-media-filter]');
    if (filterMedia) {
      ATManageUI.setMediaFilter(filterMedia.dataset.mediaFilter);
      refresh();
      return;
    }
    if (e.target.closest('[data-media-restore]')) {
      ATStore.restoreSiteMedia();
      toast('Photos du site restaurées');
      refresh();
      return;
    }
    const delMedia = e.target.closest('[data-media-del]');
    if (delMedia) {
      if (!confirm('Supprimer cette image de la bibliothèque ?')) return;
      ATStore.deleteMedia(delMedia.dataset.mediaDel);
      toast('Image supprimée');
      refresh();
    }
  });

  document.addEventListener('at:refresh', refresh);
  ATContentUI.bindSettings(toast);
  ATManageUI.bindPages(toast);

  if (ATAuth.isLoggedIn()) showApp();
  else showLogin();
})();
