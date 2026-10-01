(function (global) {
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Clients ── */
  function renderClients() {
    const list = ATStore.getClients();
    if (!list.length) {
      return `<div class="empty">Aucun client. Ils apparaissent après une réservation, ou ajoutez-en manuellement.</div>`;
    }
    const rows = list
      .map(
        (c) => `<tr>
        <td><strong>${esc(c.name || '—')}</strong></td>
        <td>${esc(c.email || '—')}<br><small>${esc(c.phone || '')}</small></td>
        <td>${esc(c.lastDestination || '—')}</td>
        <td>${c.bookingsCount || 0}</td>
        <td class="actions">
          <button type="button" class="btn btn--sm btn--ghost" data-client-edit="${esc(c.id)}">Fiche</button>
        </td>
      </tr>`
      )
      .join('');
    return `<table>
      <thead><tr><th>Client</th><th>Contact</th><th>Dernière dest.</th><th>Résa</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function openClientForm(client, openDrawer, toast) {
    const c = client || { id: '', name: '', email: '', phone: '', notes: '', lastDestination: '' };
    openDrawer(`
      <h3>${client ? 'Fiche client' : 'Nouveau client'}</h3>
      <form id="clientForm" class="form-grid">
        <div class="field"><label>Nom</label><input name="name" value="${esc(c.name)}" required /></div>
        <div class="field"><label>Email</label><input name="email" type="email" value="${esc(c.email)}" /></div>
        <div class="field"><label>Téléphone</label><input name="phone" value="${esc(c.phone)}" /></div>
        <div class="field"><label>Dernière destination</label><input name="lastDestination" value="${esc(c.lastDestination)}" /></div>
        <div class="field full"><label>Notes</label><textarea name="notes">${esc(c.notes)}</textarea></div>
        <div class="form-actions full">
          <button type="submit" class="btn btn--primary" style="width:auto">Enregistrer</button>
          ${client ? `<button type="button" class="btn btn--danger" id="clientDel">Supprimer</button>` : ''}
        </div>
      </form>
    `);
    document.getElementById('clientForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      ATStore.upsertClient({
        id: c.id || undefined,
        name: String(fd.get('name') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        lastDestination: String(fd.get('lastDestination') || '').trim(),
        notes: String(fd.get('notes') || '').trim(),
        bookingsCount: c.bookingsCount || 0,
      });
      toast('Client enregistré');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
    const del = document.getElementById('clientDel');
    if (del) {
      del.onclick = () => {
        if (!confirm('Supprimer ce client ?')) return;
        ATStore.deleteClient(c.id);
        toast('Client supprimé');
        document.dispatchEvent(new CustomEvent('at:refresh'));
        document.getElementById('drawer').classList.remove('is-open');
      };
    }
  }

  /* ── Médias / images ── */
  function renderMedia() {
    const list = ATStore.getMedia();
    if (!list.length) return `<div class="empty">Aucune image.</div>`;
    return `<div class="media-grid">${list
      .map(
        (m) => `<article class="media-card" data-media-id="${esc(m.id)}">
        <div class="media-card__preview" style="background-image:url('${esc(m.url)}')"></div>
        <div class="media-card__body">
          <strong>${esc(m.name)}</strong>
          <small>${esc(m.category || 'général')}</small>
          <code class="media-card__url">${esc(m.url).slice(0, 48)}${m.url && m.url.length > 48 ? '…' : ''}</code>
          <div class="actions">
            <button type="button" class="btn btn--sm btn--ghost" data-media-copy="${esc(m.url)}">Copier URL</button>
            <button type="button" class="btn btn--sm btn--danger" data-media-del="${esc(m.id)}">Suppr.</button>
          </div>
        </div>
      </article>`
      )
      .join('')}</div>`;
  }

  function openMediaForm(openDrawer, toast) {
    openDrawer(`
      <h3>Insérer une image</h3>
      <form id="mediaForm" class="form-grid">
        <div class="field full"><label>Nom *</label><input name="name" required placeholder="Ex. Photo Taghit" /></div>
        <div class="field"><label>Catégorie</label>
          <select name="category">
            <option value="destination">Destination</option>
            <option value="home">Accueil</option>
            <option value="stay">Hébergement</option>
            <option value="activity">Activité</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div class="field full">
          <label>Image *</label>
          ${ATImageInsert.markup({ id: 'mediaImg', name: 'image', label: 'Insérer une image', required: true })}
        </div>
        <div class="form-actions full">
          <button type="submit" class="btn btn--primary" style="width:auto">Enregistrer l’image</button>
        </div>
      </form>
    `);

    const img = ATImageInsert.bind('mediaImg', toast);
    const form = document.getElementById('mediaForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const url = img.getValue();
      if (!url) {
        toast('Insérez une image (fichier ou URL)');
        return;
      }
      ATStore.addMedia({
        name: String(fd.get('name') || '').trim(),
        category: String(fd.get('category') || 'other'),
        url,
      });
      toast('Image enregistrée');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
  }

  /* ── Pages / textes site ── */
  function fillPagesForm() {
    const p = ATStore.getPages();
    const form = document.getElementById('pagesForm');
    if (!form) return;
    Object.keys(p).forEach((key) => {
      if (form[key]) form[key].value = p[key] ?? '';
    });
  }

  function bindPages(toast) {
    const form = document.getElementById('pagesForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const pages = {};
      fd.forEach((v, k) => {
        pages[k] = String(v).trim();
      });
      ATStore.savePages({ ...ATStore.getPages(), ...pages });
      toast('Textes du site enregistrés');
    };
  }

  /* ── Tours ── */
  function renderTours() {
    const list = ATStore.getTours();
    if (!list.length) return `<div class="empty">Aucun circuit.</div>`;
    const rows = list
      .map(
        (t) => `<tr>
        <td><strong>${esc(t.name)}</strong><br><small>${esc(t.destination)}</small></td>
        <td>${Number(t.price || 0).toLocaleString('fr-FR')} DA</td>
        <td>${t.active === false ? '<span class="badge badge--cancelled">Inactif</span>' : '<span class="badge badge--confirmed">Actif</span>'}</td>
        <td><button type="button" class="btn btn--sm btn--ghost" data-tour-edit="${esc(t.id)}">Modifier</button></td>
      </tr>`
      )
      .join('');
    return `<table><thead><tr><th>Circuit</th><th>Prix</th><th>État</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function openTourForm(tour, openDrawer, toast) {
    const t = tour || { id: '', name: '', destination: '', price: 0, description: '', image: '', active: true };
    const isNew = !tour;
    openDrawer(`
      <h3>${isNew ? 'Nouveau circuit' : 'Modifier circuit'}</h3>
      <form id="tourForm" class="form-grid">
        <div class="field"><label>ID</label><input name="id" value="${esc(t.id)}" ${isNew ? 'required' : 'readonly'} /></div>
        <div class="field"><label>Nom</label><input name="name" value="${esc(t.name)}" required /></div>
        <div class="field"><label>Destination</label><input name="destination" value="${esc(t.destination)}" /></div>
        <div class="field"><label>Prix DA</label><input name="price" type="number" value="${Number(t.price || 0)}" /></div>
        <div class="field full"><label>Image</label>
          ${ATImageInsert.markup({ id: 'tourImg', name: 'image', label: 'Insérer une image', value: t.image || '' })}
        </div>
        <div class="field full"><label>Description</label><textarea name="description">${esc(t.description)}</textarea></div>
        <div class="field"><label>Actif</label>
          <select name="active"><option value="true" ${t.active !== false ? 'selected' : ''}>Oui</option>
          <option value="false" ${t.active === false ? 'selected' : ''}>Non</option></select>
        </div>
        <div class="form-actions full">
          <button type="submit" class="btn btn--primary" style="width:auto">Enregistrer</button>
          ${!isNew ? '<button type="button" class="btn btn--danger" id="tourDel">Supprimer</button>' : ''}
        </div>
      </form>
    `);
    const tourImg = ATImageInsert.bind('tourImg', toast);
    if (t.image) tourImg.setValue(t.image);
    document.getElementById('tourForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      ATStore.upsertTour({
        id: String(fd.get('id') || '').trim(),
        name: String(fd.get('name') || '').trim(),
        destination: String(fd.get('destination') || '').trim(),
        price: Number(fd.get('price') || 0),
        image: tourImg.getValue(),
        description: String(fd.get('description') || '').trim(),
        active: fd.get('active') === 'true',
      });
      toast('Circuit enregistré');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
    const del = document.getElementById('tourDel');
    if (del) {
      del.onclick = () => {
        if (!confirm('Supprimer ?')) return;
        ATStore.deleteTour(t.id);
        toast('Circuit supprimé');
        document.dispatchEvent(new CustomEvent('at:refresh'));
        document.getElementById('drawer').classList.remove('is-open');
      };
    }
  }

  /* ── Activités ── */
  function renderActivities() {
    const list = ATStore.getActivities();
    if (!list.length) return `<div class="empty">Aucune activité.</div>`;
    const rows = list
      .map(
        (a) => `<tr>
        <td><strong>${esc(a.name)}</strong></td>
        <td>${Number(a.price || 0).toLocaleString('fr-FR')} DA</td>
        <td>${a.active === false ? '<span class="badge badge--cancelled">Inactif</span>' : '<span class="badge badge--confirmed">Actif</span>'}</td>
        <td><button type="button" class="btn btn--sm btn--ghost" data-act-edit="${esc(a.id)}">Modifier</button></td>
      </tr>`
      )
      .join('');
    return `<table><thead><tr><th>Activité</th><th>Prix</th><th>État</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function openActivityForm(act, openDrawer, toast) {
    const a = act || { id: '', name: '', price: 0, description: '', image: '', active: true };
    const isNew = !act;
    openDrawer(`
      <h3>${isNew ? 'Nouvelle activité' : 'Modifier activité'}</h3>
      <form id="actForm" class="form-grid">
        <div class="field"><label>ID</label><input name="id" value="${esc(a.id)}" ${isNew ? 'required' : 'readonly'} /></div>
        <div class="field"><label>Nom</label><input name="name" value="${esc(a.name)}" required /></div>
        <div class="field"><label>Prix DA</label><input name="price" type="number" value="${Number(a.price || 0)}" /></div>
        <div class="field full"><label>Image</label>
          ${ATImageInsert.markup({ id: 'actImg', name: 'image', label: 'Insérer une image', value: a.image || '' })}
        </div>
        <div class="field full"><label>Description</label><textarea name="description">${esc(a.description)}</textarea></div>
        <div class="field"><label>Actif</label>
          <select name="active"><option value="true" ${a.active !== false ? 'selected' : ''}>Oui</option>
          <option value="false" ${a.active === false ? 'selected' : ''}>Non</option></select>
        </div>
        <div class="form-actions full">
          <button type="submit" class="btn btn--primary" style="width:auto">Enregistrer</button>
          ${!isNew ? '<button type="button" class="btn btn--danger" id="actDel">Supprimer</button>' : ''}
        </div>
      </form>
    `);
    const actImg = ATImageInsert.bind('actImg', toast);
    if (a.image) actImg.setValue(a.image);
    document.getElementById('actForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      ATStore.upsertActivity({
        id: String(fd.get('id') || '').trim(),
        name: String(fd.get('name') || '').trim(),
        price: Number(fd.get('price') || 0),
        image: actImg.getValue(),
        description: String(fd.get('description') || '').trim(),
        active: fd.get('active') === 'true',
      });
      toast('Activité enregistrée');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
    const del = document.getElementById('actDel');
    if (del) {
      del.onclick = () => {
        if (!confirm('Supprimer ?')) return;
        ATStore.deleteActivity(a.id);
        toast('Activité supprimée');
        document.dispatchEvent(new CustomEvent('at:refresh'));
        document.getElementById('drawer').classList.remove('is-open');
      };
    }
  }

  global.ATManageUI = {
    renderClients,
    openClientForm,
    renderMedia,
    openMediaForm,
    fillPagesForm,
    bindPages,
    renderTours,
    openTourForm,
    renderActivities,
    openActivityForm,
  };
})(window);
