/**
 * Chat / Messages clients : conversations du chatbot du site (/api/admin/chat).
 * Liste, historique complet, demandes (réservation / rappel), statut, intervention humaine et réponse d’un conseiller.
 */
(function (global) {
  const esc = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const STATUS = {
    NEW: ['badge--new', 'Nouveau'],
    IN_PROGRESS: ['badge--contacted', 'En cours'],
    RESOLVED: ['badge--confirmed', 'Résolu'],
  };
  const REQ_STATUS = {
    pending: 'En attente',
    contacted: 'Contacté',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    closed: 'Clôturé',
  };
  const INTENT_LABEL = {
    GREETING: 'Salutation', PRICE: 'Prix', AVAILABILITY: 'Disponibilité', BOOKING: 'Réservation', DESTINATION: 'Destination',
    HOTEL: 'Hôtel', APARTMENT: 'Appartement', ACTIVITY: 'Activité', TOUR: 'Circuit', PROGRAM: 'Programme', DATE: 'Dates',
    DURATION: 'Durée', TRANSPORT: 'Transport', PAYMENT: 'Paiement', CONTACT: 'Contact', LOCATION: 'Adresse',
    CANCELLATION: 'Annulation', GENERAL_INFORMATION: 'Information', HUMAN_AGENT: 'Conseiller', THANKS: 'Remerciement',
    GOODBYE: 'Au revoir', FALLBACK: 'Non compris', ERROR: 'Erreur',
  };

  let items = [];
  let counts = {};
  let storage = 'db';
  let filter = 'all';
  let search = '';
  let loaded = false;
  let detail = null;
  let toastFn = () => {};

  const fmt = (d) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '');
  const waLink = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '').replace(/^00/, '');
    const intl = digits.startsWith('0') ? `213${digits.slice(1)}` : digits;
    return intl.length >= 9 ? `https://wa.me/${intl}` : null;
  };

  function statusBadge(status) {
    const [cls, label] = STATUS[status] || STATUS.NEW;
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function el() {
    return document.getElementById('chatPanel');
  }

  /* ── Liste ── */

  function renderList() {
    const box = el();
    if (!box) return;
    if (!ATStore.remote.enabled) {
      box.innerHTML = `<div class="empty">Connectez-vous avec la clé admin du backend pour voir les conversations du chatbot.</div>`;
      return;
    }
    if (!loaded) {
      box.innerHTML = `<div class="empty">Chargement…</div>`;
      return;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const human = items.filter((c) => c.human_requested && c.status !== 'RESOLVED').length;
    const tabs = [
      ['all', `Toutes (${total})`],
      ['NEW', `Nouvelles (${counts.NEW || 0})`],
      ['IN_PROGRESS', `En cours (${counts.IN_PROGRESS || 0})`],
      ['RESOLVED', `Résolues (${counts.RESOLVED || 0})`],
      ['human', `👤 Conseiller demandé (${human})`],
    ]
      .map(([key, label]) => `<button type="button" class="btn btn--sm ${filter === key ? 'btn--gold' : 'btn--ghost'}" data-chat-filter="${key}">${label}</button>`)
      .join('');
    const toolbar = `<div class="media-toolbar chat-toolbar">${tabs}
      <input type="search" class="chat-search" data-chat-search placeholder="Rechercher (nom, téléphone, email, message)…" value="${esc(search)}" />
    </div>${storage === 'memory' ? '<div class="chat-warning">⚠️ Tables du chatbot absentes : conversations gardées en mémoire (perdues au redémarrage). Lancez la migration <code>027_chatbot.sql</code>.</div>' : ''}`;

    const list = filter === 'human' ? items.filter((c) => c.human_requested && c.status !== 'RESOLVED') : items;
    if (!list.length) {
      box.innerHTML = `${toolbar}<div class="empty">Aucune conversation.</div>`;
      return;
    }
    const rows = list
      .map(
        (c) => `<tr class="${c.human_requested && c.status !== 'RESOLVED' ? 'chat-row--human' : ''}">
        <td><small>${esc(fmt(c.last_message_at))}</small></td>
        <td>
          <strong>${esc(c.customer_name || 'Visiteur')}</strong>
          ${c.customer_phone ? `<br><small>${esc(c.customer_phone)}</small>` : ''}
          ${c.customer_email ? `<br><small>${esc(c.customer_email)}</small>` : ''}
        </td>
        <td class="comment-text">${esc(String(c.last_message || '').slice(0, 140))}</td>
        <td><small>${esc(INTENT_LABEL[c.last_intent] || c.last_intent || '—')}</small>${c.human_requested ? '<br><span class="badge badge--new">👤 Conseiller</span>' : ''}</td>
        <td>${statusBadge(c.status)}${c.request_count ? `<br><small>${c.request_count} demande(s)</small>` : ''}</td>
        <td class="actions"><button type="button" class="btn btn--sm btn--primary" data-chat-open="${esc(c.id)}">Ouvrir</button></td>
      </tr>`
      )
      .join('');
    box.innerHTML = `${toolbar}<table><thead><tr><th>Date</th><th>Client</th><th>Dernier message</th><th>Intention</th><th>Statut</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  async function load(toast) {
    if (toast) toastFn = toast;
    if (detail) return openDetail(detail.conversation.id);
    renderList();
    if (!ATStore.remote.enabled) return;
    try {
      const status = ['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(filter) ? filter : '';
      const qs = new URLSearchParams({ limit: '100' });
      if (status) qs.set('status', status);
      if (search) qs.set('q', search);
      const data = await ATStore.remote.api(`/admin/chat/conversations?${qs}`);
      items = Array.isArray(data?.items) ? data.items : [];
      counts = data?.counts || {};
      storage = data?.storage || 'db';
      loaded = true;
    } catch (err) {
      toastFn(err.message === 'auth' ? 'Reconnectez-vous pour voir les conversations' : 'Impossible de charger les conversations');
    }
    renderList();
  }

  /* ── Détail ── */

  function messageHtml(m) {
    const who = m.sender === 'user' ? 'Client' : m.sender === 'agent' ? 'Conseiller' : 'Assistant';
    const intent = m.sender === 'user' && m.intent ? ` · ${esc(INTENT_LABEL[m.intent] || m.intent)}` : '';
    return `<div class="chat-msg chat-msg--${esc(m.sender)}">
      <div class="chat-msg__meta">${who} · ${esc(fmt(m.created_at))}${intent}</div>
      <div class="chat-msg__body" dir="auto">${esc(m.body).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
    </div>`;
  }

  function requestHtml(r) {
    const opts = Object.entries(REQ_STATUS)
      .map(([k, label]) => `<option value="${k}" ${r.status === k ? 'selected' : ''}>${label}</option>`)
      .join('');
    const dates = r.dates_label || [r.start_date, r.end_date].filter(Boolean).map((d) => String(d).slice(0, 10)).join(' → ');
    return `<div class="chat-req">
      <div class="chat-req__head">
        <strong>${r.type === 'booking' ? '📝 Demande de réservation' : '👤 Demande de rappel'}</strong>
        <code>${esc(r.reference)}</code>
        <small>${esc(fmt(r.created_at))}</small>
      </div>
      <div class="chat-req__grid">
        ${r.item_name ? `<span>Offre : <strong>${esc(r.item_name)}</strong></span>` : ''}
        ${dates ? `<span>Dates : ${esc(dates)}</span>` : ''}
        ${r.persons ? `<span>Voyageurs : ${esc(r.persons)}</span>` : ''}
        ${r.rooms ? `<span>Chambres : ${esc(r.rooms)}</span>` : ''}
        <span>Nom : ${esc(r.name || '—')}</span>
        <span>Téléphone : ${esc(r.phone || '—')}</span>
        <span>Email : ${esc(r.email || '—')}</span>
        ${r.notes ? `<span class="full">Note : ${esc(r.notes)}</span>` : ''}
      </div>
      <label class="chat-req__status">Statut
        <select data-chat-req="${esc(r.id)}" ${r.id ? '' : 'disabled'}>${opts}</select>
      </label>
    </div>`;
  }

  function renderDetail() {
    const box = el();
    if (!box || !detail) return;
    const c = detail.conversation;
    const wa = waLink(c.customer_phone);
    const contacts = [
      c.customer_phone ? `<a class="btn btn--sm btn--ghost" href="tel:${esc(c.customer_phone.replace(/\s/g, ''))}">📞 ${esc(c.customer_phone)}</a>` : '',
      wa ? `<a class="btn btn--sm btn--ghost" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : '',
      c.customer_email ? `<a class="btn btn--sm btn--ghost" href="mailto:${esc(c.customer_email)}">✉️ ${esc(c.customer_email)}</a>` : '',
    ].join('');
    const statusOpts = Object.entries(STATUS)
      .map(([k, [, label]]) => `<option value="${k}" ${c.status === k ? 'selected' : ''}>${label}</option>`)
      .join('');
    box.innerHTML = `
      <div class="chat-detail">
        <div class="chat-detail__bar">
          <button type="button" class="btn btn--sm btn--ghost" data-chat-back>← Retour à la liste</button>
          <div class="chat-detail__actions">
            <label class="chat-req__status">Statut <select data-chat-status>${statusOpts}</select></label>
            ${c.human_requested
              ? '<button type="button" class="btn btn--sm btn--ghost" data-chat-human="false">Retirer « conseiller demandé »</button>'
              : '<button type="button" class="btn btn--sm btn--gold" data-chat-human="true">👤 Demander intervention humaine</button>'}
          </div>
        </div>
        <div class="chat-detail__client">
          <div>
            <h3>${esc(c.customer_name || 'Visiteur')} ${c.human_requested ? '<span class="badge badge--new">👤 Conseiller demandé</span>' : ''}</h3>
            <small>Ouverte le ${esc(fmt(c.created_at))} · langue ${esc(String(c.language || 'fr').toUpperCase())} · ${esc(c.message_count || 0)} messages${c.page_url ? ` · page ${esc(c.page_url)}` : ''}</small>
          </div>
          <div class="chat-detail__contacts">${contacts || '<small>Aucune coordonnée laissée.</small>'}</div>
        </div>
        ${detail.requests.length ? `<div class="chat-reqs">${detail.requests.map(requestHtml).join('')}</div>` : ''}
        <div class="chat-thread" data-chat-thread>${detail.messages.map(messageHtml).join('') || '<div class="empty">Aucun message.</div>'}</div>
        <form class="chat-reply" data-chat-reply>
          <textarea name="body" rows="2" maxlength="2000" placeholder="Répondre au client (le message s’affiche dans son chat sur le site)…" required></textarea>
          <button type="submit" class="btn btn--primary">Envoyer</button>
        </form>
      </div>`;
    const thread = box.querySelector('[data-chat-thread]');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  async function openDetail(id) {
    try {
      const data = await ATStore.remote.api(`/admin/chat/conversations/${encodeURIComponent(id)}`);
      detail = { conversation: data.conversation, messages: data.messages || [], requests: data.requests || [] };
      renderDetail();
    } catch (err) {
      detail = null;
      toastFn(err.message === 'auth' ? 'Reconnectez-vous' : 'Conversation introuvable');
      renderList();
    }
  }

  async function patchConversation(body, okMsg) {
    if (!detail) return;
    try {
      const data = await ATStore.remote.api(`/admin/chat/conversations/${encodeURIComponent(detail.conversation.id)}`, { method: 'PATCH', body });
      detail.conversation = { ...detail.conversation, ...data.conversation };
      toastFn(okMsg);
      renderDetail();
    } catch (err) {
      toastFn(err.message === 'auth' ? 'Reconnectez-vous' : 'Action impossible, réessayez');
    }
  }

  async function reply(body) {
    if (!detail || !body.trim()) return;
    try {
      await ATStore.remote.api(`/admin/chat/conversations/${encodeURIComponent(detail.conversation.id)}/messages`, { method: 'POST', body: { body } });
      toastFn('Réponse envoyée au client');
      await openDetail(detail.conversation.id);
    } catch (err) {
      toastFn(err.message === 'auth' ? 'Reconnectez-vous' : 'Envoi impossible, réessayez');
    }
  }

  async function setRequestStatus(id, status) {
    try {
      await ATStore.remote.api(`/admin/chat/requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } });
      const r = detail?.requests.find((x) => String(x.id) === String(id));
      if (r) r.status = status;
      toastFn('Statut de la demande mis à jour');
    } catch (err) {
      toastFn(err.message === 'auth' ? 'Reconnectez-vous' : 'Action impossible, réessayez');
    }
  }

  let searchTimer = null;

  function bind(toast) {
    toastFn = toast;
    document.body.addEventListener('click', (e) => {
      const f = e.target.closest('[data-chat-filter]');
      if (f) {
        filter = f.dataset.chatFilter;
        loaded = false;
        load();
        return;
      }
      const open = e.target.closest('[data-chat-open]');
      if (open) {
        openDetail(open.dataset.chatOpen);
        return;
      }
      if (e.target.closest('[data-chat-back]')) {
        detail = null;
        load();
        return;
      }
      const human = e.target.closest('[data-chat-human]');
      if (human) {
        const on = human.dataset.chatHuman === 'true';
        patchConversation(
          on ? { humanRequested: true, status: detail?.conversation.status === 'RESOLVED' ? 'NEW' : undefined } : { humanRequested: false },
          on ? 'Intervention humaine demandée' : 'Signalement retiré'
        );
      }
    });
    document.body.addEventListener('change', (e) => {
      if (e.target.matches('[data-chat-status]')) {
        patchConversation({ status: e.target.value }, 'Statut mis à jour');
        return;
      }
      if (e.target.matches('[data-chat-req]')) setRequestStatus(e.target.dataset.chatReq, e.target.value);
    });
    document.body.addEventListener('input', (e) => {
      if (!e.target.matches('[data-chat-search]')) return;
      clearTimeout(searchTimer);
      const value = e.target.value;
      searchTimer = setTimeout(() => {
        search = value.trim();
        load().then(() => {
          const input = document.querySelector('[data-chat-search]');
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        });
      }, 350);
    });
    document.body.addEventListener('submit', (e) => {
      const form = e.target.closest('[data-chat-reply]');
      if (!form) return;
      e.preventDefault();
      const body = form.elements.body.value;
      form.elements.body.value = '';
      reply(body);
    });
  }

  global.ATChatUI = { load, bind };
})(window);
