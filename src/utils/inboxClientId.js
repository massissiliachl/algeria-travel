const STORAGE_KEY = 'at_inbox_client_id';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createClientId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getInboxClientId() {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(STORAGE_KEY);
  if (id && UUID_RE.test(id)) return id;

  id = createClientId();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
