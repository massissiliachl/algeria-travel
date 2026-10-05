import { api, ADMIN_MODE } from '../api.js';
import {
  esc, icon, badge, toast, showError, confirmDialog, modal, formValues, busy, fmtPrice, fmtDate, MEAL_PLANS, PROPERTY_TYPES, go, loader, empty, pager,
} from '../ui.js';

const ROOM_PRESETS = ['Chambre Simple', 'Chambre Double', 'Chambre Twin', 'Chambre Triple', 'Chambre Familiale', 'Suite', 'Suite Deluxe'];
const ROOM_AMENITIES = ['Wi-Fi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort', 'Salle de bain privée', 'Balcon', 'Bureau', 'Sèche-cheveux', 'Bouilloire', 'Cuisine équipée', 'Lave-linge'];
const hashParam = (name) => new URLSearchParams(location.hash.split('?')[1] || '').get(name);

const roomRow = (r, { showProperty = false } = {}) => `
  <tr>
    <td><strong>${esc(r.name)}</strong>${showProperty ? `<br><small class="muted">${esc(r.propertyName || '')}</small>` : ''}${r.view ? `<br><small class="muted">Vue ${esc(r.view)}</small>` : ''}</td>
    <td>${r.capacityAdults} adulte(s)${r.capacityChildren ? `<br><small class="muted">+ ${r.capacityChildren} enfant(s)</small>` : ''}</td>
    <td>${r.totalRooms}</td>
    <td><strong class="${r.availableRooms ? 'text-green' : ''}">${r.availableRooms ?? '—'}</strong></td>
    <td>${fmtPrice(r.basePrice)}<br><small class="muted">${r.rateCount || 0} tarif(s)</small></td>
    <td>${badge(r.status)}</td>
    <td><div class="actions">
      <button type="button" class="btn btn--ghost btn--sm" data-edit="${r.id}">${icon('edit', 14)} Modifier</button>
      <a class="btn btn--ghost btn--sm" href="#/rooms/${r.id}/rates">${icon('tag', 14)} Tarifs</a>
      <a class="btn btn--ghost btn--sm" href="#/rooms/${r.id}/availability">${icon('calendar', 14)} Disponibilité</a>
      <button type="button" class="btn btn--ghost btn--sm" data-status="${r.id}" data-next="${r.status === 'active' ? 'inactive' : 'active'}">${icon('power', 14)} ${r.status === 'active' ? 'Désactiver' : 'Activer'}</button>
      <button type="button" class="btn btn--danger-ghost btn--sm" data-delete="${r.id}" title="Supprimer">${icon('trash', 14)}</button>
    </div></td>
  </tr>`;

const TABLE_HEAD = '<thead><tr><th>Type</th><th>Capacité</th><th>Nombre total</th><th>Disponibles</th><th>Prix / nuit</th><th>Statut</th><th></th></tr></thead>';

function bindRoomActions(root, rooms, reload) {
  root.querySelectorAll('[data-edit]').forEach((b) =>
    b.addEventListener('click', () => roomModal(rooms.find((r) => r.id === b.dataset.edit).propertyId, rooms.find((r) => r.id === b.dataset.edit), reload))
  );
  root.querySelectorAll('[data-status]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (b.dataset.next === 'inactive' && !(await confirmDialog('Désactiver ce type de chambre ? Il ne pourra plus être réservé.', { confirmLabel: 'Désactiver', danger: true }))) return;
      try {
        await api.patch(`/rooms/${b.dataset.status}/status`, { status: b.dataset.next });
        toast(b.dataset.next === 'active' ? 'Chambre activée.' : 'Chambre désactivée.');
        reload();
      } catch (err) {
        showError(err);
      }
    })
  );
  root.querySelectorAll('[data-delete]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (!(await confirmDialog('Supprimer ce type de chambre ? Les réservations passées sont conservées.', { confirmLabel: 'Supprimer', danger: true }))) return;
      try {
        await api.del(`/rooms/${b.dataset.delete}`);
        toast('Chambre supprimée.');
        reload();
      } catch (err) {
        showError(err);
      }
    })
  );
}

// ─── Chambres d'un établissement ─────────────────────────────────────────

