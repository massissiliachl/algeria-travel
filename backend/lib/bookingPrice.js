function calcBookingTotal(unitPrice, travelers, pricePerPerson) {
  const unit = Number(unitPrice);
  const count = Number(travelers);
  if (!Number.isFinite(unit) || unit < 0) return null;
  if (!Number.isInteger(count) || count < 1) return null;
  return pricePerPerson ? Math.round(unit * count) : Math.round(unit);
}

module.exports = { calcBookingTotal };
