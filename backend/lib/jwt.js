const jwt = require('jsonwebtoken');

const DEFAULT_EXPIRY = '30d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-jwt-secret-algeria-travel';
  }
  throw new Error('JWT_SECRET non configuré');
}

function signPartnerToken(payload) {
  return jwt.sign({ ...payload, role: 'hotel_partner' }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRY,
  });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { signPartnerToken, verifyToken };