export async function renderRooms(view, propertyId) {
  const eid = encodeURIComponent(propertyId);
  const [{ data: p }, { data: rooms }] = await Promise.all([api.get(`/properties/${eid}`), api.get(`/properties/${eid}/rooms`)]);
  const then = hashParam('then');
  if (then && rooms.length === 1) return go(`/rooms/${rooms[0].id}/${then === 'rates' ? 'rates' : 'availability'}`);

  view.innerHTML = `
    <div class="crumbs"><a href="#/properties">${ADMIN_MODE ? 'Hébergements' : 'Mes hébergements'}</a>${icon('chevronRight', 12)}<a href="#/properties/${eid}">${esc(p.name)}</a>${icon('chevronRight', 12)}Chambres</div>
    <div class="page-head">
      <div><h1>${esc(p.name)} → Chambres</h1><p>${esc(PROPERTY_TYPES[p.propertyType] || '')} · ${esc(p.city || '')} — types de chambres, capacités et prix de base</p></div>
      <div class="page-head__actions"><button type="button" class="btn btn--primary" id="addRoom">${icon('plus')} Ajouter un type de chambre</button></div>
    </div>
    ${then ? `<div class="notice">Choisissez la chambre dont vous voulez gérer ${then === 'rates' ? 'les tarifs' : 'la disponibilité'}.</div>` : ''}
    ${p.status !== 'active' ? '<div class="notice notice--warn">Cet établissement est inactif : ses chambres ne sont pas réservables tant qu’il n’est pas activé.</div>' : ''}
    <div class="card"><div class="card__body" id="roomsBox">
      ${
        rooms.length
          ? `<div class="table-wrap"><table class="table">${TABLE_HEAD}<tbody>${rooms.map((r) => roomRow(r)).join('')}</tbody></table></div>`
          : empty('Aucune chambre', 'Ajoutez vos types de chambres (simple, double, suite…) avec leur capacité et leur prix.', `<button type="button" class="btn btn--primary" data-add>${icon('plus')} Ajouter un type de chambre</button>`)
      }
    </div></div>`;

  const reload = () => renderRooms(view, propertyId);
  view.querySelector('#addRoom').addEventListener('click', () => roomModal(p.id, null, reload));
  view.querySelector('[data-add]')?.addEventListener('click', () => roomModal(p.id, null, reload));
  bindRoomActions(view, rooms.map((r) => ({ ...r, propertyId: p.id })), reload);
}

function roomModal(propertyId, room, onSaved) {
  const r = room || { capacityAdults: 2, capacityChildren: 0, totalRooms: 1, status: 'active', amenities: [] };
  const num = (name, label, attrs, req = false) => `<label class="field">${label}${req ? ' <span class="req">*</span>' : ''}<input type="number" data-type="number" name="${name}" value="${r[name] ?? ''}" ${attrs} ${req ? 'required' : ''}></label>`;
  const { el, close } = modal(room ? `Modifier « ${room.name} »` : 'Nouveau type de chambre', `
    <form id="roomForm" novalidate>
      <div class="form-grid">
        <label class="field full">Nom <span class="req">*</span>
          <input type="text" name="name" value="${esc(r.name || '')}" required maxlength="120" list="roomPresets" placeholder="Ex. Chambre Deluxe">
          <datalist id="roomPresets">${ROOM_PRESETS.map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
        </label>
        <label class="field full">Description<textarea name="description" rows="3" maxlength="3000">${esc(r.description || '')}</textarea></label>
        ${num('totalRooms', 'Nombre de chambres de ce type', 'min="0" max="10000"', true)}
        ${num('basePrice', 'Prix de base par nuit (DA)', 'min="0" step="100"', true)}
        ${num('capacityAdults', 'Capacité adultes', 'min="1" max="50"', true)}
        ${num('capacityChildren', 'Capacité enfants', 'min="0" max="50"')}
        ${num('beds', 'Nombre de lits', 'min="0" max="50"')}
        <label class="field">Type de lit<input type="text" name="bedType" value="${esc(r.bedType || '')}" maxlength="80" placeholder="Ex. 1 lit double"></label>
        ${num('sizeM2', 'Superficie (m²)', 'min="0" step="0.5"')}
        <label class="field">Vue<input type="text" name="view" value="${esc(r.view || '')}" maxlength="80" placeholder="Ex. Mer, jardin, ville"></label>
        <label class="field">Statut<select name="status"><option value="active" ${r.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${r.status === 'inactive' ? 'selected' : ''}>Inactive</option></select></label>
      </div>
      <div class="field">Équipements de la chambre
        <div class="checks">${ROOM_AMENITIES.map((a) => `<label class="check"><input type="checkbox" data-group="amenities" name="ra_${esc(a)}" value="${esc(a)}" ${r.amenities.includes(a) ? 'checked' : ''}>${esc(a)}</label>`).join('')}</div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn--ghost" data-close>Annuler</button><button type="submit" class="btn btn--primary">${icon('check')} Enregistrer</button></div>
    </form>`, { wide: true });
  el.querySelector('[data-close]').onclick = close;
  const form = el.querySelector('#roomForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const values = formValues(form);
    const body = { ...values, amenities: values.amenities || [] };
    for (const k of Object.keys(body)) if (k.startsWith('ra_')) delete body[k];
    await busy(form.querySelector('[type=submit]'), async () => {
      try {
        if (room) await api.put(`/rooms/${room.id}`, body);
        else await api.post(`/properties/${encodeURIComponent(propertyId)}/rooms`, body);
        close();
        toast(room ? 'Chambre enregistrée.' : 'Type de chambre ajouté.');
        onSaved();
      } catch (err) {
        showError(err);
      }
    });
  });
}

