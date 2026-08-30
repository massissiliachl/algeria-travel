const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseIsoDate, addDays, eachNight } = require('./hotelAvailability');

describe('parseIsoDate', () => {
  it('accepte YYYY-MM-DD', () => {
    assert.equal(parseIsoDate('2026-08-15'), '2026-08-15');
  });

  it('rejette les formats invalides', () => {
    assert.equal(parseIsoDate('15/08/2026'), null);
    assert.equal(parseIsoDate(''), null);
    assert.equal(parseIsoDate(null), null);
  });
});

describe('addDays', () => {
  it('ajoute des jours en UTC stable', () => {
    assert.equal(addDays('2026-08-30', 2), '2026-09-01');
  });
});

describe('eachNight', () => {
  it('liste chaque nuit sans inclure le check-out', () => {
    assert.deepEqual(eachNight('2026-08-01', '2026-08-04'), [
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ]);
  });

  it('retourne un tableau vide si dates égales', () => {
    assert.deepEqual(eachNight('2026-08-01', '2026-08-01'), []);
  });
});
