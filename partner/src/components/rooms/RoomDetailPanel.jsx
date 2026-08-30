import React, { useState } from 'react';
import { Field } from '../ui';
import RoomAvailabilityGrid from './RoomAvailabilityGrid';

const TABS = [
  { id: 'info', label: 'Informations' },
  { id: 'capacity', label: 'Capacité & lits' },
  { id: 'amenities', label: 'Équipements' },
  { id: 'photos', label: 'Photos' },
  { id: 'availability', label: 'Disponibilités & tarifs' },
];

export default function RoomDetailPanel({ room, basePrice, onUpdate, onDuplicate, onDelete }) {
  const [tab, setTab] = useState('availability');

  if (!room) {
    return (
      <div className="htl-room-detail htl-room-detail--empty">
        <p>Sélectionnez une chambre ou ajoutez-en une nouvelle.</p>
      </div>
    );
  }

  return (
    <section className="htl-room-detail">
      <header className="htl-room-detail__head">
        <div>
          <h2>{room.name}</h2>
          <span className={`htl-room-detail__badge${room.active ? ' is-active' : ''}`}>
            {room.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="htl-room-detail__actions">
          <button type="button" className="btn btn-secondary btn-sm">Voir la chambre</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onDuplicate(room.id)}>
            Dupliquer
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(room.id)}>
            Supprimer
          </button>
        </div>
      </header>

      <div className="htl-room-detail__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`htl-room-detail__tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="htl-room-detail__body">
        {tab === 'info' && (
          <div className="htl-room-form panel">
            <div className="form-grid">
              <Field label="Nom de la chambre" className="full">
                <input
                  value={room.name}
                  onChange={(e) => onUpdate(room.id, { name: e.target.value })}
                />
              </Field>
              <Field label="Statut">
                <select
                  value={room.active ? 'active' : 'inactive'}
                  onChange={(e) => onUpdate(room.id, { active: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {tab === 'capacity' && (
          <div className="htl-room-form panel">
            <div className="form-grid">
              <Field label="Type de lits">
                <input
                  value={room.beds}
                  onChange={(e) => onUpdate(room.id, { beds: e.target.value })}
                />
              </Field>
              <Field label="Capacité (personnes)">
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={room.capacity}
                  onChange={(e) => onUpdate(room.id, { capacity: Number(e.target.value) })}
                />
              </Field>
            </div>
          </div>
        )}

        {tab === 'amenities' && (
          <div className="htl-room-form panel">
            <p className="field-hint">
              Équipements spécifiques à cette chambre (climatisation, balcon, vue mer…).
            </p>
            <textarea
              rows={4}
              placeholder="Ex. Climatisation, TV, Balcon, Vue mer"
              value={room.amenities || ''}
              onChange={(e) => onUpdate(room.id, { amenities: e.target.value })}
            />
          </div>
        )}

        {tab === 'photos' && (
          <div className="htl-room-form panel">
            <Field label="URL photo">
              <input
                value={room.image || ''}
                onChange={(e) => onUpdate(room.id, { image: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            {room.image && (
              <div className="htl-room-form__preview">
                <img src={room.image} alt={room.name} />
              </div>
            )}
          </div>
        )}

        {tab === 'availability' && (
          <RoomAvailabilityGrid roomIndex={room.id} basePrice={basePrice} />
        )}
      </div>
    </section>
  );
}
