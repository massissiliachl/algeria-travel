const base = (process.argv[2] || 'https://algeria-travel.onrender.com').replace(/\/$/, '');

async function main() {
  console.log('Probe', base, '\n');

  let apiOk = false;
  for (const path of ['/api/live', '/api/health', '/api/chat/welcome?lang=en', '/api/tours']) {
    const r = await fetch(`${base}${path}`);
    const txt = await r.text();
    console.log(path, r.status, r.headers.get('content-type'), txt.slice(0, 120));
    if (path === '/api/live' && r.ok) apiOk = true;
  }

  const post = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Bonjour', lang: 'en', history: [], session: {} }),
  });
  const postTxt = await post.text();
  console.log('POST /api/chat', post.status, post.headers.get('content-type'), postTxt.slice(0, 200));

  const home = await fetch(`${base}/`);
  const html = await home.text();
  const m = html.match(/src="(\/static\/js\/[^"]+)"/);
  if (m) {
    const js = await (await fetch(`${base}${m[1]}`)).text();
    console.log('\nBundle', m[1]);
    console.log('  chatOffline fallback', js.includes('getOfflineReply') || js.includes('chatOffline'));
    console.log('  /api/live check', js.includes('/api/live'));
  }

  console.log('\n--- Diagnostic ---');
  if (!apiOk) {
    console.log('ERREUR: le backend Node ne répond pas (/api/live → 404).');
    console.log('Cause probable: service Render configuré en "Static Site" au lieu de "Web Service".');
    console.log('Correctif Render Dashboard:');
    console.log('  1. Type = Web Service (Node), PAS Static Site');
    console.log('  2. Build Command = npm install && npm run build:render && npm run migrate:render');
    console.log('  3. Start Command = npm start');
    console.log('  4. Publish Directory = VIDE (ne pas mettre "build")');
    console.log('  5. Health Check Path = /api/live');
  } else {
    console.log('OK: backend Node actif.');
  }
}

main().catch(console.error);
