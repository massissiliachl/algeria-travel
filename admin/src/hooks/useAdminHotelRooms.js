import { useCallback, useEffect, useMemo, useState } from 'react';

const ROOM_TEMPLATES = [
  { type: 'Chambre Simple', beds: '1 lit simple', capacity: 1, size: 14, price: 7500 },
  { type: 'Chambre Double', beds: '1 lit double', capacity: 2, size: 18, price: 8500 },
  { type: 'Chambre Twin', beds: '2 lits simples', capacity: 2, size: 20, price: 9000 },
  { type: 'Chambre Triple', beds: '3 lits simples', capacity: 3, size: 24, price: 11000 },
  { type: 'Suite Junior', beds: '1 lit king size', capacity: 2, size: 32, price: 14500 },
  { type: 'Suite Familiale', beds: '1 lit double + 2 simples', capacity: 4, size: 38, price: 16500 },
];

function defaultRoom(index, tpl, image = '') {
  return {
    id: index,
    type: tpl.type,
    name: tpl.type,
    beds: tpl.beds,
    capacity: tpl.capacity,
    size: tpl.size,
    price: tpl.price,
    weekendPrice: tpl.price + 1000,
    floor: String((index % 5) + 1),
    image,
    active: true,
    description: '',
  };
}

function loadStored(hotelId) {
  try {
    const raw = localStorage.getItem(`admin_hotel_rooms_${hotelId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStored(hotelId, rooms) {
  localStorage.setItem(`admin_hotel_rooms_${hotelId}`, JSON.stringify(rooms));
}

export function useAdminHotelRooms(hotelId, roomCount, hotelImage = '', basePrice = 0) {
  const [rooms, setRooms] = useState([]);
  const [selectedId, setSelectedId] = useState(1);

  const syncFromCount = useCallback(
    (count, image, price) => {
      const n = Math.max(0, Number(count) || 0);
      const stored = loadStored(hotelId);
      const next = [];

      for (let i = 1; i <= n; i += 1) {
        const tpl = ROOM_TEMPLATES[(i - 1) % ROOM_TEMPLATES.length];
        const tplPrice = price || tpl.price;
        const prev = stored?.find((r) => r.id === i);
        next.push(
          prev
            ? { ...defaultRoom(i, tpl, image), ...prev, id: i, price: prev.price || tplPrice }
            : { ...defaultRoom(i, tpl, image), price: tplPrice, weekendPrice: tplPrice + 1000 }
        );
      }

      setRooms(next);
      saveStored(hotelId, next);
      if (selectedId > n && n > 0) setSelectedId(1);
    },
    [hotelId, selectedId]
  );

  useEffect(() => {
    syncFromCount(roomCount, hotelImage, basePrice);
  }, [roomCount, hotelImage, basePrice, syncFromCount]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedId) || rooms[0] || null,
    [rooms, selectedId]
  );

  const updateRoom = (id, patch) => {
    setRooms((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      saveStored(hotelId, next);
      return next;
    });
  };

  const addRoom = () => {
    const nextId = rooms.length ? Math.max(...rooms.map((r) => r.id)) + 1 : 1;
    const tpl = ROOM_TEMPLATES[(nextId - 1) % ROOM_TEMPLATES.length];
    const room = defaultRoom(nextId, tpl, hotelImage);
    setRooms((prev) => {
      const next = [...prev, room];
      saveStored(hotelId, next);
      return next;
    });
    setSelectedId(nextId);
    return nextId;
  };

  const duplicateRoom = (id) => {
    const source = rooms.find((r) => r.id === id);
    if (!source) return;
    const nextId = Math.max(...rooms.map((r) => r.id)) + 1;
    const copy = { ...source, id: nextId, name: `${source.name} (copie)` };
    setRooms((prev) => {
      const next = [...prev, copy];
      saveStored(hotelId, next);
      return next;
    });
    setSelectedId(nextId);
    return nextId;
  };

  const deleteRoom = (id) => {
    if (rooms.length <= 1) return;
    setRooms((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveStored(hotelId, next);
      return next;
    });
    setSelectedId((cur) => (cur === id ? rooms.find((r) => r.id !== id)?.id || 1 : cur));
  };

  return {
    rooms,
    selectedId,
    selectedRoom,
    setSelectedId,
    updateRoom,
    addRoom,
    duplicateRoom,
    deleteRoom,
  };
}
