function adminAuth(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return res.status(503).json({
      error: 'ADMIN_API_KEY non configuré dans backend/.env',
    });
  }

  const header = req.headers.authorization || '';
  const rawToken = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-admin-key'];
  const token = rawToken?.trim();

  if (!token || token !== adminKey.trim()) {
    return res.status(401).json({ error: 'Accès admin refusé.' });
  }

  next();
}

module.exports = { adminAuth };
