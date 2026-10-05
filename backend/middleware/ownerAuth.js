const { query } = require('../config/db');
const { verifyToken } = require('../lib/jwt');

/**
 * Identité propriétaire lue uniquement depuis le JWT (jamais depuis le corps de la requête).
 * Le compte est relu en base à chaque requête : un compte désactivé perd l'accès immédiatement.
 */
async function authenticateOwner(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return res.status(401).json({ success: false, message: 'Authentification requise.' });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ success: false, message: 'Session expirée ou invalide.' });
  }
  if (payload.role !== 'owner' || !payload.sub) {
    return res.status(403).json({ success: false, message: 'Accès réservé aux propriétaires.' });
  }

  try {
    const result = await query(
      `select id, first_name, last_name, email, status from public.owners
       where id = $1 and deleted_at is null`,
      [payload.sub]
    );
    const owner = result.rows[0];
    if (!owner) return res.status(401).json({ success: false, message: 'Compte introuvable.' });
    if (owner.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Compte désactivé. Contactez Algeria Travel.' });
    }
    req.owner = owner;
    req.actor = { type: 'owner', id: owner.id, label: `${owner.first_name} ${owner.last_name}` };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticateOwner };
