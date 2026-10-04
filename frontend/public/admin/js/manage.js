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
  const MEDIA_CATEGORIES = {
    all: 'Toutes',
    home: 'Accueil',
    destination: 'Destinations',
    taghit: 'Taghit',
    stay: 'Hébergements',
    activity: 'Activités',
    other: 'Autres',
  };
  let mediaFilter = 'all';

  function renderMedia() {
    const all = ATStore.getMedia();
    const list = mediaFilter === 'all' ? all : all.filter((m) => (m.category || 'other') === mediaFilter);
    const hidden = ATStore.hiddenSiteMediaCount();
    const filters = Object.entries(MEDIA_CATEGORIES)
      .map(([key, label]) => {
        const n = key === 'all' ? all.length : all.filter((m) => (m.category || 'other') === key).length;
        return `<button type="button" class="chip ${mediaFilter === key ? 'is-active' : ''}" data-media-filter="${key}">${label} <span>${n}</span></button>`;
      })
      .join('');
    const toolbar = `<div class="media-toolbar">${filters}${
      hidden ? `<button type="button" class="btn btn--sm btn--ghost" data-media-restore>Restaurer ${hidden} photo(s) du site</button>` : ''
    }</div>`;
    if (!list.length) return toolbar + `<div class="empty">Aucune image.</div>`;
    return toolbar + `<div class="media-grid">${list
      .map(
        (m) => `<article class="media-card" data-media-id="${esc(m.id)}">
        <div class="media-card__preview"><img src="${esc(ATStore.src(m.url))}" alt="${esc(m.name)}" loading="lazy" onerror="this.style.opacity=0" /></div>
        <div class="media-card__body">
          <strong>${esc(m.name)}</strong>
          <small>${esc(MEDIA_CATEGORIES[m.category] || m.category || 'général')}${m.site ? ' · site' : ''}</small>
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
            <option value="taghit">Taghit</option>
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

  /* ── Page Galerie du site ── */
  function renderGallery() {
    const list = ATStore.getGallery();
    const head = `<p class="gallery-admin__hint">${list.length} photo(s) affichée(s) sur la page Galerie, dans cet ordre.
      <button type="button" class="btn btn--sm btn--ghost" data-gallery-reset>Remettre les photos d’origine</button></p>`;
    if (!list.length) return head + `<div class="empty">La galerie est vide. Ajoutez des photos.</div>`;
    return head + `<div class="media-grid">${list
      .map(
        (g, i) => `<article class="media-card">
        <div class="media-card__preview is-clickable" data-gallery-edit="${esc(g.id)}" title="Voir / modifier"><img src="${esc(ATStore.src(g.src))}" alt="" loading="lazy" onerror="this.style.opacity=0" /></div>
        <div class="media-card__body">
          <strong>Photo ${i + 1}</strong>
          <small>${String(g.src).startsWith('data:') ? 'Ajoutée depuis un fichier' : esc(String(g.src).split('/').pop())}</small>
          <div class="actions">
            <button type="button" class="btn btn--sm btn--ghost" data-gallery-edit="${esc(g.id)}">Modifier</button>
            <button type="button" class="btn btn--sm btn--danger" data-gallery-del="${esc(g.id)}">Supprimer</button>
          </div>
        </div>
      </article>`
      )
      .join('')}</div>`;
  }

  function openGalleryAddForm(openDrawer, toast) {
    const inGallery = new Set(ATStore.getGallery().map((g) => g.src));
    const choices = ATStore.siteImages.filter((m) => !inGallery.has(m.url));
    openDrawer(`
      <h3>Ajouter des photos à la galerie</h3>
      <div class="gallery-add">
        <h4>1. Depuis votre téléphone ou ordinateur</h4>
        <label class="img-insert__drop" for="galleryFiles">
          <input type="file" id="galleryFiles" accept="image/*" multiple hidden />
          <span class="img-insert__icon" aria-hidden="true">📷</span>
          <strong>Choisir dans la galerie / les fichiers</strong>
          <span class="img-insert__hint">Plusieurs photos possibles (JPG, PNG, WEBP). Elles sont redimensionnées automatiquement.</span>
          <span class="btn btn--sm btn--gold">Choisir des photos</span>
        </label>
        <div class="gallery-add__pending" id="galleryPending"></div>

        <h4>2. Ou parmi les photos du site</h4>
        ${
          choices.length
            ? `<div class="gallery-pick">${choices
                .map(
                  (m) => `<label class="gallery-pick__item" title="${esc(m.name)}">
                  <input type="checkbox" value="${esc(m.url)}" />
                  <img src="${esc(ATStore.src(m.url))}" alt="${esc(m.name)}" loading="lazy" />
                  <span>${esc(m.name)}</span>
                </label>`
                )
                .join('')}</div>`
            : `<p class="empty">Toutes les photos du site sont déjà dans la galerie.</p>`
        }
        <div class="form-actions">
          <button type="button" class="btn btn--primary" id="galleryAddSave" style="width:auto">Ajouter à la galerie</button>
        </div>
      </div>
    `);

    let pending = [];
    const pendingEl = document.getElementById('galleryPending');
    const paintPending = () => {
      pendingEl.innerHTML = pending
        .map((src, i) => `<span class="gallery-add__thumb" style="background-image:url('${src}')"><button type="button" data-pending-del="${i}" title="Retirer">×</button></span>`)
        .join('');
    };
    pendingEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pending-del]');
      if (!b) return;
      pending.splice(Number(b.dataset.pendingDel), 1);
      paintPending();
    });
    document.getElementById('galleryFiles').addEventListener('change', async (e) => {
      for (const file of Array.from(e.target.files || [])) {
        try {
          pending.push(await ATImageInsert.compressFile(file));
        } catch {
          toast(`« ${file.name} » n’est pas une image lisible`);
        }
      }
      e.target.value = '';
      paintPending();
    });

    document.getElementById('galleryAddSave').onclick = () => {
      const picked = Array.from(document.querySelectorAll('.gallery-pick input:checked')).map((c) => c.value);
      const srcs = [...pending, ...picked];
      if (!srcs.length) {
        toast('Choisissez au moins une photo');
        return;
      }
      const n = ATStore.addGalleryImages(srcs);
      if (n < 0) {
        toast('Stockage plein : supprimez des photos ou ajoutez-en moins à la fois');
        return;
      }
      toast(`${n} photo(s) ajoutée(s) à la galerie`);
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
  }

  function openGalleryEditForm(id, openDrawer, toast) {
    const list = ATStore.getGallery();
    const index = list.findIndex((g) => String(g.id) === String(id));
    if (index < 0) return;
    const item = list[index];
    const choices = ATStore.siteImages.filter((m) => m.url !== item.src);
    const positions = list
      .map((_, i) => `<option value="${i}" ${i === index ? 'selected' : ''}>Position ${i + 1}${i === index ? ' (actuelle)' : ''}</option>`)
      .join('');

    openDrawer(`
      <h3>Photo ${index + 1}</h3>
      <div class="gallery-edit">
        <figure class="gallery-edit__view">
          <img id="galleryEditImg" src="${esc(ATStore.src(item.src))}" alt="" />
          <figcaption id="galleryEditName">${String(item.src).startsWith('data:') ? 'Ajoutée depuis un fichier' : esc(String(item.src).split('/').pop())}</figcaption>
        </figure>

        <div class="field full">
          <label>Position dans la galerie</label>
          <select id="galleryEditPos">${positions}</select>
        </div>

        <h4>Remplacer la photo</h4>
        <label class="img-insert__drop" for="galleryEditFile">
          <input type="file" id="galleryEditFile" accept="image/*" hidden />
          <span class="img-insert__icon" aria-hidden="true">📷</span>
          <strong>Depuis la galerie / les fichiers</strong>
          <span class="btn btn--sm btn--gold">Choisir une photo</span>
        </label>

        <p class="img-insert__or">ou parmi les photos du site</p>
        <div class="gallery-pick">${choices
          .map(
            (m) => `<label class="gallery-pick__item" title="${esc(m.name)}">
            <input type="radio" name="galleryEditPick" value="${esc(m.url)}" />
            <img src="${esc(ATStore.src(m.url))}" alt="${esc(m.name)}" loading="lazy" />
            <span>${esc(m.name)}</span>
          </label>`
          )
          .join('')}</div>

        <div class="form-actions">
          <button type="button" class="btn btn--primary" id="galleryEditSave" style="width:auto">Enregistrer</button>
          <button type="button" class="btn btn--danger" id="galleryEditDel">Supprimer</button>
        </div>
      </div>
    `);

    let newSrc = '';
    const img = document.getElementById('galleryEditImg');
    const name = document.getElementById('galleryEditName');
    const preview = (src, label) => {
      newSrc = src;
      img.src = ATStore.src(src);
      name.textContent = label + ' — non enregistrée';
    };

    document.getElementById('galleryEditFile').addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        preview(await ATImageInsert.compressFile(file), file.name);
        document.querySelectorAll('[name="galleryEditPick"]').forEach((r) => (r.checked = false));
      } catch {
        toast('Ce fichier n’est pas une image lisible');
      }
      e.target.value = '';
    });

    document.querySelectorAll('[name="galleryEditPick"]').forEach((radio) => {
      radio.addEventListener('change', () => preview(radio.value, radio.value.split('/').pop()));
    });

    document.getElementById('galleryEditSave').onclick = () => {
      const position = Number(document.getElementById('galleryEditPos').value);
      if (!ATStore.updateGalleryImage(item.id, newSrc, position)) {
        toast('Stockage plein : supprimez des photos puis réessayez');
        return;
      }
      toast('Photo modifiée');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };

    document.getElementById('galleryEditDel').onclick = () => {
      if (!confirm('Supprimer cette photo de la page Galerie ?')) return;
      ATStore.deleteGalleryImage(item.id);
      toast('Photo supprimée de la galerie');
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
  const TOUR_CATEGORIES = { desert: 'Désert', nature: 'Nature', culture: 'Culture' };

  function tourPrice(t) {
    return t.priceOnRequest ? 'Sur demande' : `${Number(t.price || 0).toLocaleString('fr-FR')} DA`;
  }

  function renderTours() {
    const list = ATStore.getTours();
    const reset = `<button type="button" class="btn btn--sm btn--ghost" data-tour-reset>Remettre les circuits d’origine</button>`;
    if (!list.length) return `<div class="empty">Aucun circuit. Cliquez sur « + Ajouter ». ${reset}</div>`;
    const rows = list
      .map(
        (t) => `<tr>
        <td>${t.image ? `<img class="thumb" src="${esc(ATStore.src(t.image))}" alt="" onerror="this.style.display='none'" />` : ''}</td>
        <td><strong>${esc(t.name)}</strong><br><small>${esc(t.location || t.destination || '')}${t.duration ? ' · ' + esc(t.duration) : ''}</small></td>
        <td>${esc(TOUR_CATEGORIES[t.category] || '—')}</td>
        <td>${tourPrice(t)}</td>
        <td>${t.active === false ? '<span class="badge badge--cancelled">Masqué</span>' : '<span class="badge badge--confirmed">En ligne</span>'}</td>
        <td class="actions">
          <button type="button" class="btn btn--sm btn--ghost" data-tour-edit="${esc(t.id)}">Modifier</button>
          <button type="button" class="btn btn--sm btn--danger" data-tour-del="${esc(t.id)}">Supprimer</button>
        </td>
      </tr>`
      )
      .join('');
    return `<table><thead><tr><th></th><th>Circuit</th><th>Type</th><th>Prix</th><th>État</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      <p class="gallery-admin__hint" style="margin-top:14px">${list.length} circuit(s). ${reset}</p>`;
  }

  function openTourForm(tour, openDrawer, toast) {
    const t = tour || {
      id: '', name: '', subtitle: '', location: '', duration: '', price: 0, priceOnRequest: false,
      category: 'desert', placeSlug: '', description: '', image: '', active: true,
    };
    const isNew = !tour;
    const slugs = [...new Set(['tadrart', ...ATStore.getDestinations().map((d) => d.id)])];
    const slugOptions = [`<option value="">— Aucune —</option>`]
      .concat(slugs.map((s) => `<option value="${esc(s)}" ${t.placeSlug === s ? 'selected' : ''}>${esc(s)}</option>`))
      .join('');
    const catOptions = Object.entries(TOUR_CATEGORIES)
      .map(([k, v]) => `<option value="${k}" ${t.category === k ? 'selected' : ''}>${v}</option>`)
      .join('');
    openDrawer(`
      <h3>${isNew ? 'Nouveau circuit' : 'Modifier le circuit'}</h3>
      <form id="tourForm" class="form-grid">
        <div class="field full"><label>Nom du circuit *</label><input name="name" value="${esc(t.name)}" required placeholder="Ex. Taghit via Brezina" /></div>
        <div class="field full"><label>Sous-titre</label><input name="subtitle" value="${esc(t.subtitle || '')}" placeholder="Ex. 5 jours / 4 nuits · Van Mercedes VIP" /></div>
        <div class="field"><label>Lieu</label><input name="location" value="${esc(t.location || t.destination || '')}" placeholder="Ex. Taghit, Béchar" /></div>
        <div class="field"><label>Durée</label><input name="duration" value="${esc(t.duration || '')}" placeholder="Ex. 5 jours / 4 nuits" /></div>
        <div class="field"><label>Prix (DA / personne)</label><input name="price" type="number" min="0" value="${Number(t.price || 0)}" /></div>
        <div class="field"><label>Prix sur demande</label>
          <select name="priceOnRequest"><option value="false" ${!t.priceOnRequest ? 'selected' : ''}>Non, afficher le prix</option>
          <option value="true" ${t.priceOnRequest ? 'selected' : ''}>Oui</option></select>
        </div>
        <div class="field"><label>Type</label><select name="category">${catOptions}</select></div>
        <div class="field"><label>Fiche destination liée</label><select name="placeSlug">${slugOptions}</select></div>
        <div class="field full"><label>Image</label>
          ${ATImageInsert.markup({ id: 'tourImg', name: 'image', label: 'Insérer une image', value: t.image || '' })}
        </div>
        <div class="field full"><label>Description</label><textarea name="description" rows="4" placeholder="${isNew ? 'Programme, inclus…' : 'Laisser vide pour garder le texte actuel du site'}">${esc(t.description || '')}</textarea></div>
        <div class="field"><label>Affiché sur le site</label>
          <select name="active"><option value="true" ${t.active !== false ? 'selected' : ''}>Oui</option>
          <option value="false" ${t.active === false ? 'selected' : ''}>Non (masqué)</option></select>
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
      const image = tourImg.getValue();
      if (isNew && !image) {
        toast('Ajoutez une image pour le circuit');
        return;
      }
      ATStore.upsertTour({
        id: isNew ? ATStore.uid('tour') : t.id,
        name: String(fd.get('name') || '').trim(),
        subtitle: String(fd.get('subtitle') || '').trim(),
        location: String(fd.get('location') || '').trim(),
        duration: String(fd.get('duration') || '').trim(),
        price: Number(fd.get('price') || 0),
        priceOnRequest: fd.get('priceOnRequest') === 'true',
        category: String(fd.get('category') || 'desert'),
        placeSlug: String(fd.get('placeSlug') || ''),
        image,
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
        if (!confirm(`Supprimer le circuit « ${t.name} » ?`)) return;
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
    setMediaFilter(key) { mediaFilter = key; },
    renderGallery,
    openGalleryAddForm,
    openGalleryEditForm,
    openMediaForm,
    fillPagesForm,
    bindPages,
    renderTours,
    openTourForm,
    renderActivities,
    openActivityForm,
  };
})(window);
