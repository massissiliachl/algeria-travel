import React from 'react';
import { Link } from 'react-router-dom';
import { useHotelFormContext } from '../context/HotelFormContext';
import { useRooms } from '../hooks/useRooms';
import { RoomListPanel } from '../components/rooms/RoomListPanel';
import RoomDetailPanel from '../components/rooms/RoomDetailPanel';

export default function RoomsPage() {
  const { form, loading, onChange, save } = useHotelFormContext();
  const roomCount = Math.max(1, Number(form.roomsAvailable) || 0);

  const {
    rooms,
    selectedId,
    selectedRoom,
    setSelectedId,
    updateRoom,
    addRoom,
    duplicateRoom,
    deleteRoom,
  } = useRooms(roomCount, form.image);

  const handleAddRoom = async () => {
    const newId = addRoom();
    const newCount = Math.max(roomCount, newId);
    onChange('roomsAvailable', String(newCount));
    try {
      await save({ roomsAvailable: newCount });
    } catch {
      /* erreur affichée par le contexte */
    }
  };

  const handleDeleteRoom = async (id) => {
    deleteRoom(id);
    const newCount = Math.max(1, rooms.length - 1);
    onChange('roomsAvailable', String(newCount));
    try {
      await save({ roomsAvailable: newCount });
    } catch {
      /* ignore */
    }
  };

  if (loading) return <p className="partner-loading">Chargement des chambres…</p>;

  if (!form.roomsAvailable || Number(form.roomsAvailable) < 1) {
    return (
      <div className="htl-rooms-page">
        <header className="htl-page-head">
          <nav className="htl-breadcrumb">
            <Link to="/">Accueil</Link>
            <span>›</span>
            <span>Chambres</span>
          </nav>
          <h1>Gestion des chambres</h1>
        </header>
        <div className="panel" style={{ padding: 24 }}>
          <p>
            Indiquez d&apos;abord le nombre de chambres dans{' '}
            <Link to="/tarifs">Tarifs &amp; saisons</Link>, puis revenez ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="htl-rooms-page">
      <header className="htl-page-head">
        <nav className="htl-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>›</span>
          <span>Chambres</span>
        </nav>
        <div className="htl-page-head__row">
          <div>
            <h1>Gestion des chambres</h1>
            <p>Gérez vos chambres, leurs tarifs et disponibilités jour par jour.</p>
          </div>
        </div>
      </header>

      <div className="htl-rooms-layout">
        <RoomListPanel
          rooms={rooms}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={handleAddRoom}
        />
        <RoomDetailPanel
          room={selectedRoom}
          basePrice={Number(form.price) || 0}
          onUpdate={updateRoom}
          onDuplicate={duplicateRoom}
          onDelete={handleDeleteRoom}
        />
      </div>
    </div>
  );
}
