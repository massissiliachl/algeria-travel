const { verifyToken } = require('../lib/jwt');

function partnerAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-partner-token'];

    if (!token) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }

    const payload = verifyToken(token);
    if (payload.role !== 'hotel_partner' || !payload.hotelId) {
      return res.status(403).json({ error: 'Accès partenaire refusé.' });
    }

    req.partner = {
      userId: payload.sub,
      hotelId: payload.hotelId,
      email: payload.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expirée ou invalide.' });
  }
}

module.exports = { partnerAuth };
