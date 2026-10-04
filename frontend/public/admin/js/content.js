(function (global) {
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderStaysTable() {
    const list = ATStore.getStays();
    if (!list.length) return `<div class="empty">Aucun hébergement.</div>`;
    const rows = list
      .map(
        (s) => `<tr>
        <td>
          ${s.image ? `<img class="thumb" src="${escapeHtml(ATStore.src(s.image))}" alt="" />` : ''}
          <strong>${escapeHtml(s.name)}</strong><br><small>${escapeHtml(s.type)} · ${escapeHtml(s.placeId)}</small>
        </td>
        <td>${Number(s.price || 0).toLocaleString('fr-FR')} DA</td>
        <td>${s.active === false ? '<span class="badge badge--cancelled">Inactif</span>' : '<span class="badge badge--confirmed">Actif</span>'}</td>
        <td><button type="button" class="btn btn--sm btn--ghost" data-stay-edit="${escapeHtml(s.id)}">Modifier</button></td>
      </tr>`
      )
      .join('');
    return `<table>
      <thead><tr><th>Hébergement</th><th>Prix</th><th>État</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function openStayForm(stay, openDrawer, toast) {
    if (!stay) return;
    openDrawer(`
      <h3>Modifier hébergement</h3>
      <form id="stayForm" class="form-grid">
        <div class="field full">
          <label>Nom</label>
          <input name="name" value="${escapeHtml(stay.name)}" required />
        </div>
        <div class="field">
          <label>Prix (DA)</label>
          <input name="price" type="number" min="0" value="${Number(stay.price || 0)}" />
        </div>
        <div class="field">
          <label>Actif</label>
          <select name="active">
            <option value="true" ${stay.active !== false ? 'selected' : ''}>Oui</option>
            <option value="false" ${stay.active === false ? 'selected' : ''}>Non</option>
          </select>
        </div>
        <div class="field full">
          <label>Image</label>
          ${ATImageInsert.markup({
            id: 'stayImg',
            name: 'image',
            label: 'Insérer une image',
            value: stay.image || '',
          })}
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea name="description">${escapeHtml(stay.description || '')}</textarea>
        </div>
        <div class="form-actions full">
          <button type="submit" class="btn btn--primary" style="width:auto">Enregistrer</button>
        </div>
      </form>
    `);

    const img = ATImageInsert.bind('stayImg', toast);
    if (stay.image) img.setValue(stay.image);

    document.getElementById('stayForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      ATStore.upsertStay({
        ...stay,
        name: String(fd.get('name') || '').trim(),
        price: Number(fd.get('price') || 0),
        active: fd.get('active') === 'true',
        image: img.getValue(),
        description: String(fd.get('description') || '').trim(),
      });
      toast('Hébergement enregistré');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
  }

  function fillSettingsForm() {
    const s = ATStore.getSettings();
    const form = document.getElementById('settingsForm');
    if (!form) return;
    if (form.whatsapp) form.whatsapp.value = s.whatsapp || '';
    if (form.phone) form.phone.value = s.phone || '';
    if (form.email) form.email.value = s.email || '';
    if (form.siteName) form.siteName.value = s.siteName || '';
  }

  function bindSettings(toast) {
    const form = document.getElementById('settingsForm');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    form.onsubmit = (e) => {
      e.preventDefault();
      ATStore.saveSettings({
        whatsapp: form.whatsapp.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        siteName: form.siteName ? form.siteName.value.trim() : 'Algeria Travel',
      });
      toast('Réglages enregistrés');
    };
  }

  global.ATContentUI = {
    renderStaysTable,
    openStayForm,
    fillSettingsForm,
    bindSettings,
  };
})(window);
