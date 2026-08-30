const { query } = require('../config/db');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(value) {
  if (!value || !DATE_RE.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : value;
}

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function eachNight(checkIn, checkOut) {
  const nights = [];
  let cur = checkIn;
  while (cur < checkOut) {
    nights.push(cur);
    cur = addDays(cur, 1);
  }
  return nights;
}

function formatPgDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value).slice(0, 10);
}

function mapDayRow(row, fallback) {
  const roomsTotal = row?.rooms_total ?? fallback.roomsTotal;
  const roomsBooked = row?.rooms_booked ?? 0;
  const closed = row?.closed ?? fallback.closed;
  const roomsLeft = closed ? 0 : Math.max(0, roomsTotal - roomsBooked);
  return {
    date: row?.stay_date ? formatPgDate(row.stay_date) : fallback.date,
    roomsTotal,
    roomsBooked,
    roomsLeft,
    closed,
    price: row?.price_override ?? fallback.price,
  };
}

async function getHotelBase(hotelId, { partner = false } = {}) {
  const publishedClause = partner ? '' : " and coalesce(published, true) = true";
  const result = await query(
    `select id, price, rooms_available, availability
     from public.stays
     where id = $1 and type = 'hotel'${publishedClause}`,
    [hotelId]
  );
  return result.rows[0] || null;
}

async function getAvailabilityRange(hotelId, fromDate, toDate, options = {}) {
  const hotel = await getHotelBase(hotelId, options);
  if (!hotel) return null;

  const fallbackTotal = Math.max(0, Number(hotel.rooms_available) || 0);
  const fallbackClosed = hotel.availability === 'unavailable';
  const basePrice = Number(hotel.price) || 0;

  const cal = await query(
    `select stay_date, rooms_total, rooms_booked, price_override, closed
     from public.hotel_daily_availability
     where hotel_id = $1 and stay_date >= $2::date and stay_date <= $3::date
     order by stay_date asc`,
    [hotelId, fromDate, toDate]
  );

  const byDate = new Map(
    cal.rows.map((r) => [formatPgDate(r.stay_date), r])
  );

  const days = [];
  let cur = fromDate;
  while (cur <= toDate) {
    const row = byDate.get(cur);
    days.push(
      mapDayRow(row, {
        date: cur,
        roomsTotal: fallbackTotal,
        closed: fallbackClosed,
        price: basePrice,
      })
    );
    cur = addDays(cur, 1);
  }

  return { hotelId, basePrice, days };
}

async function checkStayAvailability(hotelId, checkIn, checkOut, roomsRequested = 1) {
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return { ok: false, error: 'Dates de séjour invalides.' };
  }

  const nights = eachNight(checkIn, checkOut);
  if (!nights.length) {
    return { ok: false, error: 'Séjour d’au moins une nuit requis.' };
  }

  const range = await getAvailabilityRange(hotelId, checkIn, addDays(checkOut, -1));
  if (!range) {
    return { ok: false, error: 'Hôtel introuvable.' };
  }

  const dayMap = new Map(range.days.map((d) => [d.date, d]));
  let totalPrice = 0;

  for (const night of nights) {
    const day = dayMap.get(night);
    if (!day) {
      return { ok: false, error: `Disponibilité indisponible pour le ${night}.` };
    }
    if (day.closed || day.roomsLeft < roomsRequested) {
      return {
        ok: false,
        error: `Pas assez de chambres disponibles pour la nuit du ${night}.`,
      };
    }
    totalPrice += day.price || range.basePrice;
  }

  return {
    ok: true,
    nights: nights.length,
    totalPrice: totalPrice * roomsRequested,
    pricePerNight: totalPrice,
    nightly: nights.map((night) => dayMap.get(night)),
  };
}

async function ensureCalendarRows(hotelId, dates) {
  if (!dates.length) return;
  const hotel = await getHotelBase(hotelId);
  if (!hotel) throw Object.assign(new Error('Hôtel introuvable.'), { status: 404 });

  const fallbackTotal = Math.max(0, Number(hotel.rooms_available) || 0);

  for (const date of dates) {
    await query(
      `insert into public.hotel_daily_availability (hotel_id, stay_date, rooms_total, rooms_booked, closed)
       values ($1, $2::date, $3, 0, false)
       on conflict (hotel_id, stay_date) do nothing`,
      [hotelId, date, fallbackTotal]
    );
  }
}

