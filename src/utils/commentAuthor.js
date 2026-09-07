import { getFavoriteClientId } from './favoriteClientId';

const AUTHOR_KEY = 'at_comment_author';

const PREFIXES = ['Voyageur', 'Explorateur', 'Visiteur', 'Nomade', 'Randonneur'];

/** Nom d'affichage stable, généré une fois par navigateur. */
export function getAutoCommentAuthorName() {
  try {
    const saved = localStorage.getItem(AUTHOR_KEY)?.trim();
    if (saved && saved.length >= 2) return saved;
  } catch {
    /* ignore */
  }

  const clientId = getFavoriteClientId();
  const hex = clientId.replace(/-/g, '');
  const idx = parseInt(hex.slice(0, 6), 16) % PREFIXES.length;
  const code = hex.slice(0, 4).toUpperCase();
  const name = `${PREFIXES[idx]} ${code}`;

  try {
    localStorage.setItem(AUTHOR_KEY, name);
  } catch {
    /* ignore */
  }

  return name;
}