// ─── Toutes les chambres (menus Chambres / Tarifs / Disponibilités) ─────

const MODE_TEXT = {
  rooms: ['Chambres', 'Tous les types de chambres de vos établissements'],
  rates: ['Tarifs', 'Choisissez une chambre pour gérer ses tarifs et ses prix saisonniers'],
  availability: ['Disponibilités', 'Choisissez une chambre pour ouvrir le calendrier'],
};

export async function renderAllRooms(view, mode, page = 1, propertyId = '') {
  const [{ data: properties }, res] = await Promise.all([
    api.get('/properties?limit=100&sort=name&order=asc'),
    api.get(`/rooms?page=${page}&limit=50${propertyId ? `&propertyId=${encodeURIComponent(propertyId)}` : ''}`),
  ]);
  const [title, subtitle] = MODE_TEXT[mode];
  view.innerHTML = `
    <div class="page-head">
      <div><h1>${title}</h1><p>${subtitle}</p></div>
      ${mode === 'rooms' && properties.length ? `<div class="page-head__actions"><button type="button" class="btn btn--primary" id="addRoom">${icon('plus')} Ajouter une chambre</button></div>` : ''}
    </div>
    ${properties.length ? `<div class="toolbar"><select id="fProp" style="width:auto;min-width:240px"><option value="">Tous les établissements</option>${properties.map((p) => `<option value="${esc(p.id)}" ${p.id === propertyId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>` : ''}
    <div class="card"><div class="card__body" id="box"></div></div>`;
  const box = view.querySelector('#box');
  const reload = () => renderAllRooms(view, mode, page, propertyId);

  if (!properties.length) {
    box.innerHTML = empty('Aucun établissement', 'Créez d’abord un établissement, puis ajoutez ses chambres.', `<a class="btn btn--primary" href="#/properties/new">${icon('plus')} Ajouter un hébergement</a>`);
    return;
  }
  if (!res.data.length) {
    box.innerHTML = empty('Aucune chambre', 'Ajoutez des types de chambres à vos établissements.', `<button type="button" class="btn btn--primary" data-add>${icon('plus')} Ajouter une chambre</button>`);
  } else if (mode === 'rooms') {
    const pg = pager(res.pagination, (p) => renderAllRooms(view, mode, p, propertyId));
    box.innerHTML = `<div class="table-wrap"><table class="table">${TABLE_HEAD}<tbody>${res.data.map((r) => roomRow(r, { showProperty: true })).join('')}</tbody></table></div>${pg.html}`;
    pg.bind(box);
    bindRoomActions(box, res.data, reload);
  } else {
    box.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Chambre</th><th>Établissement</th><th>Total</th><th>Disponibles aujourd’hui</th><th>Prix de base</th><th>Statut</th><th></th></tr></thead><tbody>
      ${res.data
        .map(
          (r) => `<tr><td><strong>${esc(r.name)}</strong></td><td>${esc(r.propertyName)}</td><td>${r.totalRooms}</td><td>${r.availableRooms}</td><td>${fmtPrice(r.basePrice)}</td><td>${badge(r.status)}</td>
        <td><div class="actions"><a class="btn btn--primary btn--sm" href="#/rooms/${r.id}/${mode}">${mode === 'rates' ? `${icon('tag', 14)} Gérer les tarifs` : `${icon('calendar', 14)} Ouvrir le calendrier`}</a></div></td></tr>`
        )
        .join('')}</tbody></table></div>`;
  }

  view.querySelector('#fProp')?.addEventListener('change', (e) => renderAllRooms(view, mode, 1, e.target.value));
  const pickAndAdd = () => {
    const current = view.querySelector('#fProp')?.value;
    if (current) return roomModal(current, null, reload);
    const { el, close } = modal('Ajouter une chambre', `
      <label class="field">Établissement<select id="pickProp">${properties.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label>
      <div class="form-actions"><button type="button" class="btn btn--ghost" data-close>Annuler</button><button type="button" class="btn btn--primary" id="pickOk">Continuer</button></div>`);
    el.querySelector('#pickOk').onclick = () => {
      const id = el.querySelector('#pickProp').value;
      close();
      roomModal(id, null, reload);
    };
  };
  view.querySelector('#addRoom')?.addEventListener('click', pickAndAdd);
  view.querySelector('[data-add]')?.addEventListener('click', pickAndAdd);
}

