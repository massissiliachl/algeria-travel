/**
 * Diagnostic rapide API — node scripts/test-site-api.js [baseUrl]
 * Défaut : http://localhost:5000
 */
const base = (process.argv[2] || 'http://localhost:5000').replace(/\/$/, '');

const checks = [
  { method: 'GET', path: '/api/live', expect: 200 },
  { method: 'GET', path: '/api/health', expect: 200 },
  { method: 'GET', path: '/api/hotels', expect: 200 },
  { method: 'GET', path: '/api/places/taghit', expect: 200 },
  { method: 'GET', path: '/api/notifications/feed', expect: 200 },
  { method: 'GET', path: '/api/comments?item_type=place&item_id=taghit', expect: 200 },
];

async function run() {
  console.log(`[test-site-api] Base: ${base}\n`);
  let failed = 0;

  for (const check of checks) {
    const url = `${base}${check.path}`;
    try {
      const res = await fetch(url, { method: check.method });
      const ok = res.status === check.expect;
      const mark = ok ? 'OK' : 'FAIL';
      if (!ok) failed += 1;
      console.log(`${mark} ${check.method} ${check.path} → ${res.status}`);
      if (!ok) {
        const text = await res.text();
        console.log(`     ${text.slice(0, 120)}`);
      }
    } catch (err) {
      failed += 1;
      console.log(`FAIL ${check.method} ${check.path} → ${err.message}`);
    }
  }

  console.log('\n[test-site-api] Réservation Taghit (sans honeypot)…');
  try {
    const res = await fetch(`${base}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_type: 'place',
        item_id: 'taghit',
        item_name: 'Taghit',
        name: 'Test diagnostic',
        email: `diag-${Date.now()}@test.local`,
        phone: '0555123456',
        travel_date: '2026-11-01',
        travelers: 2,
        stay_type: 'hotel',
        unit_price: 75000,
        price_per_person: true,
        price_estimate: 150000,
        payment_method: 'pre_request',
        gdpr_consent: true,
        _hp: '',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.referenceCode) {
      console.log(`OK POST /api/reservations → ${data.referenceCode}`);
    } else {
      failed += 1;
      console.log(`FAIL POST /api/reservations → ${res.status}`, data);
    }
  } catch (err) {
    failed += 1;
    console.log(`FAIL POST /api/reservations → ${err.message}`);
  }

  console.log(failed ? `\n${failed} test(s) en échec.` : '\nTous les tests OK.');
  process.exit(failed ? 1 : 0);
}

run();
