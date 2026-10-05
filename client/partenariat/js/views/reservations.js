import { api } from '../api.js';
import { esc, icon, badge, toast, showError, confirmDialog, modal, fmtPrice, fmtDate, fmtDateTime, loader, empty, pager } from '../ui.js';

const state = { status: '', q: '', propertyId: '', page: 1 };
const TABS = [
  ['', 'Toutes'],
  ['pending', 'En attente'],
  ['confirmed', 'Confirmées'],
  ['rejected', 'Refusées'],
  ['cancelled', 'Annulées'],
];

const nights = (r) => (r.checkInDate && r.checkOutDate ? Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / 86400000) : null);

export async function renderReservations(view) {
  const { data: properties } = await api.get('/properties?limit=100&sort=name&order=asc');
  view.innerHTML = `
    <div class="page-head"><div><h1>Réservations</h1><p>Demandes de réservation reçues pour vos établissements</p></div></div>
    <div class="tabs" id="tabs">${TABS.map(([k, l]) => `<button type="button" data-tab="${k}" class="${state.status === k ? 'is-active' : ''}">${l}</button>`).join('')}</div>
    <div class="toolbar">
      <input type="search" class="search" id="fQ" placeholder="Client, email ou référence…" value="${esc(state.q)}">
      <select id="fProp" style="width:auto"><option value="">Tous les établissements</option>${properties.map((p) => `<option value="${esc(p.id)}" ${state.propertyId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
    </div>
    <div class="card"><div class="card__body" id="box">${loader()}</div></div>`;

  const box = view.querySelector('#box');
  const reload = () => load(box);
  view.querySelectorAll('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      state.status = b.dataset.tab;
      state.page = 1;
      view.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('is-active', x === b));
      reload();
    })
  );
  let timer;
  view.querySelector('#fQ').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.q = e.target.value.trim();
      state.page = 1;
      reload();
    }, 300);
  });
  view.querySelector('#fProp').addEventListener('change', (e) => {
    state.propertyId = e.target.value;
    state.page = 1;
    reload();
  });
  await reload();
}

async function load(box) {
  const params = new URLSearchParams({ page: state.page, limit: 20 });
  if (state.status) params.set('status', state.status);
  if (state.q) params.set('q', state.q);
  if (state.propertyId) params.set('propertyId', state.propertyId);
  box.innerHTML = loader();
  const res = await api.get(`/reservations?${params}`);
  if (!res.data.length) {
    box.innerHTML = empty('Aucune réservation', state.status || state.q ? 'Aucune réservation ne correspond à ces filtres.' : 'Les demandes de vos clients apparaîtront ici.');
    return;
  }
  const pg = pager(res.pagination, (p) => {
    state.page = p;
    load(box);
  });
  box.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Référence</th><th>Client</th><th>Établissement / chambre</th><th>Séjour</th><th>Montant</th><th>Statut</th><th></th></tr></thead><tbody>
    ${res.data
      .map(
        (r) => `<tr>
        <td><strong>${esc(r.referenceCode || '—')}</strong><br><small class="muted">${fmtDateTime(r.createdAt)}</small></td>
        <td>${esc(r.clientName)}<br><small class="muted">${esc(r.clientPhone || r.clientEmail)}</small></td>
        <td>${esc(r.propertyName || r.itemName)}<br><small class="muted">${esc(r.roomName || '')}${r.ratePlanName ? ` · ${esc(r.ratePlanName)}` : ''}</small></td>
        <td>${r.checkInDate ? `${fmtDate(r.checkInDate, { year: false })} → ${fmtDate(r.checkOutDate)}<br><small class="muted">${nights(r)} nuit(s) · ${r.roomsRequested || 1} ch. · ${r.travelers} pers.</small>` : '—'}</td>
        <td>${fmtPrice(r.priceEstimate)}</td>
        <td>${badge(r.status)}</td>
        <td><div class="actions"><button type="button" class="btn btn--ghost btn--sm" data-view="${r.id}">${icon('eye', 14)} Détails</button></div></td>
      </tr>`
      )
      .join('')}</tbody></table></div>${pg.html}`;
  pg.bind(box);
  box.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => detail(res.data.find((r) => r.id === b.dataset.view), () => load(box))));
}

function detail(r, onChange) {
  const actions = [];
  if (['pending', 'reviewed'].includes(r.status)) {
    actions.push(`<button type="button" class="btn btn--danger-ghost" data-status="rejected">${icon('x')} Refuser</button>`);
    actions.push(`<button type="button" class="btn btn--success" data-status="confirmed">${icon('check')} Confirmer</button>`);
  } else if (r.status === 'confirmed') {
    actions.push(`<button type="button" class="btn btn--danger-ghost" data-status="cancelled">${icon('x')} Annuler la réservation</button>`);
  }
  const { el, close } = modal(`Réservation ${r.referenceCode || ''}`, `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">${badge(r.status)}<small class="muted">Reçue le ${fmtDateTime(r.createdAt)}</small></div>
    <dl class="kv">
      <dt>Client</dt><dd><strong>${esc(r.clientName)}</strong></dd>
      <dt>Téléphone</dt><dd>${r.clientPhone ? `<a href="tel:${esc(r.clientPhone)}">${esc(r.clientPhone)}</a>` : '—'}</dd>
      <dt>Email</dt><dd><a href="mailto:${esc(r.clientEmail)}">${esc(r.clientEmail)}</a></dd>
      <dt>Établissement</dt><dd>${esc(r.propertyName || r.itemName)}</dd>
      <dt>Chambre</dt><dd>${esc(r.roomName || '—')}${r.ratePlanName ? ` — ${esc(r.ratePlanName)}` : ''}</dd>
      <dt>Arrivée</dt><dd>${fmtDate(r.checkInDate)}</dd>
      <dt>Départ</dt><dd>${fmtDate(r.checkOutDate)}${nights(r) ? ` (${nights(r)} nuit(s))` : ''}</dd>
      <dt>Chambres</dt><dd>${r.roomsRequested || 1}</dd>
      <dt>Voyageurs</dt><dd>${r.travelers}</dd>
      <dt>Montant estimé</dt><dd><strong>${fmtPrice(r.priceEstimate)}</strong></dd>
      ${r.message ? `<dt>Message</dt><dd style="white-space:pre-line">${esc(r.message)}</dd>` : ''}
    </dl>
    ${actions.length ? `<div class="form-actions" style="margin-top:20px">${actions.join('')}</div>` : ''}
    ${r.status === 'pending' ? '<p class="muted" style="font-size:12px;margin:12px 0 0">Les chambres sont déjà bloquées pour cette demande. Un refus ou une annulation les remet en vente automatiquement.</p>' : ''}`);
  el.querySelectorAll('[data-status]').forEach((b) =>
    b.addEventListener('click', async () => {
      const status = b.dataset.status;
      const labels = { confirmed: 'Confirmer cette réservation ?', rejected: 'Refuser cette demande ? Les chambres seront remises en vente.', cancelled: 'Annuler cette réservation ? Les chambres seront remises en vente.' };
      if (!(await confirmDialog(labels[status], { confirmLabel: status === 'confirmed' ? 'Confirmer' : 'Oui', danger: status !== 'confirmed' }))) return;
      try {
        await api.patch(`/reservations/${r.id}/status`, { status });
        toast({ confirmed: 'Réservation confirmée.', rejected: 'Demande refusée.', cancelled: 'Réservation annulée.' }[status]);
        close();
        onChange();
      } catch (err) {
        showError(err);
      }
    })
  );
}
