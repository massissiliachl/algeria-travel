/**
 * Propriétaires (comptes de l’espace partenaire) via /api/admin/owners.
 * Les biens, chambres, tarifs et disponibilités se gèrent dans ../partenariat/ en mode admin.
 */
(function (global) {
  const esc = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const PARTNER_ADMIN = '../partenariat/index.html?admin=1';
  const STATUS = { active: ['badge--confirmed', 'Actif'], inactive: ['badge--cancelled', 'Inactif'] };
  const PROPERTY_STATUS = { active: ['badge--confirmed', 'Actif'], inactive: ['badge--cancelled', 'Inactif'], pending: ['badge--new', 'En attente'] };
  const TYPES = { HOTEL: 'Hôtel', APARTMENT: 'Appartement', VILLA: 'Villa', GUESTHOUSE: "Maison d'hôtes", RESIDENCE: 'Résidence', OTHER: 'Autre' };

  const state = { q: '', status: '', sort: 'created', order: 'desc', page: 1, owners: [], pagination: null, loading: false, error: '' };
  let ui = { toast: () => {}, openDrawer: () => {} };
  let searchTimer;

  const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
  const fmtDateTime = (v) => (v ? new Date(v).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Jamais');
  const closeDrawer = () => document.getElementById('drawerClose')?.click();

  async function call(path, { method = 'GET', body } = {}) {
    const res = await global.AT_API.request('/admin/owners' + path, { method, body, admin: true });
    if (res.status === 401) throw new Error('Clé admin refusée : reconnectez-vous.');
    if (!res.ok || res.data?.success === false) throw new Error(res.data?.message || 'Action impossible, réessayez.');
    return res.data;
  }

  function badge(map, status) {
    const [cls, label] = map[status] || ['badge--contacted', status || '—'];
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  }

  // ─── Liste ───────────────────────────────────────────────────────────────

  function render() {
    const el = document.getElementById('ownersTable');
    if (!el) return;
    if (!global.AT_API.adminKey()) {
      el.innerHTML = '<div class="empty">Connectez-vous avec la clé admin du backend pour gérer les propriétaires.</div>';
      return;
    }
    const tabs = [['', 'Tous'], ['active', 'Actifs'], ['inactive', 'Inactifs']]
      .map(([k, l]) => `<button type="button" class="btn btn--sm ${state.status === k ? 'btn--gold' : 'btn--ghost'}" data-owners-filter="${k}">${l}</button>`)
      .join('');
    const toolbar = `
      <div class="owners-toolbar">
        <input type="search" class="owners-search" id="ownersSearch" placeholder="Rechercher un nom, un email ou un téléphone…" value="${esc(state.q)}" aria-label="Rechercher" />
        ${tabs}
        <select id="ownersSort" aria-label="Trier">
          ${[['created', 'Plus récents'], ['name', 'Nom'], ['properties', 'Nombre de biens'], ['login', 'Dernière connexion']]
            .map(([k, l]) => `<option value="${k}" ${state.sort === k ? 'selected' : ''}>${l}</option>`)
            .join('')}
        </select>
      </div>`;

    let body;
    if (state.error) body = `<div class="empty">${esc(state.error)} <button type="button" class="btn btn--sm btn--ghost" data-owners-reload>Réessayer</button></div>`;
    else if (state.loading && !state.owners.length) body = '<div class="empty">Chargement… (le serveur peut mettre jusqu’à 1 min à se réveiller)</div>';
    else if (!state.owners.length) body = `<div class="empty">${state.q || state.status ? 'Aucun propriétaire ne correspond à ces critères.' : 'Aucun propriétaire pour le moment. Cliquez sur « + Ajouter un propriétaire ».'}</div>`;
    else {
      const rows = state.owners
        .map(
          (o) => `<tr class="${o.status === 'inactive' ? 'is-muted' : ''}">
          <td><strong>${esc(`${o.firstName} ${o.lastName}`)}</strong><br><small>Connexion : ${esc(fmtDateTime(o.lastLogin))}</small></td>
          <td><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></td>
          <td>${esc(o.phone || '—')}</td>
          <td>${o.propertyCount || 0}</td>
          <td>${badge(STATUS, o.status)}</td>
          <td>${esc(fmtDate(o.createdAt))}</td>
          <td class="actions">
            <button type="button" class="btn btn--sm btn--ghost" data-owner-view="${o.id}">Voir</button>
            <button type="button" class="btn btn--sm btn--ghost" data-owner-edit="${o.id}">Modifier</button>
            <button type="button" class="btn btn--sm ${o.status === 'active' ? 'btn--ghost' : 'btn--gold'}" data-owner-status="${o.id}" data-next="${o.status === 'active' ? 'inactive' : 'active'}">${o.status === 'active' ? 'Désactiver' : 'Activer'}</button>
            <button type="button" class="btn btn--sm btn--ghost" data-owner-reset="${o.id}">Mot de passe</button>
            <button type="button" class="btn btn--sm btn--danger" data-owner-del="${o.id}">Supprimer</button>
          </td>
        </tr>`
        )
        .join('');
      const p = state.pagination;
      const pages = p ? Math.max(1, Math.ceil(p.total / p.limit)) : 1;
      const pager =
        pages > 1
          ? `<div class="owners-pager"><button type="button" class="btn btn--sm btn--ghost" data-owners-page="${p.page - 1}" ${p.page <= 1 ? 'disabled' : ''}>← Précédent</button>
             <span>Page ${p.page} / ${pages} · ${p.total} propriétaire(s)</span>
             <button type="button" class="btn btn--sm btn--ghost" data-owners-page="${p.page + 1}" ${p.page >= pages ? 'disabled' : ''}>Suivant →</button></div>`
          : `<div class="owners-pager"><span>${p?.total ?? state.owners.length} propriétaire(s)</span></div>`;
      body = `<table><thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Nb biens</th><th>Statut</th><th>Créé le</th><th></th></tr></thead><tbody>${rows}</tbody></table>${pager}`;
    }

    const focused = document.activeElement?.id === 'ownersSearch';
    el.innerHTML = toolbar + body;
    if (focused) {
      const input = document.getElementById('ownersSearch');
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  async function load(toast, openDrawer) {
    if (toast) ui = { toast, openDrawer };
    if (!global.AT_API.adminKey()) return render();
    state.loading = true;
    state.error = '';
    render();
    try {
      const params = new URLSearchParams({ page: state.page, limit: 20, sort: state.sort, order: state.sort === 'name' ? 'asc' : 'desc' });
      if (state.q) params.set('q', state.q);
      if (state.status) params.set('status', state.status);
      const res = await call(`?${params}`);
      state.owners = res.data || [];
      state.pagination = res.pagination;
    } catch (err) {
      state.error = err.message;
    }
    state.loading = false;
    render();
  }

  // ─── Fiche ───────────────────────────────────────────────────────────────

  async function openView(id) {
    ui.openDrawer('<h2>Propriétaire</h2><div class="empty">Chargement…</div>');
    try {
      const { data: o } = await call(`/${id}`);
      const props = o.properties.length
        ? `<table><thead><tr><th>Bien</th><th>Statut</th><th></th></tr></thead><tbody>${o.properties
            .map(
              (p) => `<tr><td><strong>${esc(p.name)}</strong><br><small>${esc(TYPES[p.propertyType] || p.propertyType)} · ${esc([p.city, p.wilaya].filter(Boolean).join(', '))}</small></td>
              <td>${badge(PROPERTY_STATUS, p.status)}</td>
              <td><a class="btn btn--sm btn--ghost" href="${PARTNER_ADMIN}#/properties/${encodeURIComponent(p.id)}">Gérer</a></td></tr>`
            )
            .join('')}</tbody></table>`
        : '<div class="empty">Aucun bien pour ce propriétaire.</div>';
      ui.openDrawer(`
        <h2>${esc(`${o.firstName} ${o.lastName}`)}</h2>
        <p>${badge(STATUS, o.status)}</p>
        <dl class="owner-kv">
          <dt>Email</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd>
          <dt>Téléphone</dt><dd>${esc(o.phone || '—')}</dd>
          <dt>WhatsApp</dt><dd>${esc(o.whatsapp || '—')}</dd>
          <dt>Adresse</dt><dd>${esc(o.address || '—')}</dd>
          <dt>Dernière connexion</dt><dd>${esc(fmtDateTime(o.lastLogin))}</dd>
          <dt>Créé le</dt><dd>${esc(fmtDate(o.createdAt))}</dd>
          <dt>Réservations</dt><dd>${o.stats?.reservations ?? 0} (dont ${o.stats?.pending ?? 0} en attente)</dd>
        </dl>
        <h3 class="owner-subtitle">Biens (${o.properties.length})</h3>
        <div class="table-wrap">${props}</div>
        <div class="form-actions">
          <a class="btn btn--gold" href="${PARTNER_ADMIN}#/properties/new">+ Ajouter un bien</a>
          <button type="button" class="btn btn--ghost" data-owner-edit="${o.id}">Modifier</button>
          <button type="button" class="btn btn--ghost" data-owner-reset="${o.id}">Réinitialiser le mot de passe</button>
        </div>`);
    } catch (err) {
      ui.openDrawer(`<h2>Propriétaire</h2><div class="empty">${esc(err.message)}</div>`);
    }
  }

  // ─── Formulaires ─────────────────────────────────────────────────────────

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = new Uint32Array(12);
    global.crypto.getRandomValues(bytes);
    let out = Array.from(bytes, (b) => chars[b % chars.length]).join('');
    if (!/\d/.test(out)) out = out.slice(0, -1) + '7';
    if (!/[a-z]/i.test(out)) out = 'a' + out.slice(1);
    return out;
  }

  const passwordFields = (required) => `
    <div class="field"><label>Mot de passe ${required ? '*' : ''}</label><input type="text" name="password" ${required ? 'required' : ''} minlength="8" autocomplete="new-password" spellcheck="false" /></div>
    <div class="field"><label>Confirmation ${required ? '*' : ''}</label><input type="text" name="confirmPassword" ${required ? 'required' : ''} autocomplete="new-password" spellcheck="false" /></div>
    <div class="field full"><span class="field-hint">8 caractères minimum, avec au moins une lettre et un chiffre. <button type="button" class="btn btn--sm btn--ghost" data-gen-password>Générer</button></span></div>`;

  function bindPasswordGenerator(form) {
    form.querySelector('[data-gen-password]')?.addEventListener('click', () => {
      const pwd = generatePassword();
      form.password.value = pwd;
      form.confirmPassword.value = pwd;
    });
  }

  function checkPasswords(form) {
    const pwd = form.password.value;
    if (pwd.length < 8 || !/[a-z]/i.test(pwd) || !/\d/.test(pwd)) return 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.';
    if (pwd !== form.confirmPassword.value) return 'Les mots de passe ne correspondent pas.';
    return '';
  }

  function showFormError(form, message) {
    const el = form.querySelector('.owner-form-error');
    el.textContent = message;
    el.hidden = !message;
    if (message) el.scrollIntoView({ block: 'nearest' });
  }

  async function openForm(id) {
    let o = null;
    if (id) {
      try {
        o = (await call(`/${id}`)).data;
      } catch (err) {
        return ui.toast(err.message);
      }
    }
    const val = (k) => esc(o?.[k] ?? '');
    ui.openDrawer(`
      <h2>${o ? 'Modifier le propriétaire' : 'Ajouter un propriétaire'}</h2>
      <form id="ownerForm" class="form-grid" novalidate>
        <p class="owner-form-error full" hidden></p>
        <div class="field"><label>Prénom *</label><input name="firstName" required maxlength="80" value="${val('firstName')}" /></div>
        <div class="field"><label>Nom *</label><input name="lastName" required maxlength="80" value="${val('lastName')}" /></div>
        <div class="field full"><label>Email *</label><input name="email" type="email" required value="${val('email')}" autocomplete="off" /></div>
        <div class="field"><label>Téléphone *</label><input name="phone" type="tel" required value="${val('phone')}" /></div>
        <div class="field"><label>WhatsApp</label><input name="whatsapp" type="tel" value="${val('whatsapp')}" /></div>
        <div class="field full"><label>Adresse</label><input name="address" maxlength="300" value="${val('address')}" /></div>
        ${o ? '' : passwordFields(true)}
        <div class="field"><label>Statut</label><select name="status">
          <option value="active" ${o?.status !== 'inactive' ? 'selected' : ''}>Actif</option>
          <option value="inactive" ${o?.status === 'inactive' ? 'selected' : ''}>Inactif</option>
        </select></div>
        <div class="form-actions full"><button type="submit" class="btn btn--primary" style="width:auto">${o ? 'Enregistrer' : 'Créer le propriétaire'}</button></div>
      </form>`);
    const form = document.getElementById('ownerForm');
    bindPasswordGenerator(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      for (const k of Object.keys(f)) f[k] = String(f[k]).trim();
      if (!f.firstName || !f.lastName || !f.email || !f.phone) return showFormError(form, 'Prénom, nom, email et téléphone sont obligatoires.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return showFormError(form, 'Adresse email invalide.');
      if (!o) {
        const pwdError = checkPasswords(form);
        if (pwdError) return showFormError(form, pwdError);
        f.password = form.password.value;
        f.confirmPassword = form.confirmPassword.value;
      }
      showFormError(form, '');
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      try {
        if (o) await call(`/${o.id}`, { method: 'PUT', body: f });
        else await call('', { method: 'POST', body: f });
        closeDrawer();
        ui.toast(o ? 'Propriétaire modifié.' : 'Propriétaire créé avec succès.');
        load();
      } catch (err) {
        showFormError(form, err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  function openReset(id) {
    const o = state.owners.find((x) => x.id === id);
    ui.openDrawer(`
      <h2>Réinitialiser le mot de passe</h2>
      <p>${o ? `Nouveau mot de passe pour <strong>${esc(`${o.firstName} ${o.lastName}`)}</strong> (${esc(o.email)}).` : ''} Communiquez-le au propriétaire par un canal sûr ; il pourra le changer depuis son profil.</p>
      <form id="resetForm" class="form-grid" novalidate>
        <p class="owner-form-error full" hidden></p>
        ${passwordFields(true)}
        <div class="form-actions full"><button type="submit" class="btn btn--primary" style="width:auto">Réinitialiser</button></div>
      </form>`);
    const form = document.getElementById('resetForm');
    bindPasswordGenerator(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwdError = checkPasswords(form);
      if (pwdError) return showFormError(form, pwdError);
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      try {
        await call(`/${id}/reset-password`, { method: 'POST', body: { password: form.password.value, confirmPassword: form.confirmPassword.value } });
        closeDrawer();
        ui.toast('Mot de passe réinitialisé.');
      } catch (err) {
        showFormError(form, err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function setStatus(id, status) {
    const o = state.owners.find((x) => x.id === id);
    if (status === 'inactive' && !confirm(`Désactiver « ${o ? `${o.firstName} ${o.lastName}` : ''} » ?\nIl ne pourra plus se connecter et ses biens seront masqués du site.`)) return;
    try {
      await call(`/${id}/status`, { method: 'PATCH', body: { status } });
      ui.toast(status === 'active' ? 'Propriétaire activé.' : 'Propriétaire désactivé.');
      load();
    } catch (err) {
      ui.toast(err.message);
    }
  }

  async function remove(id) {
    const o = state.owners.find((x) => x.id === id);
    if (!confirm(`Supprimer « ${o ? `${o.firstName} ${o.lastName}` : ''} » ?\nSon compte est fermé et ses biens sont retirés du site. L’historique des réservations est conservé.`)) return;
    try {
      await call(`/${id}`, { method: 'DELETE' });
      ui.toast('Propriétaire supprimé.');
      load();
    } catch (err) {
      ui.toast(err.message);
    }
  }

  function bind(toast, openDrawer) {
    ui = { toast, openDrawer };
    document.getElementById('ownerAddBtn')?.addEventListener('click', () => openForm(null));
    document.body.addEventListener('input', (e) => {
      if (e.target.id !== 'ownersSearch') return;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.q = e.target.value.trim();
        state.page = 1;
        load();
      }, 350);
    });
    document.body.addEventListener('change', (e) => {
      if (e.target.id !== 'ownersSort') return;
      state.sort = e.target.value;
      state.page = 1;
      load();
    });
    document.body.addEventListener('click', (e) => {
      const t = e.target.closest('[data-owners-filter],[data-owners-page],[data-owners-reload],[data-owner-view],[data-owner-edit],[data-owner-status],[data-owner-reset],[data-owner-del]');
      if (!t) return;
      const d = t.dataset;
      if (d.ownersFilter !== undefined) {
        state.status = d.ownersFilter;
        state.page = 1;
        load();
      } else if (d.ownersPage) {
        state.page = Number(d.ownersPage);
        load();
      } else if (d.ownersReload !== undefined) load();
      else if (d.ownerView) openView(d.ownerView);
      else if (d.ownerEdit) openForm(d.ownerEdit);
      else if (d.ownerStatus) setStatus(d.ownerStatus, d.next);
      else if (d.ownerReset) openReset(d.ownerReset);
      else if (d.ownerDel) remove(d.ownerDel);
    });
  }

  global.ATOwnersUI = { load, bind, PARTNER_ADMIN };
})(window);
