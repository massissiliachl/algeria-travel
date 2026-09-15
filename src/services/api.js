import { resolveApiBase } from '../utils/apiBase';
import { getFavoriteClientId } from '../utils/favoriteClientId';
import { getInboxClientId } from '../utils/inboxClientId';

async function request(path, options = {}) {
  const { headers: optionHeaders, expectStatuses = [], timeoutMs = 12_000, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${resolveApiBase()}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...optionHeaders,
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('API timeout — vérifiez que le backend tourne (cd backend && npm start).');
    }
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('API backend indisponible. Lancez le serveur : cd backend && npm start');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const raw = await res.text();
  let data = {};
  if (raw) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      const err = new Error('API indisponible (site statique sans backend Node).');
      err.status = res.status;
      throw err;
    }
    try {
      data = JSON.parse(raw);
    } catch {
      const err = new Error(`Réponse API invalide (${res.status}).`);
      err.status = res.status;
      throw err;
    }
  }

  if (!res.ok) {
    if (expectStatuses.includes(res.status)) {
      const err = new Error(data.error || `Erreur API (${res.status})`);
      err.status = res.status;
      throw err;
    }
    const err = new Error(data.error || `Erreur API (${res.status})`);
    err.status = res.status;
    throw err;
  }

  if (path.startsWith('/api/chat') && (!data.reply || !String(data.reply).trim())) {
    const err = new Error('API chat indisponible (réponse vide).');
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  getTours: () => request('/api/tours'),
  getTour: (id) => request(`/api/tours/${id}`),
  getPlaces: () => request('/api/places'),
  getPlace: (id) => request(`/api/places/${id}`),
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
  getGallery: () =>
    request('/api/gallery', {
      headers: { 'x-favorite-client': getFavoriteClientId() },
    }),
  setGalleryReaction: (itemId, reaction) =>
    request(`/api/gallery/${itemId}/reaction`, {
      method: 'POST',
      headers: { 'x-favorite-client': getFavoriteClientId() },
      body: JSON.stringify({ reaction }),
    }),
  getComments: (itemType, itemId) => {
    const qs = new URLSearchParams({
      item_type: itemType,
      item_id: String(itemId),
    }).toString();
    return request(`/api/comments?${qs}`, {
      headers: { 'x-favorite-client': getFavoriteClientId() },
    });
  },
  postComment: ({ itemType, itemId, body, authorName, parentId }) =>
    request('/api/comments', {
      method: 'POST',
      headers: { 'x-favorite-client': getFavoriteClientId() },
      body: JSON.stringify({
        item_type: itemType,
        item_id: String(itemId),
        body,
        author_name: authorName,
        parent_id: parentId || null,
      }),
    }),
  likeComment: (commentId) =>
    request(`/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: { 'x-favorite-client': getFavoriteClientId() },
    }),
  getStays: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/stays${qs ? `?${qs}` : ''}`);
  },
  getStay: (id) => request(`/api/stays/${id}`),
  getHotels: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/hotels${qs ? `?${qs}` : ''}`);
  },
  getHotel: (id) => request(`/api/hotels/${id}`),
  getHotelAvailability: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/hotels/${id}/availability${qs ? `?${qs}` : ''}`);
  },
  checkHotelAvailability: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/hotels/${id}/availability/check?${qs}`);
  },
  sendContact: (payload) =>
    request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
  getChatWelcome: (lang) => request(`/api/chat/welcome?lang=${encodeURIComponent(lang)}`, { timeoutMs: 45_000 }),
  sendChatMessage: ({ message, lang, history, session }) =>
    request('/api/chat', {
      method: 'POST',
      timeoutMs: 45_000,
      body: JSON.stringify({ message, lang, history, session }),
    }),
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
  getFavorites: () =>
    request('/api/favorites', {
      headers: { 'x-favorite-client': getFavoriteClientId() },
    }),
  addFavorite: (itemType, itemId) =>
    request('/api/favorites', {
      method: 'POST',
      headers: { 'x-favorite-client': getFavoriteClientId() },
      body: JSON.stringify({ item_type: itemType, item_id: String(itemId) }),
    }),
  removeFavorite: (itemType, itemId) =>
    request(`/api/favorites/${encodeURIComponent(itemType)}/${encodeURIComponent(String(itemId))}`, {
      method: 'DELETE',
      headers: { 'x-favorite-client': getFavoriteClientId() },
    }),
  getInbox: () =>
    request('/api/inbox', {
      headers: { 'x-inbox-client': getInboxClientId() },
    }),
  markInboxRead: () =>
    request('/api/inbox/read', {
      method: 'POST',
      headers: { 'x-inbox-client': getInboxClientId() },
    }),
  sendInboxMessage: ({ body, name, email }) =>
    request('/api/inbox/messages', {
      method: 'POST',
      headers: { 'x-inbox-client': getInboxClientId() },
      body: JSON.stringify({ body, name, email }),
    }),
};
