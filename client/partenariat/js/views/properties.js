import { api, ADMIN_MODE, listOwners, uploadImage } from '../api.js';
import {
  esc, icon, badge, toast, showError, confirmDialog, formValues, busy, PROPERTY_TYPES, fmtPrice, imgSrc, go, pager, loader, empty,
} from '../ui.js';

const UNIT_TYPES = new Set(['APARTMENT', 'VILLA']);
const TYPE_ICONS = { HOTEL: 'building', APARTMENT: 'home', VILLA: 'home', GUESTHOUSE: 'home', RESIDENCE: 'building', OTHER: 'building' };
let amenitiesCache = null;

async function amenities() {
  if (!amenitiesCache) amenitiesCache = (await api.get('/amenities')).data;
  return amenitiesCache;
}

const state = { q: '', status: '', type: '', ownerId: '', sort: 'created', page: 1 };

// ─── Liste ────────────────────────────────────────────────────────────────

export async function renderProperties(view) {
  const owners = ADMIN_MODE ? await listOwners() : [];
  view.innerHTML = `
    <div class="page-head">
      <div><h1>${ADMIN_MODE ? 'Tous les hébergements' : 'Mes établissements'}</h1><p>${ADMIN_MODE ? 'Hôtels, appartements et logements de tous les propriétaires' : 'Gérez vos hôtels, appartements et logements'}</p></div>
      <div class="page-head__actions"><a class="btn btn--primary" href="#/properties/new">${icon('plus')} Ajouter un hébergement</a></div>
    </div>
    <div class="toolbar">
      <input type="search" class="search" id="fQ" placeholder="Rechercher un établissement ou une ville…" value="${esc(state.q)}">
      <select id="fType" style="width:auto"><option value="">Tous les types</option>${Object.entries(PROPERTY_TYPES).map(([k, l]) => `<option value="${k}" ${state.type === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <select id="fStatus" style="width:auto"><option value="">Tous les statuts</option>${['active', 'inactive', 'pending'].map((s) => `<option value="${s}" ${state.status === s ? 'selected' : ''}>${{ active: 'Actifs', inactive: 'Inactifs', pending: 'En attente' }[s]}</option>`).join('')}</select>
      ${ADMIN_MODE ? `<select id="fOwner" style="width:auto"><option value="">Tous les propriétaires</option>${owners.map((o) => `<option value="${o.id}" ${state.ownerId === o.id ? 'selected' : ''}>${esc(`${o.firstName} ${o.lastName}`)}</option>`).join('')}</select>` : ''}
      <select id="fSort" style="width:auto">
        <option value="created" ${state.sort === 'created' ? 'selected' : ''}>Plus récents</option>
        <option value="name" ${state.sort === 'name' ? 'selected' : ''}>Nom (A → Z)</option>
        <option value="city" ${state.sort === 'city' ? 'selected' : ''}>Ville</option>
        <option value="updated" ${state.sort === 'updated' ? 'selected' : ''}>Dernière modification</option>
      </select>
    </div>
    <div id="propList">${loader()}</div>`;

  const reload = () => loadList(view.querySelector('#propList'));
  let timer;
  view.querySelector('#fQ').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.q = e.target.value.trim();
      state.page = 1;
      reload();
    }, 300);
  });
  for (const [id, key] of [['fType', 'type'], ['fStatus', 'status'], ['fOwner', 'ownerId'], ['fSort', 'sort']]) {
    view.querySelector(`#${id}`)?.addEventListener('change', (e) => {
      state[key] = e.target.value;
      state.page = 1;
      reload();
    });
  }
  await reload();
}

async function loadList(box) {
  const params = new URLSearchParams({ page: state.page, limit: 12, sort: state.sort, order: state.sort === 'name' || state.sort === 'city' ? 'asc' : 'desc' });
  if (state.q) params.set('q', state.q);
  if (state.status) params.set('status', state.status);
  if (state.type) params.set('type', state.type);
  if (state.ownerId) params.set('ownerId', state.ownerId);
  box.innerHTML = loader();
  const res = await api.get(`/properties?${params}`);
  if (!res.data.length) {
    box.innerHTML = `<div class="card">${empty(
      state.q || state.status || state.type || state.ownerId ? 'Aucun résultat' : 'Aucun hébergement pour le moment',
      state.q || state.status || state.type ? 'Modifiez les filtres pour élargir la recherche.' : 'Ajoutez votre premier hôtel ou appartement.',
      `<a class="btn btn--primary" href="#/properties/new">${icon('plus')} Ajouter un hébergement</a>`
    )}</div>`;
    return;
  }
  const pg = pager(res.pagination, (p) => {
    state.page = p;
    loadList(box);
  });
  box.innerHTML = `<div class="prop-cards">${res.data.map(card).join('')}</div>${pg.html}`;
  pg.bind(box);
  box.querySelectorAll('[data-toggle]').forEach((b) =>
    b.addEventListener('click', () => toggleStatus(b.dataset.toggle, b.dataset.status).then(() => loadList(box)))
  );
}

