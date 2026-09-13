import React, { useMemo } from 'react';
import './BookingWindowCalendar.css';

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

export default function BookingWindowCalendar({
  dateMin,
  dateMax,
  value,
  onChange,
  rangeEnd = '',
  onRangeChange,
  mode = 'single',
  fixedRange = false,
}) {
  const monthDate = useMemo(
    () => startOfMonth(new Date(`${dateMin}T12:00:00`)),
    [dateMin]
  );
  const cells = useMemo(() => buildMonthGrid(monthDate), [monthDate]);

  const monthLabel = monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const inStayRange = (iso) => iso >= dateMin && iso <= dateMax;
  const isSelectable = (iso) => !fixedRange && inStayRange(iso);

  const inRange = (iso) => {
    if (fixedRange) return inStayRange(iso);
    if (mode !== 'range' || !value) return false;
    if (!rangeEnd) return iso === value;
    return iso >= value && iso <= rangeEnd;
  };

  const handleClick = (iso) => {
    if (fixedRange || !isSelectable(iso)) return;

    if (mode === 'range' && onRangeChange) {
      if (!value || rangeEnd) {
        onRangeChange({ checkIn: iso, checkOut: '' });
        return;
      }
      if (iso <= value) {
        onRangeChange({ checkIn: iso, checkOut: '' });
        return;
      }
      onRangeChange({ checkIn: value, checkOut: iso });
      return;
    }

    onChange?.(iso);
  };

  return (
    <div className="bk-win-cal" role="group" aria-label={monthLabel}>
      <div className="bk-win-cal__head">
        <strong>{monthLabel}</strong>
      </div>

      <div className="bk-win-cal__weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="bk-win-cal__grid">
        {cells.map((day, i) => {
          if (!day) return <span key={`e-${i}`} className="bk-win-cal__cell is-empty" aria-hidden="true" />;
          const iso = toIso(day);
          const selectable = isSelectable(iso);
          const highlighted = inRange(iso);
          const CellTag = fixedRange ? 'span' : 'button';
          return (
            <CellTag
              key={iso}
              type={fixedRange ? undefined : 'button'}
              disabled={!fixedRange && !selectable}
              className={`bk-win-cal__cell${selectable ? ' is-open' : ''}${!inStayRange(iso) ? ' is-closed' : ''}${highlighted ? ' is-in-stay' : ''}${!fixedRange && highlighted && mode === 'single' ? ' is-selected' : ''}`}
              onClick={fixedRange ? undefined : () => handleClick(iso)}
              aria-hidden={fixedRange && !highlighted ? true : undefined}
              aria-label={iso}
            >
              {day.getDate()}
            </CellTag>
          );
        })}
      </div>
    </div>
  );
}
