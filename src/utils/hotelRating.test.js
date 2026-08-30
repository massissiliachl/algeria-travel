import { getRatingLabel, getReviewDistribution } from './hotelRating';

const t = (key) => key;

describe('getRatingLabel', () => {
  it('choisit le bon libellé selon la note', () => {
    expect(getRatingLabel(4.8, t)).toBe('hotels_rating_exceptional');
    expect(getRatingLabel(4.2, t)).toBe('hotels_rating_very_good');
    expect(getRatingLabel(3.6, t)).toBe('hotels_rating_good');
    expect(getRatingLabel(3.1, t)).toBe('hotels_rating_pleasant');
    expect(getRatingLabel(2.5, t)).toBe('hotels_rating_fair');
  });
});

describe('getReviewDistribution', () => {
  it('retourne 5 barres de distribution', () => {
    const bars = getReviewDistribution(4.6);
    expect(bars).toHaveLength(5);
    expect(bars.map((b) => b.star)).toEqual([5, 4, 3, 2, 1]);
  });

  it('met le pic sur la note arrondie', () => {
    const bars = getReviewDistribution(4.6);
    const peak = bars.find((b) => b.star === 5);
    expect(peak.pct).toBeGreaterThan(bars.find((b) => b.star === 2).pct);
  });
});
