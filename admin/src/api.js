const API_BASE = import.meta.env.VITE_API_URL || '';

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
  const headers = {
    'Content-Type': 'application/json',
    'x-admin-key': getKey(),
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
  verifyKey: (key) =>
    request('/api/admin/auth/verify', { method: 'POST', body: JSON.stringify({ key }) }),

  getStats: () => request('/api/admin/stats'),

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

    const res = await fetch(`${API_BASE}/api/admin/media/upload`, {
      method: 'POST',
      headers: { 'x-admin-key': getKey() },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erreur upload (${res.status})`);
    return data;
  },
};
