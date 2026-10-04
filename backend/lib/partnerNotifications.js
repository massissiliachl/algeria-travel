const { query } = require('../config/db');

function mapReservation(row) {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    itemType: row.item_type,
    itemId: row.item_id,
    itemName: row.item_name,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    travelDate: row.travel_date,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    roomsRequested: row.rooms_requested,
    travelers: row.travelers,
    stayType: row.stay_type,
    message: row.message,
    priceEstimate: row.price_estimate,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapNotification(row) {
  return {
    id: row.notification_id,
    readAt: row.read_at,
    createdAt: row.notification_created_at,
    reservation: mapReservation(row),
  };
}

async function createPartnerNotification(hotelId, reservationId) {
  await query(
    `insert into public.partner_notifications (hotel_id, reservation_id)
     values ($1, $2)
     on conflict (hotel_id, reservation_id) do nothing`,
    [hotelId, reservationId]
  );
}

async function listPartnerNotifications(hotelId, { unreadOnly = false } = {}) {
  const params = [hotelId];
  let sql = `
    select
      pn.id as notification_id,
      pn.read_at,
      pn.created_at as notification_created_at,
      r.*
    from public.partner_notifications pn
    join public.reservations r on r.id = pn.reservation_id
    where pn.hotel_id = $1`;

  if (unreadOnly) {
    sql += ' and pn.read_at is null';
  }

  sql += ' order by pn.created_at desc limit 50';

  const result = await query(sql, params);
  return result.rows.map(mapNotification);
}

async function countUnreadPartnerNotifications(hotelId) {
  const result = await query(
    `select count(*)::int as c
     from public.partner_notifications
     where hotel_id = $1 and read_at is null`,
    [hotelId]
  );
  return result.rows[0]?.c || 0;
}

async function markPartnerNotificationRead(hotelId, notificationId) {
  const result = await query(
    `update public.partner_notifications
     set read_at = now()
     where id = $1 and hotel_id = $2 and read_at is null
     returning id`,
    [notificationId, hotelId]
  );
  return result.rows.length > 0;
}

async function markAllPartnerNotificationsRead(hotelId) {
  await query(
    `update public.partner_notifications
     set read_at = now()
     where hotel_id = $1 and read_at is null`,
    [hotelId]
  );
}

module.exports = {
  createPartnerNotification,
  listPartnerNotifications,
  countUnreadPartnerNotifications,
  markPartnerNotificationRead,
  markAllPartnerNotificationsRead,
  mapReservation,
};
