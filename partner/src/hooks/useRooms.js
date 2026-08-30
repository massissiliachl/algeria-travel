import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BED_TYPES = [
  '1 lit double',
  '2 lits simples',
  '1 lit king size',
  'Lit superposé',
];

function defaultRoom(index, hotelImage = '') {
  return {
    id: index,
    name: `Chambre ${index}`,
    beds: BED_TYPES[(index - 1) % BED_TYPES.length],
    capacity: index % 2 === 0 ? 2 : 3,
    image: hotelImage,
    active: true,
  };
}

function loadStored(hotelId) {
  try {
    const raw = localStorage.getItem(`partner_rooms_${hotelId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStored(hotelId, rooms) {
  localStorage.setItem(`partner_rooms_${hotelId}`, JSON.stringify(rooms));
}

export function useRooms(roomCount, hotelImage = '') {
  const { hotel } = useAuth();
  const hotelId = hotel?.id || 'default';
  const [rooms, setRooms] = useState([]);
  const [selectedId, setSelectedId] = useState(1);

  const syncFromCount = useCallback(
    (count, image) => {
      const n = Math.max(0, Number(count) || 0);
      const stored = loadStored(hotelId);
      const next = [];

      for (let i = 1; i <= n; i += 1) {
        const prev = stored?.find((r) => r.id === i);
        next.push(prev ? { ...defaultRoom(i, image), ...prev, id: i } : defaultRoom(i, image));
      }

      setRooms(next);
      saveStored(hotelId, next);
      if (selectedId > n && n > 0) setSelectedId(1);
    },
    [hotelId, selectedId]
  );

  useEffect(() => {
    syncFromCount(roomCount, hotelImage);
  }, [roomCount, hotelImage, syncFromCount]);

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
    const room = defaultRoom(nextId, hotelImage);
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
  };

  const deleteRoom = (id) => {
    if (rooms.length <= 1) return;
    setRooms((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveStored(hotelId, next);
      return next;
    });
    setSelectedId((cur) => {
      if (cur !== id) return cur;
      const remaining = rooms.filter((r) => r.id !== id);
      return remaining[0]?.id || 1;
    });
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