function card(p) {
  const id = encodeURIComponent(p.id);
  return `
    <article class="card prop-card">
      <a class="prop-card__img" href="#/properties/${id}">
        ${p.image ? `<img src="${imgSrc(p.image)}" alt="" loading="lazy">` : `<div class="thumb-ph" style="height:100%">${icon('image', 32)}</div>`}
        ${badge(p.status)}
      </a>
      <div class="prop-card__body">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
          <h3><a href="#/properties/${id}" style="color:inherit">${esc(p.name)}</a></h3>
          <span class="badge badge--type">${esc(PROPERTY_TYPES[p.propertyType] || p.propertyType)}</span>
        </div>
        <div class="meta">
          <span>${icon('pin', 13)}${esc([p.city, p.wilaya].filter(Boolean).join(', ') || '—')}</span>
          <span>${icon('bed', 13)}${p.roomCount} chambre(s) · ${p.roomTypeCount} type(s)</span>
          ${ADMIN_MODE && p.owner ? `<span>${icon('user', 13)}${esc(p.owner.name)}</span>` : ''}
        </div>
        <div class="meta"><span>${p.status === 'active' && p.roomTypeCount ? '<span class="dot dot--green"></span>Réservable' : '<span class="dot dot--grey"></span>Non réservable'}</span></div>
      </div>
      <div class="prop-card__actions">
        <a class="btn btn--ghost btn--sm" href="#/properties/${id}">${icon('eye', 14)} Voir</a>
        <a class="btn btn--ghost btn--sm" href="#/properties/${id}/edit">${icon('edit', 14)} Modifier</a>
        <a class="btn btn--ghost btn--sm" href="#/properties/${id}/rooms">${icon('bed', 14)} Chambres</a>
        <a class="btn btn--ghost btn--sm" href="#/properties/${id}/rooms?then=rates">${icon('tag', 14)} Tarifs</a>
        <a class="btn btn--ghost btn--sm" href="#/properties/${id}/rooms?then=availability">${icon('calendar', 14)} Disponibilité</a>
        <button type="button" class="btn btn--ghost btn--sm" data-toggle="${esc(p.id)}" data-status="${p.status === 'active' ? 'inactive' : 'active'}">${icon('power', 14)} ${p.status === 'active' ? 'Désactiver' : 'Activer'}</button>
      </div>
    </article>`;
}

async function toggleStatus(id, status) {
  if (status === 'inactive' && !(await confirmDialog('Désactiver cet hébergement ? Il ne sera plus visible ni réservable sur le site.', { confirmLabel: 'Désactiver', danger: true }))) return;
  try {
    await api.patch(`/properties/${encodeURIComponent(id)}/status`, { status });
    toast(status === 'active' ? 'Hébergement activé.' : 'Hébergement désactivé.');
  } catch (err) {
    showError(err);
  }
}

// ─── Formulaire ───────────────────────────────────────────────────────────