// ─── Tarifs d'une chambre ────────────────────────────────────────────────

export async function renderRates(view, roomId) {
  const [{ data: room }, { data: seasonal }] = await Promise.all([api.get(`/rooms/${roomId}`), api.get(`/rooms/${roomId}/seasonal-rates`)]);
  const pid = encodeURIComponent(room.propertyId);
  view.innerHTML = `
    <div class="crumbs"><a href="#/properties/${pid}">${esc(room.propertyName)}</a>${icon('chevronRight', 12)}<a href="#/properties/${pid}/rooms">Chambres</a>${icon('chevronRight', 12)}${esc(room.name)}${icon('chevronRight', 12)}Tarifs</div>
    <div class="page-head">
      <div><h1>Tarifs — ${esc(room.name)}</h1><p>${esc(room.propertyName)} · Prix de base ${fmtPrice(room.basePrice)} / nuit</p></div>
      <div class="page-head__actions"><a class="btn btn--ghost" href="#/rooms/${room.id}/availability">${icon('calendar')} Disponibilité</a><button type="button" class="btn btn--primary" id="addRate">${icon('plus')} Nouveau tarif</button></div>
    </div>
    <div class="notice">Ordre de calcul du prix d’une nuit : prix forcé dans le calendrier → tarif saisonnier → prix du tarif choisi → prix de base de la chambre.</div>
    <div class="stack">
      <div class="card"><div class="card__head"><h2>Plans tarifaires</h2></div><div class="card__body">
        ${
          room.rates.length
            ? `<div class="table-wrap"><table class="table"><thead><tr><th>Tarif</th><th>Formule</th><th>Prix / nuit</th><th>Annulation</th><th>Statut</th><th></th></tr></thead><tbody>
          ${room.rates
            .map(
              (r) => `<tr><td><strong>${esc(r.name)}</strong>${r.description ? `<br><small class="muted">${esc(r.description)}</small>` : ''}</td><td>${esc(MEAL_PLANS[r.mealPlan] || r.mealPlan)}</td><td><strong>${fmtPrice(r.price, r.currency)}</strong></td>
            <td><small>${esc(r.cancellationPolicy || '—')}</small></td><td>${badge(r.status)}</td>
            <td><div class="actions"><button type="button" class="btn btn--ghost btn--sm" data-edit="${r.id}">${icon('edit', 14)} Modifier</button>
            <button type="button" class="btn btn--ghost btn--sm" data-status="${r.id}" data-next="${r.status === 'active' ? 'inactive' : 'active'}">${icon('power', 14)} ${r.status === 'active' ? 'Désactiver' : 'Activer'}</button>
            <button type="button" class="btn btn--danger-ghost btn--sm" data-delete="${r.id}" title="Supprimer">${icon('trash', 14)}</button></div></td></tr>`
            )
            .join('')}</tbody></table></div>`
            : '<p class="muted" style="margin:0">Aucun plan tarifaire : le prix de base de la chambre est appliqué. Ajoutez par exemple « Tarif standard », « Petit-déjeuner inclus » ou « Non remboursable ».</p>'
        }
      </div></div>
      <div class="card"><div class="card__head"><h2>Tarifs selon les dates</h2><button type="button" class="btn btn--ghost btn--sm" id="addSeason">${icon('plus', 14)} Ajouter une période</button></div><div class="card__body">
        ${
          seasonal.length
            ? `<div class="table-wrap"><table class="table"><thead><tr><th>Période</th><th>Libellé</th><th>Tarif concerné</th><th>Prix / nuit</th><th>Statut</th><th></th></tr></thead><tbody>
          ${seasonal
            .map(
              (s) => `<tr><td>${fmtDate(s.startDate)} → ${fmtDate(s.endDate)}</td><td>${esc(s.label || '—')}</td><td>${esc(room.rates.find((r) => r.id === s.ratePlanId)?.name || 'Tous les tarifs')}</td><td><strong>${fmtPrice(s.price)}</strong></td><td>${badge(s.status)}</td>
            <td><div class="actions"><button type="button" class="btn btn--ghost btn--sm" data-season="${s.id}">${icon('edit', 14)} Modifier</button><button type="button" class="btn btn--danger-ghost btn--sm" data-season-del="${s.id}">${icon('trash', 14)}</button></div></td></tr>`
            )
            .join('')}</tbody></table></div>`
            : '<p class="muted" style="margin:0">Aucune période spéciale. Exemple : haute saison du 1er juillet au 31 août à 22 000 DA.</p>'
        }
      </div></div>
    </div>`;

  const reload = () => renderRates(view, roomId);
  view.querySelector('#addRate').addEventListener('click', () => rateModal(room, null, reload));
  view.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => rateModal(room, room.rates.find((r) => r.id === b.dataset.edit), reload)));
  view.querySelectorAll('[data-status]').forEach((b) =>
    b.addEventListener('click', async () => {
      try {
        await api.patch(`/rates/${b.dataset.status}/status`, { status: b.dataset.next });
        toast('Tarif mis à jour.');
        reload();
      } catch (err) {
        showError(err);
      }
    })
  );
  view.querySelectorAll('[data-delete]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (!(await confirmDialog('Supprimer ce tarif ?', { confirmLabel: 'Supprimer', danger: true }))) return;
      try {
        await api.del(`/rates/${b.dataset.delete}`);
        toast('Tarif supprimé.');
        reload();
      } catch (err) {
        showError(err);
      }
    })
  );
  view.querySelector('#addSeason').addEventListener('click', () => seasonModal(room, null, reload));
  view.querySelectorAll('[data-season]').forEach((b) => b.addEventListener('click', () => seasonModal(room, seasonal.find((s) => s.id === b.dataset.season), reload)));
  view.querySelectorAll('[data-season-del]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (!(await confirmDialog('Supprimer cette période tarifaire ?', { confirmLabel: 'Supprimer', danger: true }))) return;
      try {
        await api.del(`/seasonal-rates/${b.dataset.seasonDel}`);
        toast('Période supprimée.');
        reload();
      } catch (err) {
        showError(err);
      }
    })
  );
}

