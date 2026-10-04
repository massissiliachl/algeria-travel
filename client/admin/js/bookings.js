(function (global) {
  const STATUS_LABEL = {
    new: 'Nouvelle',
    contacted: 'Contactée',
    confirmed: 'Confirmée',
    rejected: 'Refusée',
    cancelled: 'Annulée',
  };

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  function badge(status) {
    const s = status || 'new';
    return `<span class="badge badge--${s}">${STATUS_LABEL[s] || s}</span>`;
  }

  function renderRows(bookings, { compact } = {}) {
    if (!bookings.length) {
      return `<div class="empty">Aucune réservation pour le moment.</div>`;
    }
    const head = compact
      ? `<thead><tr><th>Client</th><th>Destination</th><th>Statut</th><th></th></tr></thead>`
      : `<thead><tr><th>Client</th><th>Destination</th><th>Date séjour</th><th>Voyageurs</th><th>Statut</th><th>Reçue</th><th></th></tr></thead>`;

    const body = bookings
      .map((b) => {
        if (compact) {
          return `<tr>
            <td><strong>${escapeHtml(b.name || '—')}</strong><br><small>${escapeHtml(b.email || '')}</small></td>
            <td>${escapeHtml(b.destination || '—')}</td>
            <td>${badge(b.status)}</td>
            <td><button type="button" class="btn btn--sm btn--ghost" data-booking-open="${b.id}">Voir</button></td>
          </tr>`;
        }
        return `<tr>
          <td><strong>${escapeHtml(b.name || '—')}</strong><br><small>${escapeHtml(b.email || '')}</small></td>
          <td>${escapeHtml(b.destination || '—')}</td>
          <td>${escapeHtml(b.date || '—')}</td>
          <td>${escapeHtml(String(b.travelers || '—'))}</td>
          <td>${badge(b.status)}</td>
          <td>${formatDate(b.createdAt)}</td>
          <td class="actions">
            <button type="button" class="btn btn--sm btn--ghost" data-booking-open="${b.id}">Détail</button>
          </td>
        </tr>`;
      })
      .join('');

    return `<table>${head}<tbody>${body}</tbody></table>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openDetail(id, openDrawer, toast) {
    const b = ATStore.getBookings().find((x) => x.id === id);
    if (!b) return;
    openDrawer(`
      <h3>Réservation</h3>
      <p><strong>${escapeHtml(b.name)}</strong><br>
      ${escapeHtml(b.email || '')}<br>
      ${escapeHtml(b.phone || '—')}</p>
      <p>Destination : <strong>${escapeHtml(b.destination || '—')}</strong><br>
      Date : ${escapeHtml(b.date || '—')}<br>
      Voyageurs : ${escapeHtml(String(b.travelers || '—'))}<br>
      Hébergement : ${escapeHtml(b.stay || '—')}
      ${b.price != null ? `<br>Prix estimé : ${escapeHtml(Number(b.price).toLocaleString('fr-FR'))} DA` : ''}
      ${b.ref ? `<br>Référence : <strong>${escapeHtml(b.ref)}</strong>` : ''}</p>
      <p><small>${b.remote === 'db' ? 'Enregistrée dans la base Supabase' : 'Reçue via le serveur IONOS (contact ou demande hors base)'}</small></p>
      <p>${escapeHtml(b.message || '')}</p>
      <div class="field" style="margin-top:16px">
        <label for="bkStatus">Statut</label>
        <select id="bkStatus">
          ${Object.keys(STATUS_LABEL)
            .map(
              (k) =>
                `<option value="${k}" ${b.status === k ? 'selected' : ''}>${STATUS_LABEL[k]}</option>`
            )
            .join('')}
        </select>
      </div>
      <div class="field" style="margin-top:12px">
        <label for="bkNotes">Notes admin</label>
        <textarea id="bkNotes">${escapeHtml(b.notes || '')}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--primary" style="width:auto" id="bkSave">Enregistrer</button>
        ${b.remote === 'db' ? '' : '<button type="button" class="btn btn--danger" id="bkDelete">Supprimer</button>'}
      </div>
    `);

    document.getElementById('bkSave').onclick = () => {
      ATStore.updateBooking(id, {
        status: document.getElementById('bkStatus').value,
        notes: document.getElementById('bkNotes').value,
      });
      toast('Réservation mise à jour');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
    const del = document.getElementById('bkDelete');
    if (del) del.onclick = () => {
      if (!confirm('Supprimer cette réservation ?')) return;
      ATStore.deleteBooking(id);
      toast('Réservation supprimée');
      document.dispatchEvent(new CustomEvent('at:refresh'));
      document.getElementById('drawer').classList.remove('is-open');
    };
  }

  global.ATBookingsUI = {
    renderRows,
    openDetail,
    STATUS_LABEL,
    formatDate,
  };
})(window);
