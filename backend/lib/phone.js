function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidPhone(value) {
  const digits = normalizePhone(value);
  return digits.length >= 8 && digits.length <= 15;
}

module.exports = { normalizePhone, isValidPhone };
