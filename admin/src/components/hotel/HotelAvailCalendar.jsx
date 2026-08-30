import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function dayStatus(day) {
  if (day.booked) return 'full';
  if (day.closed || !day.available) return 'closed';
  const left = day.roomsLeft ?? (day.available ? 1 : 0);
  if (left <= 0) return 'full';
  if (left === 1) return 'low';
  return 'open';
}

function formatPrice(value) {
  if (!value) return '—';
  return Number(value).toLocaleString('fr-DZ');
}

export default function HotelAvailCalendar({ hotelId, room, basePrice }) {
  const [cursor, setCursor] = useState(() => monthStart(new Date()));
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    const from = cursor.toISOString().slice(0, 10);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { from, to: end.toISOString().slice(0, 10) };
  }, [cursor]);

  useEffect(() => {
    if (!hotelId || !room) return;
    setLoading(true);
    api
      .getHotelRoomAvailability(hotelId, room.id, range)
      .then((data) => setDays(data.days || []))
      .catch(() => setDays([]))
      .finally(() => setLoading(false));
  }, [hotelId, room?.id, range.from, range.to]);

  if (!room) return null;

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
        price: room.price || basePrice,
      };
      return { ...info, dayNum: i + 1, weekday };
    });
  }, [cursor, days, room.price, basePrice]);

  return (
    <section className="adm-hotel-cal">
      <div className="adm-hotel-cal__head">
        <h3>Disponibilités &amp; tarifs saisonniers — {room.name}</h3>
        <div className="adm-hotel-cal__nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCursor(monthStart(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)))}>←</button>
          <strong style={{ textTransform: 'capitalize' }}>{monthLabel}</strong>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCursor(monthStart(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)))}>→</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCursor(monthStart(new Date()))}>Aujourd&apos;hui</button>
        </div>
      </div>

      {loading ? (
        <p className="adm-hotel-cal__loading">Chargement…</p>
      ) : (
        <div className="adm-hotel-cal__scroll">
          <table className="adm-hotel-cal__table">
            <thead>
              <tr>
                <th className="adm-hotel-cal__label" />
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
                <th className="adm-hotel-cal__label">Disponibilité</th>
                {monthDays.map((d) => {
                  const st = dayStatus(d);
                  const val = st === 'open' ? '1' : st === 'low' ? '1' : st === 'full' ? '0' : '—';
                  return (
                    <td key={`a-${d.date}`}>
                      <span className={`adm-hotel-cal__cell st-${st}`}>{val}</span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th className="adm-hotel-cal__label">Prix (DZD)</th>
                {monthDays.map((d) => (
                  <td key={`p-${d.date}`}>
                    <span className={`adm-hotel-cal__price${dayStatus(d) === 'closed' ? ' is-muted' : ''}`}>
                      {dayStatus(d) === 'closed' ? '—' : formatPrice(d.price || room.price || basePrice)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-hotel-cal__legend">
        <span><i className="st-open" /> Disponible</span>
        <span><i className="st-low" /> Faible dispo</span>
        <span><i className="st-full" /> Complet</span>
        <span><i className="st-closed" /> Fermé</span>
      </div>
    </section>
  );
}
