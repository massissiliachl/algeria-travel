import React, { useMemo, useState } from 'react';
import Icon from '../ui/Icon';
import './HotelAvailabilityCalendar.css';

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function toIso(d) {
  return d.toISOString().slice(0, 10);
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  return cells;
}

function dayStatus(day, dayMap, todayIso) {
  if (!day) return 'empty';
  const iso = toIso(day);
  if (iso < todayIso) return 'past';
  const info = dayMap.get(iso);
  if (!info) return 'unknown';
  if (info.closed || info.roomsLeft <= 0) return 'full';
  if (info.roomsLeft <= Math.max(1, Math.floor(info.roomsTotal * 0.25))) return 'limited';
  return 'available';
}

export default function HotelAvailabilityCalendar({
  days = [],
  checkIn,
  checkOut,
  rooms = 1,
  onSelectRange,
  t,
}) {
  const todayIso = toIso(new Date());
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [picking, setPicking] = useState(null);

  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const cells = useMemo(() => buildMonthGrid(cursor), [cursor]);

  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const handleDayClick = (day) => {
    if (!day) return;
    const iso = toIso(day);
    if (iso < todayIso) return;

    const info = dayMap.get(iso);
    if (!info || info.closed || info.roomsLeft < rooms) return;

    if (!picking || (picking && checkOut)) {
      setPicking(iso);
      onSelectRange?.({ checkIn: iso, checkOut: '' });
      return;
    }

    if (iso <= picking) {
      setPicking(iso);
      onSelectRange?.({ checkIn: iso, checkOut: '' });
      return;
    }

    let ok = true;
    let cur = picking;
    while (cur < iso) {
      const d = dayMap.get(cur);
      if (!d || d.closed || d.roomsLeft < rooms) {
        ok = false;
        break;
      }
      const next = new Date(`${cur}T12:00:00`);
      next.setDate(next.getDate() + 1);
      cur = toIso(next);
    }

    if (ok) {
      onSelectRange?.({ checkIn: picking, checkOut: iso });
      setPicking(null);
    } else {
      setPicking(iso);
      onSelectRange?.({ checkIn: iso, checkOut: '' });
    }
  };

  const inRange = (iso) => {
    if (!checkIn) return false;
    if (!checkOut) return iso === checkIn;
    return iso >= checkIn && iso < checkOut;
  };

  return (
    <div className="htl-cal">
      <div className="htl-cal__head">
        <button type="button" aria-label="Mois précédent" onClick={() => setCursor(addMonths(cursor, -1))}>
          <Icon name="ChevronLeft" size={18} />
        </button>
        <strong>{monthLabel}</strong>
        <button type="button" aria-label="Mois suivant" onClick={() => setCursor(addMonths(cursor, 1))}>
          <Icon name="ChevronRight" size={18} />
        </button>
      </div>

      <div className="htl-cal__weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="htl-cal__grid">
        {cells.map((day, i) => {
          if (!day) return <span key={`e-${i}`} className="htl-cal__cell is-empty" />;
          const iso = toIso(day);
          const status = dayStatus(day, dayMap, todayIso);
          const info = dayMap.get(iso);
          const selected = inRange(iso);
          return (
            <button
              key={iso}
              type="button"
              disabled={status === 'past' || status === 'full' || status === 'unknown'}
              className={`htl-cal__cell is-${status}${selected ? ' is-selected' : ''}`}
              onClick={() => handleDayClick(day)}
              title={
                info
                  ? `${info.roomsLeft} ${t('hotels_cal_rooms_left')}`
                  : undefined
              }
            >
              <span>{day.getDate()}</span>
              {info && status !== 'past' && (
                <em>{info.roomsLeft}</em>
              )}
            </button>
          );
        })}
      </div>

      <ul className="htl-cal__legend">
        <li><span className="dot is-available" /> {t('hotels_cal_available')}</li>
        <li><span className="dot is-limited" /> {t('hotels_cal_limited')}</li>
        <li><span className="dot is-full" /> {t('hotels_cal_full')}</li>
      </ul>
    </div>
  );
}
