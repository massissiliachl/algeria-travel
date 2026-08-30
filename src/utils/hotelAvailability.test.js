import {
  buildFallbackAvailability,
  calcStayTotal,
  countNights,
  isRangeAvailable,
} from './hotelAvailability';

describe('countNights', () => {
  it('compte les nuits entre check-in et check-out', () => {
    expect(countNights('2026-08-01', '2026-08-04')).toBe(3);
  });

  it('retourne 0 si dates invalides', () => {
    expect(countNights('', '2026-08-04')).toBe(0);
    expect(countNights('2026-08-04', '2026-08-04')).toBe(0);
    expect(countNights('2026-08-05', '2026-08-04')).toBe(0);
  });
});

describe('buildFallbackAvailability', () => {
  it('génère un jour par date dans la plage', () => {
    const hotel = { id: 'h1', price: 10000, roomsAvailable: 5, availability: 'available' };
    const { days } = buildFallbackAvailability(hotel, '2026-08-01', '2026-08-03');
    expect(days).toHaveLength(3);
    expect(days[0].roomsLeft).toBe(5);
    expect(days[0].price).toBe(10000);
  });

  it('marque tout complet si hôtel indisponible', () => {
    const hotel = { id: 'h1', price: 10000, roomsAvailable: 5, availability: 'unavailable' };
    const { days } = buildFallbackAvailability(hotel, '2026-08-01', '2026-08-02');
    expect(days.every((d) => d.roomsLeft === 0)).toBe(true);
  });
});

describe('calcStayTotal', () => {
  const days = [
    { date: '2026-08-01', price: 10000, roomsLeft: 2, closed: false },
    { date: '2026-08-02', price: 12000, roomsLeft: 2, closed: false },
    { date: '2026-08-03', price: 12000, roomsLeft: 0, closed: false },
  ];

  it('calcule le total pour un séjour disponible', () => {
    expect(calcStayTotal(days, '2026-08-01', '2026-08-03', 1)).toBe(22000);
  });

  it('multiplie par le nombre de chambres', () => {
    expect(calcStayTotal(days, '2026-08-01', '2026-08-03', 2)).toBe(44000);
  });

  it('retourne null si une nuit est complète', () => {
    expect(calcStayTotal(days, '2026-08-02', '2026-08-04', 1)).toBeNull();
  });
});

describe('isRangeAvailable', () => {
  const days = [{ date: '2026-08-01', price: 5000, roomsLeft: 1, closed: false }];

  it('reflete calcStayTotal', () => {
    expect(isRangeAvailable(days, '2026-08-01', '2026-08-02', 1)).toBe(true);
    expect(isRangeAvailable(days, '2026-08-01', '2026-08-02', 2)).toBe(false);
  });
});
