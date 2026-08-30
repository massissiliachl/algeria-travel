import React from 'react';

export default function HotelRoomDrawer({ room, open, onClose, onChange }) {
  if (!open || !room) return null;

  return (
    <>
      <div className="adm-hotel-drawer__overlay" onClick={onClose} aria-hidden="true" />
      <aside className="adm-hotel-drawer">
        <header className="adm-hotel-drawer__head">
          <h3>Modifier la chambre</h3>
          <button type="button" className="adm-hotel-drawer__close" onClick={onClose} aria-label="Fermer">×</button>
        </header>

        <div className="adm-hotel-drawer__body">
          <label>
            Type de chambre
            <input value={room.type} onChange={(e) => onChange(room.id, { type: e.target.value, name: e.target.value })} />
          </label>

          <label>
            Description
            <textarea rows={3} value={room.description || ''} onChange={(e) => onChange(room.id, { description: e.target.value })} />
          </label>

          <fieldset className="adm-hotel-drawer__group">
            <legend>Capacité &amp; lits</legend>
            <label>
              Capacité max
              <select value={room.capacity} onChange={(e) => onChange(room.id, { capacity: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>
            <label>
              Configuration lits
              <input value={room.beds} onChange={(e) => onChange(room.id, { beds: e.target.value })} />
            </label>
          </fieldset>

          <fieldset className="adm-hotel-drawer__group">
            <legend>Détails</legend>
            <label>
              Taille (m²)
              <input type="number" min={0} value={room.size} onChange={(e) => onChange(room.id, { size: Number(e.target.value) })} />
            </label>
            <label>
              Étage
              <input value={room.floor || ''} onChange={(e) => onChange(room.id, { floor: e.target.value })} />
            </label>
          </fieldset>

          <fieldset className="adm-hotel-drawer__group">
            <legend>Tarification</legend>
            <label>
              Prix standard / nuit (DZD)
              <input type="number" min={0} value={room.price} onChange={(e) => onChange(room.id, { price: Number(e.target.value) })} />
            </label>
            <label>
              Prix week-end (DZD)
              <input type="number" min={0} value={room.weekendPrice || ''} onChange={(e) => onChange(room.id, { weekendPrice: Number(e.target.value) })} />
            </label>
          </fieldset>

          <label className="adm-hotel-drawer__toggle">
            <span>Chambre active</span>
            <input
              type="checkbox"
              checked={Boolean(room.active)}
              onChange={(e) => onChange(room.id, { active: e.target.checked })}
            />
          </label>
        </div>
      </aside>
    </>
  );
}
