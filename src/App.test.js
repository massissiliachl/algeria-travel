import { countNights } from './utils/hotelAvailability';

test('sanity: le moteur de réservation hôtel calcule les nuits', () => {
  expect(countNights('2026-08-01', '2026-08-03')).toBe(2);
});