async function bookHotelRooms(reservation) {
  if (reservation.item_type !== 'stay') return;
  if (reservation.stay_type && reservation.stay_type !== 'hotel') return;

  const checkIn = reservation.check_in_date
    ? reservation.check_in_date.toISOString?.().slice(0, 10) || reservation.check_in_date
    : null;
  const checkOut = reservation.check_out_date
    ? reservation.check_out_date.toISOString?.().slice(0, 10) || reservation.check_out_date
    : null;
  const rooms = Number(reservation.rooms_requested) || 1;

  if (!checkIn || !checkOut) return;

  const nights = eachNight(checkIn, checkOut);
  await ensureCalendarRows(reservation.item_id, nights);

  for (const night of nights) {
    const updated = await query(
      `update public.hotel_daily_availability
       set rooms_booked = rooms_booked + $3, updated_at = now()
       where hotel_id = $1 and stay_date = $2::date
         and closed = false
         and (rooms_total - rooms_booked) >= $3
       returning rooms_total, rooms_booked`,
      [reservation.item_id, night, rooms]
    );

    if (!updated.rows.length) {
      throw Object.assign(
        new Error(`Impossible de bloquer les chambres pour la nuit du ${night}.`),
        { status: 409 }
      );
    }
  }
}

async function releaseHotelRooms(reservation) {
  if (reservation.item_type !== 'stay') return;
  if (reservation.stay_type && reservation.stay_type !== 'hotel') return;

  const checkIn = reservation.check_in_date
    ? reservation.check_in_date.toISOString?.().slice(0, 10) || reservation.check_in_date
    : null;
  const checkOut = reservation.check_out_date
    ? reservation.check_out_date.toISOString?.().slice(0, 10) || reservation.check_out_date
    : null;
  const rooms = Number(reservation.rooms_requested) || 1;

  if (!checkIn || !checkOut) return;

  const nights = eachNight(checkIn, checkOut);
  for (const night of nights) {
    await query(
      `update public.hotel_daily_availability
       set rooms_booked = greatest(0, rooms_booked - $3), updated_at = now()
       where hotel_id = $1 and stay_date = $2::date`,
      [reservation.item_id, night, rooms]
    );
  }
}

async function upsertPartnerDays(hotelId, days) {
  for (const day of days) {
    const date = parseIsoDate(day.date);
    if (!date) continue;

    const roomsTotal = Math.max(0, Number(day.roomsTotal) || 0);
    const closed = Boolean(day.closed);
    const priceOverride =
      day.priceOverride != null && day.priceOverride !== ''
        ? Math.max(0, Number(day.priceOverride))
        : null;

    await query(
      `insert into public.hotel_daily_availability
         (hotel_id, stay_date, rooms_total, rooms_booked, closed, price_override, updated_at)
       values ($1, $2::date, $3, 0, $4, $5, now())
       on conflict (hotel_id, stay_date) do update set
         rooms_total = excluded.rooms_total,
         closed = excluded.closed,
         price_override = excluded.price_override,
         updated_at = now()`,
      [hotelId, date, roomsTotal, closed, priceOverride]
    );
  }
}

async function bulkSetPartnerRange(hotelId, fromDate, toDate, payload) {
  const from = parseIsoDate(fromDate);
  const to = parseIsoDate(toDate);
  if (!from || !to || to < from) {
    throw Object.assign(new Error('Plage de dates invalide.'), { status: 400 });
  }

  const days = [];
  let cur = from;
  while (cur <= to) {
    days.push({
      date: cur,
      roomsTotal: payload.roomsTotal,
      closed: payload.closed,
      priceOverride: payload.priceOverride,
    });
    cur = addDays(cur, 1);
  }

  await upsertPartnerDays(hotelId, days);
  return days.length;
}

async function getHotelRoomCount(hotelId, options = {}) {
  const hotel = await getHotelBase(hotelId, options);
  if (!hotel) return null;
  return Math.max(1, Number(hotel.rooms_available) || 0);
}

async function getRoomAvailabilityRange(hotelId, roomIndex, fromDate, toDate, options = {}) {
  const roomCount = await getHotelRoomCount(hotelId, options);
  if (!roomCount) return null;

  const index = Number(roomIndex);
  if (!Number.isInteger(index) || index < 1 || index > roomCount) {
    throw Object.assign(new Error('Numéro de chambre invalide.'), { status: 400 });
  }

  const aggregate = await getAvailabilityRange(hotelId, fromDate, toDate, options);
  if (!aggregate) return null;

  const roomRows = await query(
    `select stay_date, available
     from public.hotel_room_daily_availability
     where hotel_id = $1 and room_index = $2
       and stay_date >= $3::date and stay_date <= $4::date`,
    [hotelId, index, fromDate, toDate]
  );

  const roomByDate = new Map(
    roomRows.rows.map((r) => [formatPgDate(r.stay_date), r.available])
  );

  const days = aggregate.days.map((day) => {
    const booked = index <= (day.roomsBooked || 0);
    const hasRow = roomByDate.has(day.date);
    const defaultAvailable = !day.closed && index <= (day.roomsTotal || 0);
    const available = booked ? false : hasRow ? roomByDate.get(day.date) : defaultAvailable;

    return {
      date: day.date,
      available: Boolean(available),
      booked,
      closed: !available && !booked,
      price: day.price ?? aggregate.basePrice,
    };
  });

  return {
    hotelId,
    roomIndex: index,
    roomCount,
    roomLabel: `Chambre ${index}`,
    days,
  };
}

