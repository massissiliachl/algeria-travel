import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAdminHotelRooms } from '../../hooks/useAdminHotelRooms';
import HotelAvailCalendar from './HotelAvailCalendar';
import HotelRoomDrawer from './HotelRoomDrawer';

export default function HotelRoomsTab({ hotelId, form, onRoomsCountChange }) {
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
  } = useAdminHotelRooms(hotelId, roomCount, form.image, Number(form.price) || 0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({ open: 0, total: 0, occupancy: 0 });

  useEffect(() => {
    if (!hotelId) return;
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date();
    end.setDate(end.getDate() + 30);
    api
      .getHotelAvailability(hotelId, { from: today, to: end.toISOString().slice(0, 10) })
      .then((data) => {
        const days = data.days || [];
        const open = days.filter((d) => !d.closed && d.roomsLeft > 0).length;
        const total = days.length || 1;
        const avgBooked = days.reduce((s, d) => s + (d.roomsBooked || 0), 0) / total;
        const avgTotal = days.reduce((s, d) => s + (d.roomsTotal || roomCount), 0) / total;
        const occupancy = avgTotal ? Math.round((avgBooked / avgTotal) * 100) : 0;
        setStats({ open, total: days.length, occupancy });
      })
      .catch(() => setStats({ open: 0, total: 0, occupancy: 0 }));
  }, [hotelId, roomCount]);

  const handleAdd = () => {
    const newId = addRoom();
    onRoomsCountChange(Math.max(roomCount, newId));
  };

  const handleDelete = (id) => {
    deleteRoom(id);
    onRoomsCountChange(Math.max(1, rooms.length - 1));
  };

  const avgPrice =
    rooms.length > 0
      ? Math.round(rooms.reduce((s, r) => s + (r.price || 0), 0) / rooms.length)
      : Number(form.price) || 0;

  return (
    <div className="adm-hotel-rooms">
      <div className="adm-hotel-kpis">
        <article className="adm-hotel-kpi">
          <span>Chambres totales</span>
          <strong>{rooms.length || roomCount}</strong>
        </article>
        <article className="adm-hotel-kpi adm-hotel-kpi--green">
          <span>Chambres disponibles</span>
          <strong>{rooms.filter((r) => r.active).length}</strong>
        </article>
        <article className="adm-hotel-kpi adm-hotel-kpi--orange">
          <span>Taux d&apos;occupation</span>
          <strong>{stats.occupancy}%</strong>
        </article>
        <article className="adm-hotel-kpi adm-hotel-kpi--purple">
          <span>Prix moyen / nuit</span>
          <strong>{avgPrice.toLocaleString('fr-DZ')} DZD</strong>
        </article>
      </div>

      <div className="adm-hotel-table-wrap">
        <div className="adm-hotel-table__toolbar">
          <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
            + Ajouter une chambre
          </button>
        </div>

        <div className="adm-hotel-table-scroll">
          <table className="adm-hotel-table">
            <thead>
              <tr>
                <th />
                <th>Type de chambre</th>
                <th>Capacité</th>
                <th>Nombre de lits</th>
                <th>Taille</th>
                <th>Tarif standard</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr
                  key={room.id}
                  className={selectedId === room.id ? 'is-selected' : ''}
                  onClick={() => setSelectedId(room.id)}
                >
                  <td>
                    <div className="adm-hotel-table__thumb">
                      {room.image ? <img src={room.image} alt="" /> : <span>🛏</span>}
                    </div>
                  </td>
                  <td><strong>{room.type}</strong></td>
                  <td>👤 {room.capacity}</td>
                  <td>{room.beds}</td>
                  <td>{room.size} m²</td>
                  <td>{Number(room.price).toLocaleString('fr-DZ')} DZD</td>
                  <td>
                    <span className={`adm-hotel-badge${room.active ? ' is-active' : ''}`}>
                      {room.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="adm-hotel-table__actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" title="Modifier" onClick={() => { setSelectedId(room.id); setDrawerOpen(true); }}>✎</button>
                    <button type="button" title="Dupliquer" onClick={() => duplicateRoom(room.id)}>⧉</button>
                    <button type="button" title="Supprimer" onClick={() => handleDelete(room.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <HotelAvailCalendar hotelId={hotelId} room={selectedRoom} basePrice={Number(form.price) || 0} />

      <HotelRoomDrawer
        room={selectedRoom}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onChange={updateRoom}
      />
    </div>
  );
}