function rateModal(room, rate, onSaved) {
  const r = rate || { currency: 'DZD', mealPlan: 'ROOM_ONLY', status: 'active', price: room.basePrice };
  const { el, close } = modal(rate ? `Modifier « ${rate.name} »` : 'Nouveau tarif', `
    <form id="rateForm" novalidate>
      <div class="form-grid">
        <label class="field full">Nom du tarif <span class="req">*</span><input type="text" name="name" value="${esc(r.name || '')}" required maxlength="120" list="ratePresets" placeholder="Ex. Tarif standard">
          <datalist id="ratePresets">${['Tarif standard', 'Tarif non remboursable', 'Tarif petit-déjeuner inclus', 'Tarif famille', 'Tarif promotionnel'].map((n) => `<option value="${n}">`).join('')}</datalist></label>
        <label class="field">Prix par nuit <span class="req">*</span><input type="number" data-type="number" name="price" value="${r.price ?? ''}" min="0" step="100" required></label>
        <label class="field">Devise<select name="currency">${['DZD', 'EUR', 'USD'].map((c) => `<option ${r.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="field">Formule repas<select name="mealPlan">${Object.entries(MEAL_PLANS).map(([k, l]) => `<option value="${k}" ${r.mealPlan === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="field">Statut<select name="status"><option value="active" ${r.status === 'active' ? 'selected' : ''}>Actif</option><option value="inactive" ${r.status === 'inactive' ? 'selected' : ''}>Inactif</option></select></label>
        <label class="field full">Description<textarea name="description" rows="2" maxlength="2000">${esc(r.description || '')}</textarea></label>
        <label class="field full">Conditions d’annulation<textarea name="cancellationPolicy" rows="2" maxlength="2000" placeholder="Ex. Annulation gratuite jusqu’à 48 h avant l’arrivée">${esc(r.cancellationPolicy || '')}</textarea></label>
      </div>
      <div class="form-actions"><button type="button" class="btn btn--ghost" data-close>Annuler</button><button type="submit" class="btn btn--primary">${icon('check')} Enregistrer</button></div>
    </form>`);
  el.querySelector('[data-close]').onclick = close;
  const form = el.querySelector('#rateForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    await busy(form.querySelector('[type=submit]'), async () => {
      try {
        if (rate) await api.put(`/rates/${rate.id}`, formValues(form));
        else await api.post(`/rooms/${room.id}/rates`, formValues(form));
        close();
        toast('Tarif enregistré.');
        onSaved();
      } catch (err) {
        showError(err);
      }
    });
  });
}

