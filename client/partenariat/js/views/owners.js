import { api } from '../api.js';
import { esc, icon, badge, toast, showError, confirmDialog, modal, busy, fmtDate, fmtDateTime, loader, empty, pager, PROPERTY_TYPES } from '../ui.js';

/** Comptes partenaires (propriétaires) — réservé au mode admin, routes /admin/owners */
const state = { q: '', status: '', page: 1 };
const call = (path = '', opts) => api.raw(`/admin/owners${path}`, opts);

export async function renderOwners(view) {
  view.innerHTML = `
    <div class="page-head">
      <div><h1>Partenaires</h1><p>Créez les comptes (email et mot de passe) que vos partenaires utilisent pour se connecter</p></div>
      <div class="page-head__actions"><button type="button" class="btn btn--primary" id="addOwner">${icon('plus')} Ajouter un partenaire</button></div>
    </div>
    <div class="tabs" id="tabs">${[['', 'Tous'], ['active', 'Actifs'], ['inactive', 'Inactifs']].map(([k, l]) => `<button type="button" data-tab="${k}" class="${state.status === k ? 'is-active' : ''}">${l}</button>`).join('')}</div>
    <div class="toolbar"><input type="search" class="search" id="fQ" placeholder="Nom, email ou téléphone…" value="${esc(state.q)}"></div>
    <div class="card"><div class="card__body" id="box">${loader()}</div></div>`;

  const box = view.querySelector('#box');
  const reload = () => load(box);
  view.querySelector('#addOwner').addEventListener('click', () => ownerModal(null, reload));
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
  await reload();
}

