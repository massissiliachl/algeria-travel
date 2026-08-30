/** Libellés de note style Booking */

export function getRatingLabel(rating, t) {
  const r = Number(rating) || 0;
  if (r >= 4.5) return t('hotels_rating_exceptional');
  if (r >= 4.0) return t('hotels_rating_very_good');
  if (r >= 3.5) return t('hotels_rating_good');
  if (r >= 3.0) return t('hotels_rating_pleasant');
  return t('hotels_rating_fair');
}

export function getReviewDistribution(rating) {
  const r = Math.min(5, Math.max(1, Number(rating) || 4));
  const peak = Math.round(r);
  return [5, 4, 3, 2, 1].map((star) => {
    const dist = Math.abs(star - peak);
    let pct = dist === 0 ? 52 : dist === 1 ? 24 : dist === 2 ? 12 : 4;
    if (star === 5 && r >= 4.5) pct = 58;
    return { star, pct };
  });
}
