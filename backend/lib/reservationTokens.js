const crypto = require('crypto');

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateReferenceCode() {
  let code = 'AT-';
  for (let i = 0; i < 6; i += 1) {
    code += REF_CHARS[crypto.randomInt(REF_CHARS.length)];
  }
  return code;
}

function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashAccessToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateReferenceCode, generateAccessToken, hashAccessToken };