export async function renderPropertyForm(view, id) {
  const [prop, allAmenities, owners] = await Promise.all([
    id ? api.get(`/properties/${encodeURIComponent(id)}`).then((r) => r.data) : null,
    amenities(),
    ADMIN_MODE ? listOwners() : [],
  ]);
  const p = prop || { propertyType: 'HOTEL', status: 'active', checkInTime: '14:00', checkOutTime: '12:00', amenities: [], images: [] };
  const pending = [];
  const field = (name, label, { type = 'text', req = false, value = p[name], attrs = '', full = false, hint = '' } = {}) => `
    <label class="field ${full ? 'full' : ''}">${esc(label)}${req ? ' <span class="req">*</span>' : ''}${hint ? ` <small>${esc(hint)}</small>` : ''}
      <input type="${type}" name="${name}" value="${esc(value ?? '')}" ${req ? 'required' : ''} ${type === 'number' ? 'data-type="number"' : ''} ${attrs}>
    </label>`;

  view.innerHTML = `
    <div class="crumbs"><a href="#/properties">${ADMIN_MODE ? 'Hébergements' : 'Mes hébergements'}</a>${icon('chevronRight', 12)}${prop ? `<a href="#/properties/${encodeURIComponent(prop.id)}">${esc(prop.name)}</a>${icon('chevronRight', 12)}Modifier` : 'Nouvel hébergement'}</div>
    <div class="page-head"><div><h1>${prop ? `Modifier « ${esc(prop.name)} »` : 'Ajouter un hébergement'}</h1><p>Les champs marqués <span class="req">*</span> sont obligatoires.</p></div></div>
    <form class="card" id="propForm" novalidate>
      <div class="form-section">
        <h3>Type d’établissement <span class="req">*</span></h3>
        <div class="type-picker">
          ${Object.entries(PROPERTY_TYPES).map(([k, l]) => `<label><input type="radio" name="propertyType" value="${k}" ${p.propertyType === k ? 'checked' : ''}>${icon(TYPE_ICONS[k], 22)}${l}</label>`).join('')}
        </div>
      </div>
      ${ADMIN_MODE ? `<div class="form-section"><h3>Propriétaire <span class="req">*</span></h3>
        <select name="ownerId" required><option value="">— Choisir un propriétaire —</option>${owners.map((o) => `<option value="${o.id}" ${p.ownerId === o.id ? 'selected' : ''}>${esc(`${o.firstName} ${o.lastName} — ${o.email}`)}</option>`).join('')}</select>
        ${owners.length ? '' : '<p class="notice notice--warn" style="margin-top:10px">Créez d’abord un propriétaire dans l’admin (section Propriétaires).</p>'}</div>` : ''}
      <div class="form-section">
        <h3>Informations générales</h3>
        <div class="form-grid">
          ${field('name', 'Nom de l’établissement', { req: true, full: true, attrs: 'maxlength="150" placeholder="Ex. Hôtel Atlantis"' })}
          <label class="field full">Description <span class="req">*</span><textarea name="description" required rows="5" maxlength="8000" placeholder="Présentez votre établissement, son ambiance, ses atouts…">${esc(p.description || '')}</textarea></label>
          ${field('shortDescription', 'Description courte', { full: true, attrs: 'maxlength="300" placeholder="Une phrase d’accroche affichée dans les listes"' })}
        </div>
      </div>
      <div class="form-section">
        <h3>Adresse et contact</h3>
        <div class="form-grid">
          ${field('address', 'Adresse', { req: true, full: true, attrs: 'maxlength="300"' })}
          ${field('city', 'Ville', { req: true, attrs: 'maxlength="100" placeholder="Ex. Béjaïa"' })}
          ${field('wilaya', 'Wilaya', { req: true, attrs: 'maxlength="100" placeholder="Ex. Béjaïa"' })}
          ${field('phone', 'Téléphone', { type: 'tel', attrs: 'pattern="[0-9+ .\\(\\)\\-]{8,20}"' })}
          ${field('email', 'Email', { type: 'email' })}
          ${field('latitude', 'Latitude', { type: 'number', attrs: 'step="any" min="-90" max="90"', hint: 'facultatif' })}
          ${field('longitude', 'Longitude', { type: 'number', attrs: 'step="any" min="-180" max="180"', hint: 'facultatif' })}
        </div>
      </div>
      <div class="form-section">
        <h3>Séjour</h3>
        <div class="form-grid form-grid--3">
          ${field('checkInTime', 'Arrivée (check-in)', { type: 'time' })}
          ${field('checkOutTime', 'Départ (check-out)', { type: 'time' })}
          <label class="field">Statut
            <select name="status">
              <option value="active" ${p.status === 'active' ? 'selected' : ''}>Actif (visible et réservable)</option>
              <option value="inactive" ${p.status === 'inactive' ? 'selected' : ''}>Inactif (masqué)</option>
              ${ADMIN_MODE ? `<option value="pending" ${p.status === 'pending' ? 'selected' : ''}>En attente de validation</option>` : ''}
            </select>
          </label>
        </div>
        <div class="form-grid form-grid--3" id="unitFields">
          ${field('maxGuests', 'Nombre de personnes', { type: 'number', attrs: 'min="1" max="500"' })}
          ${field('bedrooms', 'Nombre de chambres', { type: 'number', attrs: 'min="0" max="500"' })}
          ${field('beds', 'Nombre de lits', { type: 'number', attrs: 'min="0" max="1000"' })}
          ${field('basePrice', 'Prix de base par nuit (DA)', { type: 'number', attrs: 'min="0" step="100"' })}
        </div>
        ${ADMIN_MODE ? `<label class="switch"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Mettre en avant sur le site</label>` : ''}
      </div>
      <div class="form-section">
        <h3>Équipements</h3>
        <div class="checks">
          ${allAmenities.filter((a) => a.scope !== 'room').map((a) => `<label class="check"><input type="checkbox" data-group="amenities" name="am_${a.code}" value="${a.code}" ${p.amenities.includes(a.code) ? 'checked' : ''}>${esc(a.label)}</label>`).join('')}
        </div>
      </div>
      <div class="form-section">
        <h3>Photos</h3>
        ${prop ? '<p class="muted" style="margin-top:-8px">Les photos se gèrent sur la fiche de l’établissement.</p>' : '<p class="muted" style="margin-top:-8px">La première photo sera la photo principale.</p><div id="photoBox"></div>'}
      </div>
      <div class="form-actions form-actions--sticky">
        <a class="btn btn--ghost" href="${prop ? `#/properties/${encodeURIComponent(prop.id)}` : '#/properties'}">Annuler</a>
        <button type="submit" class="btn btn--primary">${icon('check')} ${prop ? 'Enregistrer' : 'Créer l’établissement'}</button>
      </div>
    </form>`;

  const form = view.querySelector('#propForm');
  const syncUnit = () => {
    const type = form.querySelector('input[name=propertyType]:checked')?.value;
    view.querySelector('#unitFields').hidden = !UNIT_TYPES.has(type) && type !== 'GUESTHOUSE' && type !== 'RESIDENCE' && type !== 'OTHER';
  };
  form.querySelectorAll('input[name=propertyType]').forEach((r) => r.addEventListener('change', syncUnit));
  syncUnit();

  if (!prop) {
    photoManager(view.querySelector('#photoBox'), {
      list: () => pending.map((url, i) => ({ id: String(i), url, isPrimary: i === 0 })),
      add: async (urls) => pending.push(...urls),
      remove: async (img) => pending.splice(Number(img.id), 1),
      primary: async (img) => pending.unshift(...pending.splice(Number(img.id), 1)),
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const values = formValues(form);
    const body = { ...values, amenities: values.amenities || [] };
    for (const k of Object.keys(body)) if (k.startsWith('am_')) delete body[k];
    if (!prop) body.images = pending.slice();
    await busy(form.querySelector('[type=submit]'), async () => {
      try {
        const res = prop ? await api.put(`/properties/${encodeURIComponent(prop.id)}`, body) : await api.post('/properties', body);
        toast(prop ? 'Établissement enregistré.' : 'Établissement créé avec succès.');
        go(prop ? `/properties/${encodeURIComponent(res.data.id)}` : `/properties/${encodeURIComponent(res.data.id)}/rooms`);
      } catch (err) {
        showError(err);
      }
    });
  });
}

/** Gestion des photos : envoi de fichiers, ajout par URL, photo principale, suppression. */
function photoManager(box, ops) {
  const draw = () => {
    const images = ops.list();
    box.innerHTML = `
      <div class="photos">
        ${images
          .map(
            (img) => `
          <div class="photo ${img.isPrimary ? 'is-primary' : ''}">
            <img src="${imgSrc(img.url)}" alt="${esc(img.alt || '')}" loading="lazy">
            ${img.isPrimary ? '<span class="photo__tag">Principale</span>' : ''}
            <div class="photo__actions">
              ${img.isPrimary ? '' : `<button type="button" title="Définir comme principale" data-primary="${esc(img.id)}">${icon('star', 15)}</button>`}
              <button type="button" title="Supprimer" data-remove="${esc(img.id)}">${icon('trash', 15)}</button>
            </div>
          </div>`
          )
          .join('')}
        <label class="dropzone" id="dropzone">${icon('upload', 24)}<span>Ajouter des photos<br><small>JPG, PNG, WebP — glisser-déposer</small></span><input type="file" accept="image/*" multiple hidden></label>
      </div>
      <div class="url-add"><input type="url" placeholder="… ou collez l’adresse d’une photo (https://…)" id="photoUrl"><button type="button" class="btn btn--ghost" id="photoUrlBtn">Ajouter</button></div>`;
    const input = box.querySelector('input[type=file]');
    const zone = box.querySelector('#dropzone');
    input.addEventListener('change', () => upload([...input.files]));
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('is-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('is-over');
      upload([...e.dataTransfer.files]);
    });
    box.querySelector('#photoUrlBtn').addEventListener('click', async () => {
      const url = box.querySelector('#photoUrl').value.trim();
      if (!/^https?:\/\/\S+$/i.test(url)) return showError({ message: 'Adresse de photo invalide (elle doit commencer par https://).' });
      await run(() => ops.add([url]));
    });
    box.querySelectorAll('[data-remove]').forEach((b) =>
      b.addEventListener('click', async () => {
        if (await confirmDialog('Supprimer cette photo ?', { confirmLabel: 'Supprimer', danger: true })) {
          await run(() => ops.remove(images.find((i) => i.id === b.dataset.remove)));
        }
      })
    );
    box.querySelectorAll('[data-primary]').forEach((b) => b.addEventListener('click', () => run(() => ops.primary(images.find((i) => i.id === b.dataset.primary)))));
  };

  async function run(fn) {
    try {
      await fn();
      await ops.refresh?.();
      draw();
    } catch (err) {
      showError(err);
    }
  }

  async function upload(files) {
    const images = files.filter((f) => /^image\//.test(f.type)).slice(0, 20);
    if (!images.length) return;
    const zone = box.querySelector('#dropzone');
    zone.innerHTML = `<span class="spinner"></span><span>Envoi de ${images.length} photo(s)…</span>`;
    try {
      const urls = [];
      for (const f of images) urls.push(await uploadImage(f));
      await run(() => ops.add(urls));
      toast(`${urls.length} photo(s) ajoutée(s).`);
    } catch (err) {
      showError(err);
      draw();
    }
  }

  draw();
}

// ─── Fiche ────────────────────────────────────────────────────────────────

export async function renderPropertyDetail(view, id) {
  let p = (await api.get(`/properties/${encodeURIComponent(id)}`)).data;
  const allAmenities = await amenities();
  const label = (code) => allAmenities.find((a) => a.code === code)?.label || code;
  const eid = encodeURIComponent(p.id);
  const imgs = p.images.length ? p.images : p.image ? [{ url: p.image }] : [];
  const ph = `<div class="thumb-ph">${icon('image', 32)}</div>`;

  view.innerHTML = `
    <div class="crumbs"><a href="#/properties">${ADMIN_MODE ? 'Hébergements' : 'Mes hébergements'}</a>${icon('chevronRight', 12)}${esc(p.name)}</div>
    <div class="page-head">
      <div><h1>${esc(p.name)}</h1>
        <div class="meta" style="margin-top:6px"><span class="badge badge--type">${esc(PROPERTY_TYPES[p.propertyType] || p.propertyType)}</span>${badge(p.status)}<span>${icon('pin', 13)}${esc([p.address, p.city, p.wilaya].filter(Boolean).join(', '))}</span></div>
      </div>
      <div class="page-head__actions">
        <a class="btn btn--ghost" href="#/properties/${eid}/edit">${icon('edit')} Modifier</a>
        <button type="button" class="btn btn--ghost" id="toggleBtn">${icon('power')} ${p.status === 'active' ? 'Désactiver' : 'Activer'}</button>
        <a class="btn btn--primary" href="#/properties/${eid}/rooms">${icon('bed')} Gérer les chambres</a>
      </div>
    </div>
    <div class="detail-hero">
      ${imgs[0] ? `<img src="${imgSrc(imgs[0].url)}" alt="">` : ph}
      <div class="detail-hero__side">${imgs[1] ? `<img src="${imgSrc(imgs[1].url)}" alt="">` : ph}${imgs[2] ? `<img src="${imgSrc(imgs[2].url)}" alt="">` : ph}</div>
    </div>
    <div class="grid-dash">
      <div class="stack">
        <div class="card"><div class="card__head"><h2>Description</h2></div><div class="card__body">
          ${p.shortDescription ? `<p><strong>${esc(p.shortDescription)}</strong></p>` : ''}
          <p style="white-space:pre-line;margin:0">${esc(p.description || '—')}</p>
        </div></div>
        <div class="card"><div class="card__head"><h2>Chambres et unités</h2><a class="link-btn" href="#/properties/${eid}/rooms">Gérer ${icon('arrowRight', 13)}</a></div><div class="card__body">
          ${
            p.rooms.length
              ? `<div class="table-wrap"><table class="table"><thead><tr><th>Type</th><th>Capacité</th><th>Total</th><th>Dispo. aujourd’hui</th><th>Prix</th><th>Statut</th><th></th></tr></thead><tbody>
            ${p.rooms
              .map(
                (r) => `<tr><td><strong>${esc(r.name)}</strong></td><td>${r.capacityAdults} ad.${r.capacityChildren ? ` + ${r.capacityChildren} enf.` : ''}</td><td>${r.totalRooms}</td><td>${r.availableRooms}</td><td>${fmtPrice(r.basePrice)}</td><td>${badge(r.status)}</td>
              <td><div class="actions"><a class="btn btn--ghost btn--sm" href="#/rooms/${r.id}/rates">${icon('tag', 14)} Tarifs</a><a class="btn btn--ghost btn--sm" href="#/rooms/${r.id}/availability">${icon('calendar', 14)} Calendrier</a></div></td></tr>`
              )
              .join('')}</tbody></table></div>`
              : `<div class="empty" style="padding:24px"><h3>Aucune chambre</h3><p>Ajoutez les types de chambres pour rendre l’établissement réservable.</p><a class="btn btn--primary" href="#/properties/${eid}/rooms">${icon('plus')} Ajouter une chambre</a></div>`
          }
        </div></div>
        <div class="card"><div class="card__head"><h2>Photos</h2></div><div class="card__body" id="photoBox"></div></div>
      </div>
      <div class="stack">
        <div class="card"><div class="card__head"><h2>Informations</h2></div><div class="card__body">
          <dl class="kv">
            ${ADMIN_MODE && p.owner ? `<dt>Propriétaire</dt><dd>${esc(`${p.owner.firstName} ${p.owner.lastName}`)}<br><small class="muted">${esc(p.owner.email)} · ${esc(p.owner.phone)}</small></dd>` : ''}
            <dt>Arrivée</dt><dd>${esc(p.checkInTime || '—')}</dd>
            <dt>Départ</dt><dd>${esc(p.checkOutTime || '—')}</dd>
            <dt>Téléphone</dt><dd>${esc(p.phone || '—')}</dd>
            <dt>Email</dt><dd>${esc(p.email || '—')}</dd>
            ${p.maxGuests ? `<dt>Capacité</dt><dd>${p.maxGuests} personne(s)</dd>` : ''}
            ${p.bedrooms != null ? `<dt>Chambres</dt><dd>${p.bedrooms}</dd>` : ''}
            ${p.beds != null ? `<dt>Lits</dt><dd>${p.beds}</dd>` : ''}
            ${p.basePrice != null ? `<dt>Prix de base</dt><dd>${fmtPrice(p.basePrice)} / nuit</dd>` : ''}
            <dt>Créé le</dt><dd>${new Date(p.createdAt).toLocaleDateString('fr-FR')}</dd>
          </dl>
        </div></div>
        <div class="card"><div class="card__head"><h2>Équipements</h2><a class="link-btn" href="#/properties/${eid}/edit">Modifier</a></div><div class="card__body">
          ${p.amenities.length ? `<div class="chips">${p.amenities.map((c) => `<span class="chip">${esc(label(c))}</span>`).join('')}</div>` : '<p class="muted" style="margin:0">Aucun équipement renseigné.</p>'}
        </div></div>
        <div class="card"><div class="card__body">
          <button type="button" class="btn btn--danger-ghost btn--block" id="deleteBtn">${icon('trash')} Supprimer l’établissement</button>
          <p class="muted" style="font-size:12px;margin:8px 0 0">L’établissement est retiré du site ; l’historique des réservations est conservé.</p>
        </div></div>
      </div>
    </div>`;

  const refresh = async () => {
    p = (await api.get(`/properties/${eid}`)).data;
  };
  photoManager(view.querySelector('#photoBox'), {
    list: () => p.images,
    refresh,
    add: (urls) => api.post(`/properties/${eid}/images`, { images: urls }),
    remove: (img) => api.del(`/images/${img.id}`),
    primary: (img) => api.patch(`/images/${img.id}/primary`, {}),
  });

  view.querySelector('#toggleBtn').addEventListener('click', async () => {
    await toggleStatus(p.id, p.status === 'active' ? 'inactive' : 'active');
    renderPropertyDetail(view, p.id);
  });
  view.querySelector('#deleteBtn').addEventListener('click', async () => {
    if (!(await confirmDialog(`Supprimer « ${p.name} » ? Il disparaîtra du site et de votre liste.`, { confirmLabel: 'Supprimer', danger: true }))) return;
    try {
      await api.del(`/properties/${eid}`);
      toast('Établissement supprimé.');
      go('/properties');
    } catch (err) {
      showError(err);
    }
  });
}
