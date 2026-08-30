const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calcBookingTotal } = require('./bookingPrice');

describe('calcBookingTotal', () => {
  it('prix fixe sans multiplication voyageurs', () => {
    assert.equal(calcBookingTotal(15000, 3, false), 15000);
  });

  it('prix par personne', () => {
    assert.equal(calcBookingTotal(5000, 4, true), 20000);
  });

  it('rejette les entrées invalides', () => {
    assert.equal(calcBookingTotal(-1, 2, false), null);
    assert.equal(calcBookingTotal(1000, 0, false), null);
    assert.equal(calcBookingTotal('abc', 2, false), null);
  });
});
