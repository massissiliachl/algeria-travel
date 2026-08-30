import { resolveApiBase } from './utils/apiBase';

const API_BASE = resolveApiBase();

function getToken() {
  return sessionStorage.getItem('partner_token') || '';
}

export function setPartnerToken(token) {
  sessionStorage.setItem('partner_token', token);
}

export function clearPartnerToken() {
  sessionStorage.removeItem('partner_token');
  sessionStorage.removeItem('partner_hotel');
}

export function isLoggedIn() {
  return Boolean(getToken());
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur (${res.status})`);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/partner/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/api/partner/auth/me'),

  getHotel: () => request('/api/partner/hotel'),

  updateHotel: (payload) =>
    request('/api/partner/hotel', { method: 'PUT', body: JSON.stringify(payload) }),

  getAvailability: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/partner/availability${qs ? `?${qs}` : ''}`);
  },

  getRoomAvailability: (roomIndex, params = {}) => {
    const qs = new URLSearchParams({ ...params, room: String(roomIndex) }).toString();
    return request(`/api/partner/availability?${qs}`);
  },

  updateAvailability: (payload) =>
    request('/api/partner/availability', { method: 'PUT', body: JSON.stringify(payload) }),

  updateRoomAvailability: (roomIndex, payload) =>
    request('/api/partner/availability', {
      method: 'PUT',
      body: JSON.stringify({ ...payload, roomIndex }),
    }),

  listMedia: () => request('/api/partner/media'),

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/partner/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erreur upload (${res.status})`);
    return data;
  },

  getNotifications: () => request('/api/partner/notifications'),

  markNotificationRead: (id) =>
    request(`/api/partner/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request('/api/partner/notifications/read-all', { method: 'PATCH' }),

  getReservations: () => request('/api/partner/reservations'),
};
