(function () {
  const TITLES = {
    dashboard: 'Dashboard',
    bookings: 'Réservations',
    clients: 'Clients',
    destinations: 'Destinations',
    stays: 'Hébergements',
    tours: 'Circuits',
    activities: 'Activités',
    media: 'Images',
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

  function showApp() {
    loginPage.style.display = 'none';
    app.classList.add('is-visible');
    ATStore.ensureSeed();
    refresh();
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
  }

  function refresh() {
    const stats = ATStore.stats();
    document.getElementById('dashStats').innerHTML = `
      <div class="stat"><div class="stat__label">Nouvelles demandes</div><div class="stat__value">${stats.bookingsNew}</div></div>
      <div class="stat"><div class="stat__label">Réservations</div><div class="stat__value">${stats.bookingsTotal}</div></div>
      <div class="stat"><div class="stat__label">Clients</div><div class="stat__value">${stats.clients}</div></div>
      <div class="stat"><div class="stat__label">Destinations</div><div class="stat__value">${stats.destinations}</div></div>
      <div class="stat"><div class="stat__label">Images</div><div class="stat__value">${stats.media}</div></div>
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
    document.getElementById('mediaGrid').innerHTML = ATManageUI.renderMedia();
  }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const err = document.getElementById('loginError');
    if (ATAuth.login(document.getElementById('loginUser').value, document.getElementById('loginPass').value)) {
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

  document.querySelectorAll('.nav-btn').forEach((btn) => {
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
  document.getElementById('mediaAddBtn').addEventListener('click', () => ATManageUI.openMediaForm(openDrawer, toast));
  document.getElementById('tourAddBtn').addEventListener('click', () => ATManageUI.openTourForm(null, openDrawer, toast));
  document.getElementById('actAddBtn').addEventListener('click', () => ATManageUI.openActivityForm(null, openDrawer, toast));

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
    const editTour = e.target.closest('[data-tour-edit]');
    if (editTour) {
      ATManageUI.openTourForm(
        ATStore.getTours().find((t) => t.id === editTour.dataset.tourEdit),
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
    const delMedia = e.target.closest('[data-media-del]');
    if (delMedia) {
      if (!confirm('Supprimer cette image ?')) return;
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