async function load(box) {
  const params = new URLSearchParams({ page: state.page, limit: 20 });
  if (state.q) params.set('q', state.q);
  if (state.status) params.set('status', state.status);
  box.innerHTML = loader();
  const res = await call(`?${params}`);
  const reload = () => load(box);
  if (!res.data.length) {
    box.innerHTML = empty(
      state.q || state.status ? 'Aucun résultat' : 'Aucun partenaire',
      state.q || state.status ? 'Modifiez la recherche ou le filtre.' : 'Créez le premier compte partenaire : il recevra un email et un mot de passe pour se connecter.',
      `<button type="button" class="btn btn--primary" data-add>${icon('plus')} Ajouter un partenaire</button>`
    );
    box.querySelector('[data-add]').addEventListener('click', () => ownerModal(null, reload));
    return;
  }
  const pg = pager(res.pagination, (p) => {
    state.page = p;
    load(box);
  });
  box.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Nom</th><th>Email (identifiant)</th><th>Téléphone</th><th>Biens</th><th>Statut</th><th>Dernière connexion</th><th></th></tr></thead><tbody>
    ${res.data
      .map(
        (o) => `<tr>
        <td><strong>${esc(`${o.firstName} ${o.lastName}`)}</strong><br><small class="muted">Créé le ${fmtDate(o.createdAt)}</small></td>
        <td><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></td>
        <td>${esc(o.phone || '—')}</td>
        <td>${o.propertyCount || 0}</td>
        <td>${badge(o.status)}</td>
        <td><small>${o.lastLogin ? fmtDateTime(o.lastLogin) : 'Jamais'}</small></td>
        <td><div class="actions">
          <button type="button" class="btn btn--ghost btn--sm" data-view="${o.id}">${icon('eye', 14)} Voir</button>
          <button type="button" class="btn btn--ghost btn--sm" data-edit="${o.id}">${icon('edit', 14)} Modifier</button>
          <button type="button" class="btn btn--ghost btn--sm" data-reset="${o.id}">${icon('lock', 14)} Mot de passe</button>
          <button type="button" class="btn btn--ghost btn--sm" data-status="${o.id}" data-next="${o.status === 'active' ? 'inactive' : 'active'}">${icon('power', 14)} ${o.status === 'active' ? 'Désactiver' : 'Activer'}</button>
          <button type="button" class="btn btn--danger-ghost btn--sm" data-delete="${o.id}" title="Supprimer">${icon('trash', 14)}</button>
        </div></td>
      </tr>`
      )
      .join('')}</tbody></table></div>${pg.html}`;
  pg.bind(box);
  const find = (id) => res.data.find((o) => o.id === id);
  box.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => ownerDetail(b.dataset.view, reload)));
  box.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => ownerModal(find(b.dataset.edit), reload)));
  box.querySelectorAll('[data-reset]').forEach((b) => b.addEventListener('click', () => resetModal(find(b.dataset.reset))));
  box.querySelectorAll('[data-status]').forEach((b) =>
    b.addEventListener('click', async () => {
      const o = find(b.dataset.status);
      const next = b.dataset.next;
      if (next === 'inactive' && !(await confirmDialog(`Désactiver ${o.firstName} ${o.lastName} ? Il ne pourra plus se connecter et ses biens seront masqués du site.`, { confirmLabel: 'Désactiver', danger: true }))) return;
      try {
        await call(`/${o.id}/status`, { method: 'PATCH', body: { status: next } });
        toast(next === 'active' ? 'Partenaire activé.' : 'Partenaire désactivé.');
        reload();
      } catch (err) {
        showError(err);
      }
    })
  );
  box.querySelectorAll('[data-delete]').forEach((b) =>
    b.addEventListener('click', async () => {
      const o = find(b.dataset.delete);
      if (!(await confirmDialog(`Supprimer le compte de ${o.firstName} ${o.lastName} ? Ses biens sont retirés du site ; l’historique des réservations est conservé.`, { confirmLabel: 'Supprimer', danger: true }))) return;
      try {
        await call(`/${o.id}`, { method: 'DELETE' });
        toast('Partenaire supprimé.');
        reload();
      } catch (err) {
        showError(err);
      }
    })
  );
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  let out = Array.from(bytes, (b) => chars[b % chars.length]).join('');
  if (!/\d/.test(out)) out = `${out.slice(0, -1)}7`;
  if (!/[a-z]/i.test(out)) out = `a${out.slice(1)}`;
  return out;
}

const passwordFields = () => `
  <label class="field">Mot de passe <span class="req">*</span><input type="text" name="password" required minlength="8" autocomplete="new-password" spellcheck="false"></label>
  <label class="field">Confirmation <span class="req">*</span><input type="text" name="confirmPassword" required autocomplete="new-password" spellcheck="false"></label>
  <div class="field full"><small class="muted">8 caractères minimum, avec au moins une lettre et un chiffre.</small>
    <div><button type="button" class="btn btn--ghost btn--sm" data-gen>${icon('lock', 14)} Générer un mot de passe</button></div></div>`;

function bindPasswords(form) {
  form.querySelector('[data-gen]').addEventListener('click', () => {
    const pwd = generatePassword();
    form.password.value = pwd;
    form.confirmPassword.value = pwd;
  });
}

function passwordError(form) {
  const pwd = form.password.value;
  if (pwd.length < 8 || !/[a-z]/i.test(pwd) || !/\d/.test(pwd)) return 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.';
  if (pwd !== form.confirmPassword.value) return 'Les mots de passe ne correspondent pas.';
  return '';
}

/** Après création ou réinitialisation : identifiants à transmettre au partenaire */
function showCredentials(title, email, password) {
  const url = new URL('./', location.href).href.replace(/\?.*$/, '');
  const text = `Espace partenaire Algeria Travel\nAdresse : ${url}\nEmail : ${email}\nMot de passe : ${password}`;
  const { el, close } = modal(title, `
    <p>Transmettez ces identifiants au partenaire (WhatsApp, email…). Il pourra changer son mot de passe depuis « Mon profil ».</p>
    <dl class="kv">
      <dt>Adresse</dt><dd><a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></dd>
      <dt>Email</dt><dd><strong>${esc(email)}</strong></dd>
      <dt>Mot de passe</dt><dd><strong style="font-family:monospace;font-size:15px">${esc(password)}</strong></dd>
    </dl>
    <div class="form-actions"><button type="button" class="btn btn--ghost" data-copy>${icon('check')} Copier</button><button type="button" class="btn btn--primary" data-ok>Terminé</button></div>`);
  el.querySelector('[data-ok]').onclick = close;
  el.querySelector('[data-copy]').onclick = () =>
    navigator.clipboard?.writeText(text).then(() => toast('Identifiants copiés.'), () => toast('Copie impossible : sélectionnez le texte.', 'error'));
}

function ownerModal(owner, onSaved) {
  const o = owner || { status: 'active' };
  const val = (k) => esc(o[k] ?? '');
  const { el, close } = modal(owner ? `Modifier ${owner.firstName} ${owner.lastName}` : 'Nouveau partenaire', `
    <form id="ownerForm" novalidate>
      <div class="form-grid">
        <label class="field">Prénom <span class="req">*</span><input type="text" name="firstName" required maxlength="80" value="${val('firstName')}"></label>
        <label class="field">Nom <span class="req">*</span><input type="text" name="lastName" required maxlength="80" value="${val('lastName')}"></label>
        <label class="field full">Email (identifiant de connexion) <span class="req">*</span><input type="email" name="email" required value="${val('email')}" autocomplete="off"></label>
        <label class="field">Téléphone <span class="req">*</span><input type="tel" name="phone" required value="${val('phone')}"></label>
        <label class="field">WhatsApp<input type="tel" name="whatsapp" value="${val('whatsapp')}"></label>
        <label class="field full">Adresse<input type="text" name="address" maxlength="300" value="${val('address')}"></label>
        ${owner ? '' : passwordFields()}
        <label class="field">Statut<select name="status"><option value="active" ${o.status !== 'inactive' ? 'selected' : ''}>Actif</option><option value="inactive" ${o.status === 'inactive' ? 'selected' : ''}>Inactif</option></select></label>
      </div>
      <div class="form-actions"><button type="button" class="btn btn--ghost" data-close>Annuler</button><button type="submit" class="btn btn--primary">${icon('check')} ${owner ? 'Enregistrer' : 'Créer le compte'}</button></div>
    </form>`, { wide: true });
  el.querySelector('[data-close]').onclick = close;
  const form = el.querySelector('#ownerForm');
  if (!owner) bindPasswords(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v).trim()]));
    if (!body.firstName || !body.lastName || !body.email || !body.phone) return showError({ message: 'Prénom, nom, email et téléphone sont obligatoires.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return showError({ message: 'Adresse email invalide.' });
    if (!owner) {
      const err = passwordError(form);
      if (err) return showError({ message: err });
      body.password = form.password.value;
      body.confirmPassword = form.confirmPassword.value;
    }
    await busy(form.querySelector('[type=submit]'), async () => {
      try {
        if (owner) {
          await call(`/${owner.id}`, { method: 'PUT', body });
          close();
          toast('Partenaire modifié.');
        } else {
          await call('', { method: 'POST', body });
          close();
          toast('Partenaire créé avec succès.');
          showCredentials('Compte créé', body.email.toLowerCase(), body.password);
        }
        onSaved();
      } catch (err) {
        showError(err);
      }
    });
  });
}

function resetModal(owner) {
  const { el, close } = modal('Nouveau mot de passe', `
    <p>Pour <strong>${esc(`${owner.firstName} ${owner.lastName}`)}</strong> (${esc(owner.email)}).</p>
    <form id="resetForm" novalidate>
      <div class="form-grid">${passwordFields()}</div>
      <div class="form-actions"><button type="button" class="btn btn--ghost" data-close>Annuler</button><button type="submit" class="btn btn--primary">${icon('check')} Réinitialiser</button></div>
    </form>`);
  el.querySelector('[data-close]').onclick = close;
  const form = el.querySelector('#resetForm');
  bindPasswords(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = passwordError(form);
    if (err) return showError({ message: err });
    const password = form.password.value;
    await busy(form.querySelector('[type=submit]'), async () => {
      try {
        await call(`/${owner.id}/reset-password`, { method: 'POST', body: { password, confirmPassword: form.confirmPassword.value } });
        close();
        toast('Mot de passe réinitialisé.');
        showCredentials('Mot de passe réinitialisé', owner.email, password);
      } catch (e2) {
        showError(e2);
      }
    });
  });
}

async function ownerDetail(id, onChange) {
  const { el, close } = modal('Partenaire', loader(), { wide: true });
  try {
    const { data: o } = await call(`/${id}`);
    el.querySelector('.modal__head h2').textContent = `${o.firstName} ${o.lastName}`;
    el.querySelector('.modal__body').innerHTML = `
      <div style="margin-bottom:14px">${badge(o.status)}</div>
      <dl class="kv">
        <dt>Email</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd>
        <dt>Téléphone</dt><dd>${esc(o.phone || '—')}</dd>
        <dt>WhatsApp</dt><dd>${esc(o.whatsapp || '—')}</dd>
        <dt>Adresse</dt><dd>${esc(o.address || '—')}</dd>
        <dt>Dernière connexion</dt><dd>${o.lastLogin ? fmtDateTime(o.lastLogin) : 'Jamais'}</dd>
        <dt>Réservations</dt><dd>${o.stats?.reservations ?? 0} (dont ${o.stats?.pending ?? 0} en attente)</dd>
      </dl>
      <h3 style="margin:20px 0 10px">Biens (${o.properties.length})</h3>
      ${
        o.properties.length
          ? `<div class="table-wrap"><table class="table"><tbody>${o.properties
              .map(
                (p) => `<tr><td><strong>${esc(p.name)}</strong><br><small class="muted">${esc(PROPERTY_TYPES[p.propertyType] || p.propertyType)} · ${esc([p.city, p.wilaya].filter(Boolean).join(', '))}</small></td><td>${badge(p.status)}</td>
              <td><a class="btn btn--ghost btn--sm" href="#/properties/${encodeURIComponent(p.id)}">${icon('eye', 14)} Ouvrir</a></td></tr>`
              )
              .join('')}</tbody></table></div>`
          : '<p class="muted">Aucun bien pour ce partenaire.</p>'
      }
      <div class="form-actions"><a class="btn btn--primary" href="#/properties/new">${icon('plus')} Ajouter un bien</a></div>`;
    el.querySelectorAll('.modal__body a[href^="#/"]').forEach((a) => a.addEventListener('click', close));
  } catch (err) {
    el.querySelector('.modal__body').innerHTML = `<p class="muted">${esc(err.message)}</p>`;
    onChange?.();
  }
}
