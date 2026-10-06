/**
 * Calendrier de réservation par destination (et par formule pour Taghit) — /api/admin/booking-calendar.
 *  - Dates libres : le client choisit n’importe quelle date future, sauf les périodes bloquées.
 *  - Séjours à dates fixes : le client choisit uniquement un des séjours listés (ex. 16 → 21 novembre).
 */
(function (global) {
  const esc = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  /** Formules ayant leur propre calendrier */
  const PACKAGES = {
    taghit: [
      ['hotel', 'Formule Hôtel 4★'],
      ['brezina', 'Formule Taghit via Brezina'],
    ],
  };

  const fmt = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

  async function call(path, { method = 'GET', body } = {}) {
    const res = await global.AT_API.request('/admin/booking-calendar' + path, { method, body, admin: true });
    if (res.status === 401) throw new Error('Clé admin refusée : reconnectez-vous.');
    if (!res.ok || res.data?.success === false) throw new Error(res.data?.message || 'Action impossible, réessayez.');
    return res.data.data;
  }

  const rowHtml = (p = {}) => `
    <div class="cal-row">
      <label>Du<input type="date" data-f="start" value="${esc(p.start || '')}" /></label>
      <label>Au<input type="date" data-f="end" value="${esc(p.end || '')}" /></label>
      <label class="cal-row__label">Libellé<input type="text" data-f="label" maxlength="120" value="${esc(p.label || '')}" placeholder="facultatif" /></label>
      <button type="button" class="btn btn--sm btn--ghost cal-row__rm" data-cal-rm title="Retirer">×</button>
    </div>`;

  function readRows(box) {
    return [...box.querySelectorAll('.cal-row')]
      .map((row) => ({
        start: row.querySelector('[data-f=start]').value,
        end: row.querySelector('[data-f=end]').value || row.querySelector('[data-f=start]').value,
        label: row.querySelector('[data-f=label]').value.trim(),
      }))
      .filter((p) => p.start);
  }

  async function open(dest, openDrawer, toast) {
    if (!global.AT_API.adminKey()) return toast('Connectez-vous avec la clé admin du backend pour régler les calendriers.');
    const options = [[dest.id, `${dest.name} — toutes formules`], ...(PACKAGES[dest.id] || []).map(([k, l]) => [`${dest.id}:${k}`, l])];
    let key = dest.id === 'taghit' ? 'taghit:brezina' : dest.id;

    async function render() {
      openDrawer(`<h3>Calendrier — ${esc(dest.name)}</h3><div class="empty">Chargement…</div>`);
      let cal;
      try {
        cal = await call(`/${encodeURIComponent(key)}`);
      } catch (err) {
        openDrawer(`<h3>Calendrier — ${esc(dest.name)}</h3><div class="empty">${esc(err.message)}</div>`);
        return;
      }
      const isSub = key.includes(':');
      openDrawer(`
        <h3>Calendrier de réservation — ${esc(dest.name)}</h3>
        <form id="calForm" class="cal-form">
          ${
            options.length > 1
              ? `<div class="field"><label>Formule</label><select id="calKey">${options
                  .map(([k, l]) => `<option value="${esc(k)}" ${k === key ? 'selected' : ''}>${esc(l)}</option>`)
                  .join('')}</select></div>`
              : ''
          }
          ${isSub && !cal.configured ? '<p class="cal-hint">Cette formule n’a pas de réglage propre : elle suit celui de la destination (« toutes formules »). Enregistrez pour lui donner ses propres dates.</p>' : ''}
          <div class="field">
            <label>Mode</label>
            <label class="cal-mode"><input type="radio" name="mode" value="fixed" ${cal.mode === 'fixed' ? 'checked' : ''} /> <span><strong>Séjours à dates fixes</strong><br><small>Le client choisit uniquement un des séjours ci-dessous. Toutes les autres dates sont bloquées.</small></span></label>
            <label class="cal-mode"><input type="radio" name="mode" value="open" ${cal.mode !== 'fixed' ? 'checked' : ''} /> <span><strong>Dates libres</strong><br><small>Toute date future est acceptée, sauf les périodes bloquées.</small></span></label>
          </div>
          <div class="field" id="calPeriodsField">
            <label>Séjours proposés</label>
            <div id="calPeriods">${cal.periods.map(rowHtml).join('')}</div>
            <button type="button" class="btn btn--sm btn--ghost" id="calAddPeriod">+ Ajouter un séjour</button>
          </div>
          <div class="field">
            <label>Dates bloquées <small>(aucune réservation possible)</small></label>
            <div id="calBlocked">${cal.blocked.map(rowHtml).join('')}</div>
            <button type="button" class="btn btn--sm btn--ghost" id="calAddBlocked">+ Bloquer une période</button>
          </div>
          <p class="cal-preview" id="calPreview"></p>
          <div class="form-actions">
            <button type="submit" class="btn btn--primary" style="width:auto">Enregistrer le calendrier</button>
            ${isSub && cal.configured ? '<button type="button" class="btn btn--ghost" id="calReset">Revenir au réglage de la destination</button>' : ''}
          </div>
        </form>`);

      const form = document.getElementById('calForm');
      const periods = document.getElementById('calPeriods');
      const blocked = document.getElementById('calBlocked');
      const preview = () => {
        if (!form.isConnected) return;
        const mode = form.mode.value;
        document.getElementById('calPeriodsField').style.opacity = mode === 'fixed' ? '1' : '0.5';
        const p = readRows(periods);
        const b = readRows(blocked);
        const parts = [];
        if (mode === 'fixed') parts.push(p.length ? `Réservable uniquement : ${p.map((x) => `du ${fmt(x.start)} au ${fmt(x.end)}`).join(', ')}.` : 'Aucun séjour : ajoutez-en au moins un.');
        else parts.push('Réservable à toute date future.');
        if (b.length) parts.push(`Fermé : ${b.map((x) => `du ${fmt(x.start)} au ${fmt(x.end)}`).join(', ')}.`);
        document.getElementById('calPreview').textContent = parts.join(' ');
      };
      form.addEventListener('input', preview);
      form.addEventListener('change', preview);
      document.getElementById('calKey')?.addEventListener('change', (e) => {
        key = e.target.value;
        render();
      });
      document.getElementById('calAddPeriod').onclick = () => {
        periods.insertAdjacentHTML('beforeend', rowHtml());
        preview();
      };
      document.getElementById('calAddBlocked').onclick = () => {
        blocked.insertAdjacentHTML('beforeend', rowHtml());
        preview();
      };
      form.addEventListener('click', (e) => {
        const rm = e.target.closest('[data-cal-rm]');
        if (!rm) return;
        rm.closest('.cal-row').remove();
        preview();
      });
      document.getElementById('calReset')?.addEventListener('click', async () => {
        if (!confirm('Supprimer le réglage propre de cette formule ? Elle suivra celui de la destination.')) return;
        try {
          await call(`/${encodeURIComponent(key)}`, { method: 'DELETE' });
          toast('Réglage de la formule supprimé');
          render();
        } catch (err) {
          toast(err.message);
        }
      });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = { mode: form.mode.value, periods: readRows(periods), blocked: readRows(blocked) };
        const bad = [...body.periods, ...body.blocked].find((p) => p.end < p.start);
        if (bad) return toast(`La fin doit être après le début (${fmt(bad.start)})`);
        if (body.mode === 'fixed' && !body.periods.length) return toast('Ajoutez au moins un séjour, ou choisissez « Dates libres »');
        const btn = form.querySelector('[type=submit]');
        btn.disabled = true;
        try {
          await call(`/${encodeURIComponent(key)}`, { method: 'PUT', body });
          toast('Calendrier enregistré — appliqué immédiatement sur le site');
          render();
        } catch (err) {
          toast(err.message);
          btn.disabled = false;
        }
      });
      preview();
    }

    render();
  }

  global.ATBookingCalendarUI = { open };
})(window);