async function syncAggregateFromRooms(hotelId, dates) {
  if (!dates.length) return;

  const roomCount = await getHotelRoomCount(hotelId, { partner: true });
  if (!roomCount) return;

  const uniqueDates = [...new Set(dates.map(parseIsoDate).filter(Boolean))];

  for (const date of uniqueDates) {
    const explicit = await query(
      `select room_index, available
       from public.hotel_room_daily_availability
       where hotel_id = $1 and stay_date = $2::date`,
      [hotelId, date]
    );

    const explicitMap = new Map(
      explicit.rows.map((r) => [Number(r.room_index), Boolean(r.available)])
    );

    if (!explicitMap.size) continue;

    const aggregate = await getAvailabilityRange(hotelId, date, date, { partner: true });
    const day = aggregate?.days?.[0];
    const fallbackTotal = day?.roomsTotal ?? roomCount;
    const fallbackClosed = day?.closed ?? false;

    let roomsTotal = 0;
    for (let i = 1; i <= roomCount; i += 1) {
      const booked = i <= (day?.roomsBooked || 0);
      if (booked) {
        roomsTotal += 1;
        continue;
      }
      const defaultAvailable = !fallbackClosed && i <= fallbackTotal;
      const available = explicitMap.has(i) ? explicitMap.get(i) : defaultAvailable;
      if (available) roomsTotal += 1;
    }

    await query(
      `insert into public.hotel_daily_availability
         (hotel_id, stay_date, rooms_total, rooms_booked, closed, updated_at)
       values ($1, $2::date, $3, $4, false, now())
       on conflict (hotel_id, stay_date) do update set
         rooms_total = greatest(excluded.rooms_total, hotel_daily_availability.rooms_booked),
         closed = false,
         updated_at = now()`,
      [hotelId, date, roomsTotal, day?.roomsBooked || 0]
    );
  }
}

async function upsertRoomDays(hotelId, roomIndex, days) {
  const roomCount = await getHotelRoomCount(hotelId, { partner: true });
  if (!roomCount) {
    throw Object.assign(new Error('Hôtel introuvable.'), { status: 404 });
  }

  const index = Number(roomIndex);
  if (!Number.isInteger(index) || index < 1 || index > roomCount) {
    throw Object.assign(new Error('Numéro de chambre invalide.'), { status: 400 });
  }

  const touchedDates = [];

  for (const day of days) {
    const date = parseIsoDate(day.date);
    if (!date) continue;

    const aggregate = await getAvailabilityRange(hotelId, date, date, { partner: true });
    const aggDay = aggregate?.days?.[0];
    if (index <= (aggDay?.roomsBooked || 0)) continue;

    const available = Boolean(day.available);
    await query(
      `insert into public.hotel_room_daily_availability
         (hotel_id, room_index, stay_date, available, updated_at)
       values ($1, $2, $3::date, $4, now())
       on conflict (hotel_id, room_index, stay_date) do update set
         available = excluded.available,
         updated_at = now()`,
      [hotelId, index, date, available]
    );
    touchedDates.push(date);
  }

  await syncAggregateFromRooms(hotelId, touchedDates);
  return touchedDates.length;
}

async function bulkSetRoomRange(hotelId, roomIndex, fromDate, toDate, available) {
  const from = parseIsoDate(fromDate);
  const to = parseIsoDate(toDate);
  if (!from || !to || to < from) {
    throw Object.assign(new Error('Plage de dates invalide.'), { status: 400 });
  }

  const days = [];
  let cur = from;
  while (cur <= to) {
    days.push({ date: cur, available: Boolean(available) });
    cur = addDays(cur, 1);
  }

  return upsertRoomDays(hotelId, roomIndex, days);
}

module.exports = {
  parseIsoDate,
  addDays,
  eachNight,
  getAvailabilityRange,
  getRoomAvailabilityRange,
  checkStayAvailability,
  bookHotelRooms,
  releaseHotelRooms,
  upsertPartnerDays,
  bulkSetPartnerRange,
  upsertRoomDays,
  bulkSetRoomRange,
};
