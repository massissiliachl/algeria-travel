(function (global) {
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slugify(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function renderTable() {
    const list = ATStore.getDestinations();
    if (!list.length) {
      return `<div class="empty">Aucune destination. Cliquez sur « + Ajouter ».</div>`;
    }
    const rows = list
      .map(
        (d) => `<tr>
        <td>
          ${
            d.image
              ? `<img class="thumb" src="${escapeHtml(d.image)}" alt="" onerror="this.style.display='none'" />`
              : ''
          }
          <strong>${escapeHtml(d.name)}</strong>
          <br><small>${escapeHtml(d.id)}</small>
        </td>
        <td>${escapeHtml(d.tagline || '—')}</td>
        <td>${Number(d.price || 0).toLocaleString('fr-FR')} DA</td>
        <td>${d.active === false ? '<span class="badge badge--cancelled">Archivée</span>' : '<span class="badge badge--confirmed">Active</span>'}</td>
        <td class="actions">
          <button type="button" class="btn btn--sm btn--ghost" data-dest-edit="${escapeHtml(d.id)}">Modifier</button>
        </td>
      </tr>`
      )
      .join('');
    return `<table>
      <thead><tr><th>Destination</th><th>Tagline</th><th>Prix</th><th>État</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function openForm(dest, openDrawer, toast) {
    const isNew = !dest;
    const d = dest || {
      id: '',
      name: '',
      tagline: '',
      price: 0,
      bestTime: '',
      image: '',
      gallery: [],
      description: '',
      active: true,
    };
    const gallery = Array.isArray(d.gallery) ? d.gallery : [];

    openDrawer(`
      <h3>${isNew ? 'Nouvelle destination' : 'Modifier destination'}</h3>
      <form id="destForm" class="form-grid">
        <div class="field">
          <label>Nom *</label>
          <input name="name" id="destName" value="${escapeHtml(d.name)}" required placeholder="Ex. Tipaza" />
        </div>
        <div class="field">
          <label>ID (slug)</label>
          <input name="id" id="destId" value="${escapeHtml(d.id)}" ${isNew ? 'required' : 'readonly'} placeholder="tipaza" />
        </div>
        <div class="field full">
          <label>Tagline</label>
          <input name="tagline" value="${escapeHtml(d.tagline || '')}" placeholder="Ex. Côte antique" />
        </div>
        <div class="field">
          <label>Prix dès (DA)</label>
          <input name="price" type="number" min="0" value="${Number(d.price || 0)}" />
        </div>
        <div class="field">
          <label>Meilleure période</label>
          <input name="bestTime" value="${escapeHtml(d.bestTime || '')}" placeholder="Mai – Septembre" />
        </div>
        <div class="field full">
          <label>Image principale *</label>
          ${ATImageInsert.markup({
            id: 'destImg',
            name: 'image',
            label: 'Insérer l’image principale',
            value: d.image || '',
            required: true,
          })}
        </div>
        <div class="field full">
          <label>Galerie — insérer d’autres photos</label>
          <label class="img-insert__drop img-insert__drop--sm" for="destGalleryFiles">
            <input type="file" id="destGalleryFiles" accept="image/*" multiple hidden />
            <strong>Insérer des images</strong>
            <span class="img-insert__hint">Plusieurs fichiers possibles</span>
            <span class="btn btn--sm btn--gold img-insert__btn">Choisir des fichiers</span>
          </label>
          <textarea name="galleryText" id="destGalleryText" rows="2" hidden>${escapeHtml(gallery.join('\n'))}</textarea>
          <div id="destGalleryPreview" class="gallery-preview"></div>
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea name="description" rows="4" placeholder="Présentation de la destination…">${escapeHtml(d.description || '')}</textarea>
        </div>
        <div class="field">
          <label>Active sur le site</label>
          <select name="active">
            <option value="true" ${d.active !== false ? 'selected' : ''}>Oui</option>
            <option value="false" ${d.active === false ? 'selected' : ''}>Non (archivée)</option>
          </select>
        </div>
        <div class="form-actions full">
          <button type="submit" class="btn btn--primary" style="width:auto">Enregistrer la destination</button>
          ${
            !isNew
              ? '<button type="button" class="btn btn--danger" id="destDelete">Supprimer</button>'
              : ''
          }
        </div>
      </form>
    `);

    const nameInput = document.getElementById('destName');
    const idInput = document.getElementById('destId');
    if (isNew && nameInput && idInput) {
      nameInput.addEventListener('input', () => {
        if (!idInput.dataset.manual) idInput.value = slugify(nameInput.value);
      });
      idInput.addEventListener('input', () => {
        idInput.dataset.manual = '1';
      });
    }

    const img = ATImageInsert.bind('destImg', toast);
    if (d.image) img.setValue(d.image);

    const galleryPreview = document.getElementById('destGalleryPreview');
    const galleryText = document.getElementById('destGalleryText');
    const galleryFiles = document.getElementById('destGalleryFiles');

    const renderGalleryPreview = () => {
      const urls = String(galleryText.value || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      galleryPreview.innerHTML = urls
        .map(
          (u, i) =>
            `<span class="gallery-preview__item" style="background-image:url('${escapeHtml(u)}')">
              <button type="button" class="gallery-preview__rm" data-rm="${i}" title="Retirer">×</button>
            </span>`
        )
        .join('');
    };
    renderGalleryPreview();

    galleryPreview.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-rm]');
      if (!btn) return;
      const urls = String(galleryText.value || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      urls.splice(Number(btn.dataset.rm), 1);
      galleryText.value = urls.join('\n');
      renderGalleryPreview();
    });

    galleryFiles?.addEventListener('change', async () => {
      const added = await ATImageInsert.readMany(galleryFiles.files, toast);
      const lines = String(galleryText.value || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      galleryText.value = [...lines, ...added].join('\n');
      renderGalleryPreview();
      galleryFiles.value = '';
      if (added.length) toast(`${added.length} image(s) ajoutée(s) à la galerie`);
    });

    const form = document.getElementById('destForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      let id = String(fd.get('id') || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
      if (!id) id = slugify(fd.get('name'));
      if (!id) {
        toast('Nom ou ID requis');
        return;
      }

      const image = img.getValue();
      if (!image) {
        toast('Insérez une image principale');
        return;
      }

      const galleryUrls = String(galleryText.value || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      if (isNew) {
        ATStore.addMedia({
          name: String(fd.get('name') || id),
          category: 'destination',
          url: image,
        });
      }

      ATStore.upsertDestination({
        id,
        name: String(fd.get('name') || '').trim(),
        tagline: String(fd.get('tagline') || '').trim(),
        price: Number(fd.get('price') || 0),
        bestTime: String(fd.get('bestTime') || '').trim(),
        image,
        gallery: galleryUrls,
        description: String(fd.get('description') || '').trim(),
        active: fd.get('active') === 'true',
      });
      toast(isNew ? 'Destination ajoutée' : 'Destination enregistrée');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };

    const del = document.getElementById('destDelete');
    if (del) {
      del.onclick = () => {
        if (!confirm('Supprimer cette destination ?')) return;
        ATStore.deleteDestination(d.id);
        toast('Destination supprimée');
        document.dispatchEvent(new CustomEvent('at:refresh'));
        document.getElementById('drawer').classList.remove('is-open');
      };
    }
  }

  global.ATDestinationsUI = { renderTable, openForm };
})(window);
