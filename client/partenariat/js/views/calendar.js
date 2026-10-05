import { api } from '../api.js';
import { esc, icon, toast, showError, busy, fmtPrice, fmtDate, MONTHS, pad, todayIso, loader } from '../ui.js';

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DOW_VALUES = [1, 2, 3, 4, 5, 6, 0];

export async function renderCalendar(view, roomId) {
  const { data: room } = await api.get(`/rooms/${roomId}`);
  const now = new Date();
  const state = { year: now.getFullYear(), month: now.getMonth(), days: [], sel: null };
  const pid = encodeURIComponent(room.propertyId);

  view.innerHTML = `
    <div class="crumbs"><a href="#/properties/${pid}">${esc(room.propertyName)}</a>${icon('chevronRight', 12)}<a href="#/properties/${pid}/rooms">Chambres</a>${icon('chevronRight', 12)}${esc(room.name)}${icon('chevronRight', 12)}Disponibilité</div>
    <div class="page-head">
      <div><h1>Disponibilité — ${esc(room.name)}</h1><p>${esc(room.propertyName)} · ${room.totalRooms} chambre(s) de ce type · ${fmtPrice(room.basePrice)} / nuit</p></div>
      <div class="page-head__actions"><a class="btn btn--ghost" href="#/rooms/${room.id}/rates">${icon('tag')} Tarifs</a></div>
    </div>
    ${room.status !== 'active' ? '<div class="notice notice--warn">Ce type de chambre est inactif : il n’est pas réservable, quelle que soit la disponibilité.</div>' : ''}
    <div class="cal-layout">
      <div class="card">
        <div class="cal-head">
          <div class="cal-nav">
            <button type="button" class="icon-btn" id="prev" aria-label="Mois précédent">${icon('chevronLeft')}</button>
            <h2 id="monthLabel"></h2>
            <button type="button" class="icon-btn" id="next" aria-label="Mois suivant">${icon('chevronRight')}</button>
          </div>
          <button type="button" class="btn btn--ghost btn--sm" id="todayBtn">Aujourd’hui</button>
        </div>
        <div class="cal-grid" id="grid">${loader()}</div>
        <div class="cal-legend">
          <span><i class="dot dot--green"></i>Disponibles</span><span><i class="dot dot--blue"></i>Réservées</span><span><i class="dot dot--grey"></i>Bloquées</span>
          <span>Cliquez sur une date, puis sur une deuxième pour sélectionner une période.</span>
        </div>
      </div>
      <div class="card"><div class="card__head"><h2>Modifier</h2></div><div class="card__body" id="panel"></div></div>
    </div>`;

  const grid = view.querySelector('#grid');
  const panel = view.querySelector('#panel');

  async function load() {
    const first = `${state.year}-${pad(state.month + 1)}-01`;
    const lastDay = new Date(state.year, state.month + 1, 0).getDate();
    const last = `${state.year}-${pad(state.month + 1)}-${pad(lastDay)}`;
    view.querySelector('#monthLabel').textContent = `${MONTHS[state.month]} ${state.year}`;
    grid.innerHTML = loader();
    try {
      const { data } = await api.get(`/rooms/${room.id}/availability?from=${first}&to=${last}`);
      state.days = data.days;
      drawGrid();
    } catch (err) {
      grid.innerHTML = `<p class="muted">${esc(err.message)}</p>`;
    }
  }

  const inSel = (date) => state.sel && date >= state.sel.from && date <= (state.sel.to || state.sel.from);

  function drawGrid() {
    const today = todayIso();
    const offset = (new Date(state.year, state.month, 1).getDay() + 6) % 7;
    const cells = DOW.map((d) => `<div class="cal-dow">${d}</div>`);
    for (let i = 0; i < offset; i += 1) cells.push('<div class="cal-day is-empty"></div>');
    for (const d of state.days) {
      const past = d.date < today;
      const blocked = d.status === 'UNAVAILABLE';
      const full = !blocked && d.availableQuantity === 0;
      const cls = ['cal-day', past && 'is-past', blocked && 'is-blocked', full && 'is-full', d.date === today && 'is-today', inSel(d.date) && 'is-selected'].filter(Boolean).join(' ');
      cells.push(`
        <button type="button" class="${cls}" data-date="${d.date}" ${past ? 'disabled' : ''} aria-label="${fmtDate(d.date)} : ${d.availableQuantity} disponible(s)">
          <span class="cal-day__num"><span>${Number(d.date.slice(8))}</span>${d.priceOverride != null ? `<span title="Prix forcé">${icon('tag', 11)}</span>` : ''}</span>
          <span class="cal-day__price">${fmtPrice(d.price)}</span>
          ${blocked ? '<span class="cal-day__line"><i class="dot dot--red"></i><span>Fermée</span></span>' : `<span class="cal-day__line"><i class="dot dot--green"></i>${d.availableQuantity}<span>&nbsp;dispo</span></span>`}
          ${d.bookedQuantity ? `<span class="cal-day__line"><i class="dot dot--blue"></i>${d.bookedQuantity}<span>&nbsp;rés.</span></span>` : ''}
          ${d.blockedQuantity && !blocked ? `<span class="cal-day__line"><i class="dot dot--grey"></i>${d.blockedQuantity}<span>&nbsp;bloq.</span></span>` : ''}
        </button>`);
    }
    grid.innerHTML = cells.join('');
    grid.querySelectorAll('[data-date]').forEach((b) => b.addEventListener('click', () => pick(b.dataset.date)));
    drawPanel();
  }

  function pick(date) {
    if (!state.sel || state.sel.to) state.sel = { from: date, to: null };
    else if (date < state.sel.from) state.sel = { from: date, to: state.sel.from };
    else if (date === state.sel.from) state.sel = { from: date, to: date };
    else state.sel.to = date;
    drawGrid();
  }

  function drawPanel() {
    if (!state.sel) {
      panel.innerHTML = `<p class="muted" style="margin:0">Sélectionnez une date ou une période dans le calendrier pour :</p>
        <ul class="muted" style="padding-left:18px;margin:10px 0 0;line-height:1.9"><li>ouvrir ou bloquer des dates</li><li>modifier le nombre de chambres disponibles</li><li>changer le prix d’une période</li><li>fixer un séjour minimum</li></ul>`;
      return;
    }
    const from = state.sel.from;
    const to = state.sel.to || from;
    const single = from === to;
    const day = single ? state.days.find((d) => d.date === from) : null;
    const count = Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86400000) + 1;
    const maxQty = room.totalRooms - (day?.bookedQuantity || 0);
    panel.innerHTML = `
      <div class="sel-summary">
        <strong>${single ? fmtDate(from) : `${fmtDate(from)} → ${fmtDate(to)}`}</strong> ${single ? '' : `<span class="muted">(${count} jours)</span>`}
        ${day ? `<div class="meta" style="margin-top:6px"><span><i class="dot dot--green"></i>${day.availableQuantity} disponible(s)</span><span><i class="dot dot--blue"></i>${day.bookedQuantity} réservée(s)</span><span><i class="dot dot--grey"></i>${day.blockedQuantity} bloquée(s)</span><span>${fmtPrice(day.price)}</span></div>` : ''}
        ${state.sel.to ? '' : '<div class="muted" style="font-size:12px;margin-top:4px">Cliquez une autre date pour étendre la sélection.</div>'}
      </div>
      <form id="availForm" novalidate>
        <div class="seg">
          <label><input type="radio" name="status" value="AVAILABLE" ${day?.status !== 'UNAVAILABLE' ? 'checked' : ''}>${icon('check', 15)} Ouvrir</label>
          <label><input type="radio" name="status" value="UNAVAILABLE" ${day?.status === 'UNAVAILABLE' ? 'checked' : ''}>${icon('lock', 15)} Bloquer</label>
        </div>
        <label class="field">Chambres disponibles <small>(max ${maxQty}${single ? '' : ', hors chambres déjà réservées'})</small>
          <input type="number" name="availableQuantity" min="0" max="${room.totalRooms}" value="${day ? day.availableQuantity : ''}" placeholder="${single ? '' : 'Inchangé'}">
        </label>
        <label class="field">Prix par nuit (DA) <small>vide = prix habituel</small>
          <input type="number" name="priceOverride" min="0" step="100" value="${day?.priceOverride ?? ''}" placeholder="${fmtPrice(day?.price ?? room.basePrice)}">
        </label>
        <label class="field">Séjour minimum (nuits)<input type="number" name="minimumStay" min="1" max="365" value="${day?.minimumStay ?? ''}" placeholder="Aucun"></label>
        ${single ? '' : `<div class="field">Jours concernés<div class="checks" style="grid-template-columns:repeat(4,1fr)">${DOW.map((d, i) => `<label class="check" style="padding:6px 8px"><input type="checkbox" name="wd" value="${DOW_VALUES[i]}" checked>${d}</label>`).join('')}</div></div>`}
        <div class="form-actions" style="justify-content:stretch">
          <button type="button" class="btn btn--ghost" id="clearSel">Annuler</button>
          <button type="submit" class="btn btn--primary" style="flex:1">${icon('check')} Appliquer</button>
        </div>
      </form>`;

    panel.querySelector('#clearSel').addEventListener('click', () => {
      state.sel = null;
      drawGrid();
    });
    const form = panel.querySelector('#availForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = form.elements;
      const body = { status: form.querySelector('input[name=status]:checked').value };
      const qty = f.availableQuantity.value.trim();
      if (qty !== '') {
        if (Number(qty) > room.totalRooms) return showError({ message: `Maximum ${room.totalRooms} chambre(s).` });
        body.availableQuantity = Number(qty);
      }
      const price = f.priceOverride.value.trim();
      body.priceOverride = price === '' ? null : Number(price);
      const min = f.minimumStay.value.trim();
      body.minimumStay = min === '' ? null : Number(min);
      await busy(form.querySelector('[type=submit]'), async () => {
        try {
          if (single) {
            await api.post(`/rooms/${room.id}/availability`, { ...body, date: from });
          } else {
            const weekdays = [...form.querySelectorAll('input[name=wd]:checked')].map((c) => Number(c.value));
            if (!weekdays.length) throw new Error('Choisissez au moins un jour de la semaine.');
            const res = await api.post(`/rooms/${room.id}/availability/bulk`, { ...body, startDate: from, endDate: to, weekdays: weekdays.length === 7 ? undefined : weekdays });
            toast(`${res.data.updated} jour(s) mis à jour.`);
          }
          if (single) toast('Disponibilité enregistrée.');
          state.sel = null;
          await load();
        } catch (err) {
          showError(err);
        }
      }, 'Application…');
    });
  }

  const shift = (n) => {
    const d = new Date(state.year, state.month + n, 1);
    state.year = d.getFullYear();
    state.month = d.getMonth();
    load();
  };
  view.querySelector('#prev').addEventListener('click', () => shift(-1));
  view.querySelector('#next').addEventListener('click', () => shift(1));
  view.querySelector('#todayBtn').addEventListener('click', () => {
    state.year = now.getFullYear();
    state.month = now.getMonth();
    load();
  });
  await load();
}
