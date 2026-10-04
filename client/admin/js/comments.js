/**
 * Modération des commentaires des visiteurs (Supabase via /api/admin/comments).
 * Un nouveau commentaire est « en attente » : il n’apparaît sur le site qu’une fois approuvé.
 */
(function (global) {
  const esc = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const STATUS = {
    pending: ['badge--new', 'En attente'],
    approved: ['badge--confirmed', 'Visible'],
    rejected: ['badge--cancelled', 'Masqué'],
  };
  const TYPE_LABEL = { gallery: 'Galerie', place: 'Destination', tour: 'Circuit', activity: 'Activité', stay: 'Hébergement', hotel: 'Hôtel' };

  let comments = [];
  let filter = 'pending';
  let loaded = false;

  function target(c) {
    if (c.itemType === 'gallery') {
      const photo = ATStore.getGallery().find((g) => String(g.id) === String(c.itemId));
      return photo
        ? `<img class="thumb" src="${esc(ATStore.src(photo.src))}" alt="" onerror="this.style.display='none'" />`
        : `<small>Photo n°${esc(c.itemId)}</small>`;
    }
    return `<small>${esc(TYPE_LABEL[c.itemType] || c.itemType)} : ${esc(c.itemId)}</small>`;
  }

  function render() {
    const el = document.getElementById('commentsTable');
    if (!el) return;
    if (!ATStore.remote.enabled) {
      el.innerHTML = `<div class="empty">Connectez-vous avec la clé admin du backend pour modérer les commentaires.</div>`;
      return;
    }
    if (!loaded) {
      el.innerHTML = `<div class="empty">Chargement…</div>`;
      return;
    }
    const count = (s) => comments.filter((c) => c.status === s).length;
    const list = filter === 'all' ? comments : comments.filter((c) => c.status === filter);
    const tabs = [
      ['pending', `En attente (${count('pending')})`],
      ['approved', `Visibles (${count('approved')})`],
      ['rejected', `Masqués (${count('rejected')})`],
      ['all', `Tous (${comments.length})`],
    ]
      .map(
        ([key, label]) =>
          `<button type="button" class="btn btn--sm ${filter === key ? 'btn--gold' : 'btn--ghost'}" data-comments-filter="${key}">${label}</button>`
      )
      .join('');
    const toolbar = `<div class="media-toolbar">${tabs}</div>`;
    if (!list.length) return (el.innerHTML = toolbar + `<div class="empty">Aucun commentaire.</div>`);

    const rows = list
      .map((c) => {
        const [cls, label] = STATUS[c.status] || STATUS.pending;
        const approve =
          c.status !== 'approved'
            ? `<button type="button" class="btn btn--sm btn--gold" data-comment-status="approved" data-comment-id="${esc(c.id)}">Approuver</button>`
            : '';
        const reject =
          c.status !== 'rejected'
            ? `<button type="button" class="btn btn--sm btn--ghost" data-comment-status="rejected" data-comment-id="${esc(c.id)}">Masquer</button>`
            : '';
        return `<tr class="${c.status === 'rejected' ? 'is-muted' : ''}">
        <td>${target(c)}</td>
        <td><strong>${esc(c.authorName)}</strong><br><small>${esc(new Date(c.createdAt).toLocaleString('fr-FR'))}</small></td>
        <td class="comment-text">${esc(c.body)}${c.parentId ? '<br><small>(réponse)</small>' : ''}</td>
        <td><span class="badge ${cls}">${label}</span></td>
        <td class="actions">
          ${approve}${reject}
          <button type="button" class="btn btn--sm btn--danger" data-comment-del="${esc(c.id)}">Supprimer</button>
        </td>
      </tr>`;
      })
      .join('');
    el.innerHTML =
      toolbar +
      `<table><thead><tr><th>Sur</th><th>Auteur</th><th>Commentaire</th><th>État</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  async function load(toast) {
    render();
    if (!ATStore.remote.enabled) return;
    try {
      const data = await ATStore.remote.api('/admin/comments?status=all');
      comments = Array.isArray(data?.items) ? data.items : [];
      loaded = true;
    } catch (err) {
      toast(err.message === 'auth' ? 'Reconnectez-vous pour voir les commentaires' : 'Impossible de charger les commentaires');
    }
    render();
  }

  async function setStatus(id, status, toast) {
    try {
      const updated = await ATStore.remote.api(`/admin/comments/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } });
      comments = comments.map((c) => (c.id === id ? { ...c, ...updated } : c));
      toast(status === 'approved' ? 'Commentaire publié sur le site' : 'Commentaire masqué sur le site');
    } catch (err) {
      toast(err.message === 'auth' ? 'Reconnectez-vous pour modérer' : 'Action impossible, réessayez');
    }
    render();
  }

  async function remove(id, toast) {
    try {
      await ATStore.remote.api(`/admin/comments/${encodeURIComponent(id)}`, { method: 'DELETE' });
      comments = comments.filter((c) => c.id !== id && c.parentId !== id);
      toast('Commentaire supprimé');
    } catch (err) {
      toast(err.message === 'auth' ? 'Reconnectez-vous pour modérer' : 'Action impossible, réessayez');
    }
    render();
  }

  function bind(toast) {
    document.body.addEventListener('click', (e) => {
      const f = e.target.closest('[data-comments-filter]');
      if (f) {
        filter = f.dataset.commentsFilter;
        render();
        return;
      }
      const st = e.target.closest('[data-comment-status]');
      if (st) {
        setStatus(st.dataset.commentId, st.dataset.commentStatus, toast);
        return;
      }
      const del = e.target.closest('[data-comment-del]');
      if (del) {
        if (!confirm('Supprimer définitivement ce commentaire ?')) return;
        remove(del.dataset.commentDel, toast);
      }
    });
  }

  global.ATCommentsUI = { load, bind };
})(window);
