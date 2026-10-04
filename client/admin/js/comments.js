/**
 * Modération des commentaires de la page Galerie (api/comments.php)
 */
(function (global) {
  const esc = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  let comments = [];
  let filter = 'all';
  let loaded = false;

  async function api(method, body) {
    const remote = ATStore.remote;
    const res = await fetch(remote.api + 'comments.php' + (method === 'GET' ? '?all=1' : ''), {
      method,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Pass': remote.pass() },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) throw new Error('auth');
    if (!res.ok) throw new Error('http');
    return res.json();
  }

  function render() {
    const el = document.getElementById('commentsTable');
    if (!el) return;
    if (!ATStore.remote.enabled) {
      el.innerHTML = `<div class="empty">Les commentaires des visiteurs sont visibles ici une fois le site en ligne (serveur PHP).</div>`;
      return;
    }
    if (!loaded) {
      el.innerHTML = `<div class="empty">Chargement…</div>`;
      return;
    }
    const hiddenCount = comments.filter((c) => c.hidden).length;
    const list =
      filter === 'visible' ? comments.filter((c) => !c.hidden) : filter === 'hidden' ? comments.filter((c) => c.hidden) : comments;
    const tabs = [
      ['all', `Tous (${comments.length})`],
      ['visible', `Visibles (${comments.length - hiddenCount})`],
      ['hidden', `Masqués (${hiddenCount})`],
    ]
      .map(
        ([key, label]) =>
          `<button type="button" class="btn btn--sm ${filter === key ? 'btn--gold' : 'btn--ghost'}" data-comments-filter="${key}">${label}</button>`
      )
      .join('');
    const toolbar = `<div class="media-toolbar">${tabs}</div>`;
    if (!list.length) return (el.innerHTML = toolbar + `<div class="empty">Aucun commentaire.</div>`);

    const rows = list
      .map(
        (c) => `<tr class="${c.hidden ? 'is-muted' : ''}">
        <td><img class="thumb" src="${esc(ATStore.src(c.src))}" alt="" onerror="this.style.display='none'" /></td>
        <td><strong>${esc(c.name)}</strong><br><small>${esc(new Date(c.createdAt).toLocaleString('fr-FR'))}</small></td>
        <td class="comment-text">${esc(c.text)}</td>
        <td>${c.hidden ? '<span class="badge badge--cancelled">Masqué</span>' : '<span class="badge badge--confirmed">Visible</span>'}</td>
        <td class="actions">
          <button type="button" class="btn btn--sm btn--ghost" data-comment-toggle="${esc(c.id)}">${c.hidden ? 'Afficher' : 'Masquer'}</button>
          <button type="button" class="btn btn--sm btn--danger" data-comment-del="${esc(c.id)}">Supprimer</button>
        </td>
      </tr>`
      )
      .join('');
    el.innerHTML =
      toolbar +
      `<table><thead><tr><th>Photo</th><th>Auteur</th><th>Commentaire</th><th>État</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  async function load(toast) {
    render();
    if (!ATStore.remote.enabled) return;
    try {
      const data = await api('GET');
      comments = Array.isArray(data.comments) ? data.comments : [];
      loaded = true;
    } catch (err) {
      toast(err.message === 'auth' ? 'Reconnectez-vous pour voir les commentaires' : 'Impossible de charger les commentaires');
    }
    render();
  }

  async function action(name, id, toast) {
    try {
      await api('POST', { action: name, id });
      if (name === 'delete') comments = comments.filter((c) => c.id !== id);
      else comments = comments.map((c) => (c.id === id ? { ...c, hidden: name === 'hide' } : c));
      toast(name === 'delete' ? 'Commentaire supprimé' : name === 'hide' ? 'Commentaire masqué sur le site' : 'Commentaire de nouveau visible');
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
      const toggle = e.target.closest('[data-comment-toggle]');
      if (toggle) {
        const c = comments.find((x) => x.id === toggle.dataset.commentToggle);
        if (c) action(c.hidden ? 'show' : 'hide', c.id, toast);
        return;
      }
      const del = e.target.closest('[data-comment-del]');
      if (del) {
        if (!confirm('Supprimer définitivement ce commentaire ?')) return;
        action('delete', del.dataset.commentDel, toast);
      }
    });
  }

  global.ATCommentsUI = { load, bind };
})(window);