function seasonModal(room, season, onSaved) {
  const s = season || { status: 'active' };
  const { el, close } = modal(season ? 'Modifier la période' : 'Nouvelle période tarifaire', `
    <form id="seasonForm" novalidate>
      <div class="form-grid">
        <label class="field full">Libellé<input type="text" name="label" value="${esc(s.label || '')}" maxlength="120" placeholder="Ex. Haute saison, Week-end, Promotion"></label>
        <label class="field">Du <span class="req">*</span><input type="date" name="startDate" value="${esc(s.startDate || '')}" required></label>
        <label class="field">Au <span class="req">*</span><input type="date" name="endDate" value="${esc(s.endDate || '')}" required></label>
        <label class="field">Prix par nuit (DA) <span class="req">*</span><input type="number" data-type="number" name="price" value="${s.price ?? ''}" min="0" step="100" required></label>
        <label class="field">Appliquer à<select name="ratePlanId"><option value="">Tous les tarifs de la chambre</option>${room.rates.map((r) => `<option value="${r.id}" ${s.ratePlanId === r.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>
        <label class="field">Statut<select name="status"><option value="active" ${s.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${s.status === 'inactive' ? 'selected' : ''}>Inactive</option></select></label>
      </div>
      <div class="form-actions"><button type="button" class="btn btn--ghost" data-close>Annuler</button><button type="submit" class="btn btn--primary">${icon('check')} Enregistrer</button></div>
    </form>`);
  el.querySelector('[data-close]').onclick = close;
  const form = el.querySelector('#seasonForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const body = formValues(form);
    if (body.startDate > body.endDate) return showError({ message: 'La date de début doit être avant la date de fin.' });
    await busy(form.querySelector('[type=submit]'), async () => {
      try {
        if (season) await api.put(`/seasonal-rates/${season.id}`, body);
        else await api.post(`/rooms/${room.id}/seasonal-rates`, body);
        close();
        toast('Période enregistrée.');
        onSaved();
      } catch (err) {
        showError(err);
      }
    });
  });
}
