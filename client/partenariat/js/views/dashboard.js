import { api, session, ADMIN_MODE } from '../api.js';
import { esc, icon, badge, fmtDate, PROPERTY_TYPES, MONTHS, imgSrc } from '../ui.js';

function lineChart(points) {
  const W = 640;
  const H = 220;
  const pad = { l: 30, r: 28, t: 12, b: 28 };
  const max = Math.max(4, ...points.map((p) => p.count));
  const step = Math.ceil(max / 5);
  const top = step * 5;
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, points.length - 1);
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / top);
  const coords = points.map((p, i) => [x(i), y(p.count)]);
  const path = coords.reduce((d, [cx, cy], i) => {
    if (!i) return `M${cx},${cy}`;
    const [px, py] = coords[i - 1];
    const mx = (px + cx) / 2;
    return `${d} C${mx},${py} ${mx},${cy} ${cx},${cy}`;
  }, '');
  const area = `${path} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const grid = Array.from({ length: 6 }, (_, i) => i * step)
    .map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="#e6eaf1"/><text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`)
    .join('');
  const every = Math.ceil(points.length / 8);
  const labels = points
    .map((p, i) => {
      if (i % every && i !== points.length - 1) return '';
      const [, m, d] = p.day.split('-').map(Number);
      return `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${d} ${MONTHS[m - 1].slice(0, 4)}</text>`;
    })
    .join('');
  const last = coords[coords.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Évolution des réservations">
    <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1b64d8" stop-opacity=".22"/><stop offset="1" stop-color="#1b64d8" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#g)"/><path d="${path}" fill="none" stroke="#1b64d8" stroke-width="2.2"/>
    ${coords.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="3" fill="#1b64d8"/>`).join('')}
    <circle cx="${last[0]}" cy="${last[1]}" r="5" fill="#1b64d8" stroke="#fff" stroke-width="2"/>${labels}</svg>`;
}

const stat = (tone, ico, label, value, href, linkLabel) => `
  <div class="card stat">
    <div class="stat__icon tone-${tone}">${icon(ico, 20)}</div>
    <div class="stat__label">${esc(label)}</div>
    <div class="stat__value">${esc(value)}</div>
    <a class="stat__link text-${tone}" href="${href}">${esc(linkLabel)} ${icon('arrowRight', 13)}</a>
  </div>`;

export async function renderDashboard(view, days = 7) {
  const { data } = await api.get(`/dashboard?days=${days}`);
  const owner = session.owner;
  const now = new Date();
  const firstName = ADMIN_MODE ? 'Administrateur' : owner?.firstName || '';

  view.innerHTML = `
    <div class="page-head">
      <div><h1>Bonjour ${esc(firstName)} 👋</h1><p>Voici un aperçu de ${ADMIN_MODE ? 'l’activité des hébergements' : 'votre activité'} aujourd’hui</p></div>
      <div class="today">${icon('calendar', 20)}<div>Aujourd’hui<br><strong>${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}</strong></div></div>
    </div>
    <div class="grid-dash">
      <div class="stack">
        <div class="stats">
          ${stat('blue', 'home', ADMIN_MODE ? 'Hébergements' : 'Mes hébergements', data.properties.total, '#/properties', 'Voir tous')}
          ${stat('green', 'bed', 'Total des chambres', data.rooms.total, '#/rooms', 'Voir toutes')}
          ${stat('orange', 'calendar', 'Disponibles aujourd’hui', data.rooms.available, '#/availability', 'Voir détails')}
          ${stat('purple', 'list', 'Réservations', data.reservations.total, '#/reservations', data.reservations.pending ? `${data.reservations.pending} en attente` : 'Voir toutes')}
        </div>
        <div class="card">
          <div class="card__head"><h2>Évolution des réservations</h2>
            <select id="chartDays" aria-label="Période" style="width:auto;min-height:34px">
              ${[7, 30, 90].map((d) => `<option value="${d}" ${d === days ? 'selected' : ''}>${d} derniers jours</option>`).join('')}
            </select>
          </div>
          <div class="card__body">${lineChart(data.chart)}</div>
        </div>
        <div class="card">
          <div class="card__head"><h2>${ADMIN_MODE ? 'Derniers hébergements modifiés' : 'Mes hébergements'}</h2><a class="link-btn" href="#/properties">Voir tous ${icon('arrowRight', 13)}</a></div>
          <div class="card__body">
            ${
              data.recentProperties.length
                ? data.recentProperties
                    .map(
                      (p) => `
              <a class="prop-row" href="#/properties/${encodeURIComponent(p.id)}" style="color:inherit">
                ${p.image ? `<img src="${imgSrc(p.image)}" alt="" loading="lazy">` : `<div class="thumb-ph">${icon('image', 22)}</div>`}
                <div><h3>${esc(p.name)}</h3>
                  <div class="meta"><span>${icon('pin', 13)}${esc([p.city, p.wilaya].filter(Boolean).join(', ') || '—')}</span><span>${icon('building', 13)}${esc(PROPERTY_TYPES[p.propertyType] || p.propertyType)}</span></div>
                  <div style="margin-top:8px">${badge(p.status)}</div>
                </div>
                <div class="meta" style="display:grid;gap:6px"><span>${icon('bed', 14)}${p.roomCount} chambre(s)</span><span>${icon('calendar', 14)}${p.reservationCount} réservation(s)</span></div>
                <span class="muted">${icon('chevronRight')}</span>
              </a>`
                    )
                    .join('')
                : `<div class="empty"><h3>Aucun hébergement</h3><p>Ajoutez votre premier établissement pour commencer.</p><a class="btn btn--primary" href="#/properties/new">${icon('plus')} Ajouter un hébergement</a></div>`
            }
          </div>
        </div>
        <div class="banner">
          <div class="promo__brand"><img src="../public/logo.png" alt=""><div><strong>Algeria Travel</strong><small>Votre partenaire pour une expérience unique</small></div></div>
          <a class="btn btn--sm" href="#/properties">${ADMIN_MODE ? 'Voir les hébergements' : 'Voir mes hébergements'} ${icon('arrowRight', 14)}</a>
        </div>
      </div>

      <div class="stack">
        <div class="promo"><h3>Ensemble pour un tourisme de qualité en Algérie</h3><div class="promo__brand"><img src="../public/logo.png" alt="">Algeria Travel</div></div>
        <div class="card">
          <div class="card__head"><h2>Actions rapides</h2></div>
          <div class="card__body quick">
            <a class="tone-blue" href="#/properties/new">${icon('home', 20)}<span>Ajouter un hébergement</span></a>
            <a class="tone-green" href="#/rooms">${icon('bed', 20)}<span>Ajouter une chambre</span></a>
            <a class="tone-orange" href="#/rates">${icon('tag', 20)}<span>Gérer les tarifs</span></a>
            <a class="tone-purple" href="#/availability">${icon('calendar', 20)}<span>Voir les disponibilités</span></a>
          </div>
        </div>
        <div class="card">
          <div class="card__head"><h2>Prochaines réservations</h2><a class="link-btn" href="#/reservations">Voir toutes ${icon('arrowRight', 13)}</a></div>
          <div class="card__body mini-list">
            ${
              data.upcoming.length
                ? data.upcoming
                    .map(
                      (r) => `
              <a class="mini-item" href="#/reservations">
                ${r.propertyImage ? `<img src="${imgSrc(r.propertyImage)}" alt="" loading="lazy">` : `<div class="thumb-ph">${icon('bed')}</div>`}
                <div class="mini-item__main"><strong>${esc(r.roomName || r.itemName)}</strong><small>${esc(r.propertyName || '')}</small><small>${fmtDate(r.checkInDate, { year: false })} – ${fmtDate(r.checkOutDate)}</small></div>
                ${badge(r.status)}
              </a>`
                    )
                    .join('')
                : '<p class="muted" style="margin:0">Aucune réservation à venir.</p>'
            }
          </div>
        </div>
      </div>
    </div>`;

  view.querySelector('#chartDays').addEventListener('change', (e) => renderDashboard(view, Number(e.target.value)));
}
