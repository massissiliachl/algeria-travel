import { resolveApiBase } from './utils/apiBase';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function getKey() {
  return sessionStorage.getItem('admin_key') || '';
}

export function setAdminKey(key) {
  sessionStorage.setItem('admin_key', key);
}

export function clearAdminKey() {
  sessionStorage.removeItem('admin_key');
}

export function isLoggedIn() {
  return Boolean(getKey());
}

async function request(path, options = {}) {
  const { headers: optionHeaders, ...rest } = options;
  let res;
  try {
    res = await fetch(`${resolveApiBase()}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': getKey(),
        ...optionHeaders,
      },
    });
  } catch {
    throw new Error(
      'Backend injoignable — lancez le backend (cd backend && npm run dev) ou npm run dev:local à la racine.'
    );
  }
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    unauthorizedHandler?.();
    throw new Error(data.error || 'Accès admin refusé — vérifiez ADMIN_API_KEY dans backend/.env');
  }

  if (!res.ok) {
    throw new Error(data.error || `Erreur (${res.status})`);
  }

  return data;
}

export async function verifyKey(key) {
  const trimmed = String(key || '').trim();
  const res = await fetch(`${resolveApiBase()}/api/admin/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': trimmed,
    },
    body: JSON.stringify({ key: trimmed }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Clé admin incorrecte.');
  }
  return data;
}

export const api = {
  verifyKey,

  getStats: () => request('/api/admin/stats'),

  getFavoriteStats: () => request('/api/admin/favorites/stats'),

  getCommentStats: () => request('/api/admin/comments/stats'),

  getComments: (status = 'pending') =>
    request(`/api/admin/comments?status=${encodeURIComponent(status)}`),

  moderateComment: (id, payload) =>
    request(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteComment: (id) =>
    request(`/api/admin/comments/${id}`, { method: 'DELETE' }),

  getReservations: (status = 'all') =>
    request(`/api/admin/reservations${status !== 'all' ? `?status=${status}` : ''}`),

  updateReservation: (id, payload) =>
    request(`/api/admin/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  list: (resource) => request(`/api/admin/${resource}`),
  get: (resource, id) => request(`/api/admin/${resource}/${id}`),
  create: (resource, payload) =>
    request(`/api/admin/${resource}`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (resource, id, payload) =>
    request(`/api/admin/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (resource, id) =>
    request(`/api/admin/${resource}/${id}`, { method: 'DELETE' }),

  listMedia: () => request('/api/admin/media'),

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${resolveApiBase()}/api/admin/media/upload`, {
      method: 'POST',
      headers: { 'x-admin-key': getKey() },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (res.status === 401) unauthorizedHandler?.();
    if (!res.ok) throw new Error(data.error || `Erreur upload (${res.status})`);
    return data;
  },

  listHotelUsers: () => request('/api/admin/hotel-users'),

  getHotelUserByHotel: (hotelId) => request(`/api/admin/hotel-users/by-hotel/${hotelId}`),

  createHotelUser: (payload) =>
    request('/api/admin/hotel-users', { method: 'POST', body: JSON.stringify(payload) }),

  updateHotelUser: (id, payload) =>
    request(`/api/admin/hotel-users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteHotelUser: (id) =>
    request(`/api/admin/hotel-users/${id}`, { method: 'DELETE' }),

  getHotelAvailability: (hotelId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/hotels/${hotelId}/availability${qs ? `?${qs}` : ''}`);
  },

  getHotelRoomAvailability: (hotelId, roomIndex, params = {}) => {
    const qs = new URLSearchParams({ ...params, room: String(roomIndex) }).toString();
    return request(`/api/admin/hotels/${hotelId}/availability?${qs}`);
  },

  updateHotelAvailability: (hotelId, payload) =>
    request(`/api/admin/hotels/${hotelId}/availability`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateHotelRoomAvailability: (hotelId, roomIndex, payload) =>
    request(`/api/admin/hotels/${hotelId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ ...payload, roomIndex }),
    }),

  getContactMessageStats: () => request('/api/admin/contact-messages/stats'),

  getContactMessages: (status = 'all') =>
    request(`/api/admin/contact-messages?status=${encodeURIComponent(status)}`),

  getContactMessage: (id) => request(`/api/admin/contact-messages/${id}`),

  updateContactMessage: (id, payload) =>
    request(`/api/admin/contact-messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteContactMessage: (id) =>
    request(`/api/admin/contact-messages/${id}`, { method: 'DELETE' }),

  getInboxStats: () => request('/api/admin/inbox/stats'),

  getInboxConversations: (status = 'open') =>
    request(`/api/admin/inbox?status=${encodeURIComponent(status)}`),

  getInboxConversation: (id) => request(`/api/admin/inbox/${id}`),

  sendInboxReply: (id, body) =>
    request(`/api/admin/inbox/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  updateInboxConversation: (id, payload) =>
    request(`/api/admin/inbox/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
