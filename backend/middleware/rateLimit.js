function createRateLimiter({ windowMs = 60 * 60 * 1000, max = 5, message }) {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now - entry.start > windowMs) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 };
    }

    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({
        error: message || 'Trop de tentatives. Réessayez plus tard.',
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
