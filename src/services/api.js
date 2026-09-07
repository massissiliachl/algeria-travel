import { resolveApiBase } from '../utils/apiBase';
import { getFavoriteClientId } from '../utils/favoriteClientId';

async function request(path, options = {}) {
  const { headers: optionHeaders, expectStatuses = [], ...rest } = options;
  const res = await fetch(`${resolveApiBase()}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...optionHeaders,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (expectStatuses.includes(res.status)) {
      const err = new Error(data.error || `Erreur API (${res.status})`);
      err.status = res.status;
      throw err;
    }
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
};
