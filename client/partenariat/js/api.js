/**
 * Accès à l'API. Deux modes :
 *  - propriétaire : jeton JWT (localStorage), routes /owner/*
 *  - administrateur : ?admin=1 + clé admin de la session /admin/, routes /admin/accommodation/*
 */
const TOKEN_KEY = 'at_owner_token';
const OWNER_KEY = 'at_owner_profile';

export const ADMIN_MODE = new URLSearchParams(location.search).get('admin') === '1';
const BASE = ADMIN_MODE ? '/admin/accommodation' : '/owner';

export const session = {
  get token() {
    return localStorage.getItem(TOKEN_KEY) || '';
  },
  get owner() {
    try {
      return JSON.parse(localStorage.getItem(OWNER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save(token, owner) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
  },
  setOwner(owner) {
    localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(OWNER_KEY);
  },
  get loggedIn() {
    return ADMIN_MODE ? Boolean(window.AT_API.adminKey()) : Boolean(this.token);
  },
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function raw(path, { method = 'GET', body, timeout = 70000 } = {}) {
  let res;
  try {
    res = await window.AT_API.request(path, {
      method,
      body,
      timeout,
      admin: ADMIN_MODE,
      token: ADMIN_MODE ? '' : session.token,
    });
  } catch (err) {
    throw new ApiError(0, err.name === 'AbortError' ? 'Le serveur met trop de temps à répondre. Réessayez.' : 'Serveur injoignable. Vérifiez votre connexion.');
  }
  const data = res.data || {};
  if (res.status === 401 && path !== '/owner/login') {
    onUnauthorized();
    throw new ApiError(401, data.message || data.error || 'Session expirée.');
  }
  if (!res.ok || data.success === false) {
    throw new ApiError(res.status, data.message || data.error || `Erreur ${res.status}`);
  }
  return data;
}

/** Appel sur les routes de gestion (owner ou admin selon le mode). Renvoie { data, pagination }. */
export const api = {
  get: (path) => raw(BASE + path),
  post: (path, body) => raw(BASE + path, { method: 'POST', body }),
  put: (path, body) => raw(BASE + path, { method: 'PUT', body }),
  patch: (path, body) => raw(BASE + path, { method: 'PATCH', body }),
  del: (path) => raw(BASE + path, { method: 'DELETE' }),
  raw,
};

export async function login(email, password) {
  const res = await raw('/owner/login', { method: 'POST', body: { email, password } });
  session.save(res.data.token, res.data.owner);
  return res.data.owner;
}

export async function listOwners() {
  if (!ADMIN_MODE) return [];
  const res = await raw('/admin/owners?limit=100&sort=name&order=asc');
  return res.data;
}

/** Upload d'une photo vers IONOS (api/upload.php). Redimensionnée à 1600 px max avant l'envoi. */
export async function uploadImage(file) {
  const dataUrl = await resizeImage(file, 1600, 0.82);
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_MODE) headers['X-Admin-Pass'] = window.AT_API.adminKey();
  else headers['X-Owner-Token'] = session.token;
  let res;
  try {
    res = await fetch(new URL('../api/upload.php', location.href), { method: 'POST', headers, body: JSON.stringify({ data: dataUrl }) });
  } catch {
    throw new ApiError(0, 'Envoi impossible (serveur photos injoignable). Collez plutôt l’adresse de la photo.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new ApiError(res.status, res.status === 404 ? 'Envoi des photos indisponible ici (il fonctionne sur le site en ligne). Collez l’adresse de la photo.' : 'Envoi de la photo refusé.');
  }
  return data.url;
}

function resizeImage(file, max, quality) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) return reject(new ApiError(400, 'Ce fichier n’est pas une image.'));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ApiError(400, 'Image illisible.'));
    };
    img.src = url;
  });
}
