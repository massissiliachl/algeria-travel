import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function dayStatus(day) {
  if (day.booked) return 'full';
  if (day.closed || !day.available) return 'closed';
  return 'open';
}

function formatPrice(value) {
  if (!value) return '—';
  return Number(value).toLocaleString('fr-DZ');
}

export default function RoomAvailabilityGrid({ roomIndex, basePrice, onSaved }) {
  const [cursor, setCursor] = useState(() => monthStart(new Date()));
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [bulk, setBulk] = useState({ status: 'open', price: '' });
  const [period, setPeriod] = useState({ from: '', to: '', status: 'open', price: '' });

  const range = useMemo(() => {
    const from = cursor.toISOString().slice(0, 10);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { from, to: end.toISOString().slice(0, 10) };
  }, [cursor]);

  const load = () => {
    if (!roomIndex) return;
    setLoading(true);
    setError('');
    api
      .getRoomAvailability(roomIndex, range)
      .then((data) => setDays(data.days || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [roomIndex, range.from, range.to]);

  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const monthDays = useMemo(() => {
    const first = monthStart(cursor);
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(first.getFullYear(), first.getMonth(), i + 1);
      const iso = d.toISOString().slice(0, 10);
      const weekday = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const info = days.find((x) => x.date === iso) || {
        date: iso,
        available: true,
        booked: false,
        closed: false,
        price: basePrice,
      };
      return { ...info, dayNum: i + 1, weekday };
    });
  }, [cursor, days, basePrice]);

  const applyBulk = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateRoomAvailability(roomIndex, {
        from: range.from,
        to: range.to,
        available: bulk.status === 'open',
      });
      if (bulk.price !== '') {
        await api.updateAvailability({
          from: range.from,
          to: range.to,
          roomsTotal: undefined,
          closed: bulk.status === 'closed',
          priceOverride: Number(bulk.price),
        });
      }
      setSuccess('Modifications appliquées au mois.');
      load();
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const applyPeriod = async () => {
    if (!period.from || !period.to) {
      setError('Indiquez une période valide (Du / Au).');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateRoomAvailability(roomIndex, {
        from: period.from,
        to: period.to,
        available: period.status === 'open',
      });
      if (period.price !== '') {
        await api.updateAvailability({
          from: period.from,
          to: period.to,
          priceOverride: Number(period.price),
        });
      }
      setSuccess('Période mise à jour.');
      load();
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const goToday = () => setCursor(monthStart(new Date()));

  return (
    <div className="htl-avail">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="htl-avail__toolbar">
        <div className="htl-avail__month">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCursor(monthStart(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)))}>←</button>
          <strong style={{ textTransform: 'capitalize' }}>{monthLabel}</strong>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCursor(monthStart(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)))}>→</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={goToday}>Aujourd&apos;hui</button>
        </div>

        <div className="htl-avail__legend">
          <span><i className="st-open" /> Disponible</span>
          <span><i className="st-low" /> Faible dispo</span>
          <span><i className="st-full" /> Complet</span>
          <span><i className="st-closed" /> Fermé</span>
        </div>
      </div>

      {loading ? (
        <p className="htl-avail__loading">Chargement du calendrier…</p>
      ) : (
        <div className="htl-avail__scroll">
          <table className="htl-avail__table">
            <thead>
              <tr>
                <th className="htl-avail__row-label" />
                {monthDays.map((d) => (
                  <th key={d.date}>
                    <small>{d.weekday}</small>
                    <strong>{String(d.dayNum).padStart(2, '0')}</strong>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="htl-avail__row-label">Disponibilité</th>
                {monthDays.map((d) => {
                  const st = dayStatus(d);
                  const val = st === 'open' ? '1' : st === 'full' ? '0' : '—';
                  return (
                    <td key={`a-${d.date}`}>
                      <span className={`htl-avail__cell st-${st}`}>{val}</span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th className="htl-avail__row-label">Prix (DZD)</th>
                {monthDays.map((d) => (
                  <td key={`p-${d.date}`}>
                    <span className={`htl-avail__price${dayStatus(d) === 'closed' ? ' is-muted' : ''}`}>
                      {dayStatus(d) === 'closed' ? '—' : formatPrice(d.price || basePrice)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="htl-avail__forms">
        <div className="htl-avail__form-card">
          <h4>Modifier en masse</h4>
          <div className="htl-avail__form-grid">
            <label>
              Appliquer à
              <select disabled><option>Mois affiché</option></select>
            </label>
            <label>
              Statut
              <select value={bulk.status} onChange={(e) => setBulk((p) => ({ ...p, status: e.target.value }))}>
                <option value="open">Disponible</option>
                <option value="closed">Fermé</option>
              </select>
            </label>
            <label>
              Prix / nuit (optionnel)
              <input type="number" min={0} value={bulk.price} onChange={(e) => setBulk((p) => ({ ...p, price: e.target.value }))} placeholder={basePrice || '8500'} />
            </label>
            <button type="button" className="btn btn-primary" onClick={applyBulk} disabled={saving}>
              Appliquer
            </button>
          </div>
        </div>

        <div className="htl-avail__form-card">
          <h4>Modifier une période spécifique</h4>
          <div className="htl-avail__form-grid">
            <label>
              Du
              <input type="date" value={period.from} onChange={(e) => setPeriod((p) => ({ ...p, from: e.target.value }))} />
            </label>
            <label>
              Au
              <input type="date" value={period.to} onChange={(e) => setPeriod((p) => ({ ...p, to: e.target.value }))} />
            </label>
            <label>
              Statut
              <select value={period.status} onChange={(e) => setPeriod((p) => ({ ...p, status: e.target.value }))}>
                <option value="open">Disponible</option>
                <option value="closed">Fermé</option>
              </select>
            </label>
            <label>
              Prix / nuit
              <input type="number" min={0} value={period.price} onChange={(e) => setPeriod((p) => ({ ...p, price: e.target.value }))} />
            </label>
            <button type="button" className="btn btn-primary" onClick={applyPeriod} disabled={saving}>
              Appliquer la période
            </button>
          </div>
        </div>
      </div>

      <div className="htl-avail__footer-legend">
        <p><strong>Disponible</strong> — La chambre est réservable.</p>
        <p><strong>Complet</strong> — Chambre déjà réservée ou indisponible.</p>
        <p><strong>Fermé</strong> — Chambre fermée à la réservation pour cette date.</p>
      </div>
    </div>
  );
}
