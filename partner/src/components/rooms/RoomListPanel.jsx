import React from 'react';

export function RoomListPanel({ rooms, selectedId, onSelect, onAdd }) {
  return (
    <aside className="htl-rooms-list">
      <div className="htl-rooms-list__head">
        <h2>Liste des chambres</h2>
        <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
          + Ajouter une chambre
        </button>
      </div>

      <div className="htl-rooms-list__items">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className={`htl-room-card${selectedId === room.id ? ' is-active' : ''}`}
            onClick={() => onSelect(room.id)}
          >
            <div className="htl-room-card__thumb">
              {room.image ? (
                <img src={room.image} alt="" />
              ) : (
                <span aria-hidden="true">🛏</span>
              )}
            </div>
            <div className="htl-room-card__body">
              <strong>{room.name}</strong>
              <span>{room.beds}</span>
              <span>{room.capacity} personne{room.capacity > 1 ? 's' : ''}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
