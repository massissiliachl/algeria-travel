/** Fallback planning when l'API n'est pas disponible */

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function buildFallbackAvailability(hotel, from, to) {
  const roomsTotal = Math.max(0, Number(hotel?.roomsAvailable) || 5);
  const closed = hotel?.availability === 'unavailable';
  const price = Number(hotel?.price) || 0;
  const days = [];
  let cur = from;
  while (cur <= to) {
    days.push({
      date: cur,
      roomsTotal,
      roomsBooked: 0,
      roomsLeft: closed ? 0 : roomsTotal,
      closed,
      price,
    });
    cur = addDays(cur, 1);
  }
  return { hotelId: hotel?.id, basePrice: price, days };
}

export function countNights(checkIn, checkOut) {
  if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
  let n = 0;
  let cur = checkIn;
  while (cur < checkOut) {
    n += 1;
    cur = addDays(cur, 1);
  }
  return n;
}

export function calcStayTotal(days, checkIn, checkOut, rooms = 1) {
  if (!checkIn || !checkOut) return null;
  const map = new Map(days.map((d) => [d.date, d]));
  let total = 0;
  let cur = checkIn;
  while (cur < checkOut) {
    const day = map.get(cur);
    if (!day || day.closed || day.roomsLeft < rooms) return null;
    total += day.price || 0;
    cur = addDays(cur, 1);
  }
  return total * rooms;
}

export function isRangeAvailable(days, checkIn, checkOut, rooms = 1) {
  return calcStayTotal(days, checkIn, checkOut, rooms) != null;
}
