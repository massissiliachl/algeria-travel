import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useHotelFormContext } from '../context/HotelFormContext';

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function AvailabilityPlanning() {
  const { form } = useHotelFormContext();
  const roomCount = Math.max(1, Number(form.roomsAvailable) || 0);

  const [selectedRoom, setSelectedRoom] = useState(1);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cursor, setCursor] = useState(() => monthStart(new Date()));

  const range = useMemo(() => {
    const from = cursor.toISOString().slice(0, 10);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { from, to: end.toISOString().slice(0, 10) };
  }, [cursor]);

  const rooms = useMemo(
    () => Array.from({ length: roomCount }, (_, i) => i + 1),
    [roomCount]
  );

  useEffect(() => {
    if (selectedRoom > roomCount) setSelectedRoom(1);
  }, [roomCount, selectedRoom]);

  const load = () => {
    setLoading(true);
    setError('');
    api
      .getRoomAvailability(selectedRoom, range)
      .then((data) => setDays(data.days || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedRoom, range.from, range.to]);

  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const monthCells = useMemo(() => {
    const first = monthStart(cursor);
    const pad = (first.getDay() + 6) % 7;
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < pad; i += 1) cells.push(null);
    for (let d = 1; d <= count; d += 1) {
      cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    }
    return cells;
  }, [cursor]);

  const updateDay = (date, available) => {
    setDays((prev) => {
      const existing = prev.find((d) => d.date === date);
      if (existing) {
        return prev.map((d) =>
          d.date === date
            ? { ...d, available, closed: !available && !d.booked }
            : d
        );
      }
      return [...prev, { date, available, booked: false, closed: !available }];
    });
  };

  const saveMonth = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateRoomAvailability(selectedRoom, {
        days: days
          .filter((d) => d.date >= range.from && d.date <= range.to && !d.booked)
          .map((d) => ({
            date: d.date,
            available: Boolean(d.available),
          })),
      });
      setSuccess(`Planning de la Chambre ${selectedRoom} enregistré.`);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const applyBulk = async (available) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateRoomAvailability(selectedRoom, {
        from: range.from,
        to: range.to,
        available,
      });
      setSuccess(
        available
          ? `Chambre ${selectedRoom} ouverte sur tout le mois.`
          : `Chambre ${selectedRoom} fermée sur tout le mois.`
      );
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  if (!form.roomsAvailable || Number(form.roomsAvailable) < 1) {
    return (
      <div className="panel" style={{ padding: 20, marginTop: 20 }}>
        <h3>Planning des chambres</h3>
        <p className="field-hint">
          Indiquez d’abord le nombre de chambres dans <strong>Tarifs &amp; dispo</strong>, puis
          revenez ici pour gérer chaque chambre.
        </p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ padding: 20, marginTop: 20 }}>
      <h3>Planning des chambres</h3>
      <p className="field-hint">
        Choisissez une chambre, puis définissez sa disponibilité jour par jour. Les jours réservés
        sont bloqués automatiquement.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="partner-room-picker">
        <span className="partner-room-picker__label">Chambre</span>
        <div className="partner-room-picker__list">
          {rooms.map((n) => (
            <button
              key={n}
              type="button"
              className={`partner-room-chip${selectedRoom === n ? ' is-active' : ''}`}
              onClick={() => setSelectedRoom(n)}
            >
              Chambre {n}
            </button>
          ))}
        </div>
      </div>

      <div className="partner-room-toolbar">
        <strong className="partner-room-toolbar__title">Chambre {selectedRoom}</strong>
        <div className="partner-room-toolbar__actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => applyBulk(true)}
            disabled={saving}
          >
            Ouvrir tout le mois
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => applyBulk(false)}
            disabled={saving}
          >
            Fermer tout le mois
          </button>
        </div>
      </div>

      <div className="partner-room-month-nav">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setCursor(monthStart(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)))}
        >
          ←
        </button>
        <strong style={{ textTransform: 'capitalize' }}>{monthLabel}</strong>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setCursor(monthStart(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)))}
        >
          →
        </button>
      </div>

      <div className="partner-room-legend">
        <span><i className="is-open" /> Disponible</span>
        <span><i className="is-closed" /> Fermée</span>
        <span><i className="is-booked" /> Réservée</span>
      </div>

      {loading ? (
        <p>Chargement du planning…</p>
      ) : (
        <div className="partner-plan-grid">
          {monthCells.map((day, i) => {
            if (!day) return <span key={`e-${i}`} />;
            const iso = day.toISOString().slice(0, 10);
            const info = dayMap.get(iso) || {
              date: iso,
              available: true,
              booked: false,
              closed: false,
            };

            if (info.booked) {
              return (
                <div key={iso} className="partner-plan-day is-booked">
                  <strong>{day.getDate()}</strong>
                  <span className="partner-plan-day__status">Réservée</span>
                </div>
              );
            }

            return (
              <div
                key={iso}
                className={`partner-plan-day${info.available ? ' is-open' : ' is-closed'}`}
              >
                <strong>{day.getDate()}</strong>
                <label className="partner-plan-day__toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(info.available)}
                    onChange={(e) => updateDay(iso, e.target.checked)}
                  />
                  {info.available ? 'Disponible' : 'Fermée'}
                </label>
              </div>
            );
          })}
        </div>
      )}

      <div className="form-actions" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-primary" onClick={saveMonth} disabled={saving || loading}>
          {saving ? 'Enregistrement…' : `Enregistrer la Chambre ${selectedRoom}`}
        </button>
      </div>
    </div>
  );
}
