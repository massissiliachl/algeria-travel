const API_BASE = process.env.REACT_APP_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur API (${res.status})`);
  }

  return data;
}

export const api = {
  getTours: () => request('/api/tours'),
  getTour: (id) => request(`/api/tours/${id}`),
  getActivities: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/activities${qs ? `?${qs}` : ''}`);
  },
  getActivity: (id) => request(`/api/activities/${id}`),
  getBlogPosts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/blog${qs ? `?${qs}` : ''}`);
  },
  getBlogPost: (slug) => request(`/api/blog/${slug}`),
  getGallery: () => request('/api/gallery'),
  getStays: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/stays${qs ? `?${qs}` : ''}`);
  },
  getStay: (id) => request(`/api/stays/${id}`),
  sendContact: (payload) =>
    request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
  createReservation: (payload) =>
    request('/api/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  trackReservation: (ref, token) =>
    request(`/api/reservations/track?ref=${encodeURIComponent(ref)}&token=${encodeURIComponent(token)}`),
  getNotificationFeed: (since) => {
    const qs = since ? `?since=${encodeURIComponent(since)}` : '';
    return request(`/api/notifications/feed${qs}`);
  },
  getNotificationVapidKey: () => request('/api/notifications/vapid-public-key'),
  subscribeFcmToken: (token, lang, userAgent) =>
    request('/api/notifications/subscribe-fcm', {
      method: 'POST',
      body: JSON.stringify({ token, lang, userAgent }),
    }),
  subscribeNotifications: (subscription, lang) =>
    request('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription, lang }),
    }),
};
