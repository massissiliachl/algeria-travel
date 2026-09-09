const base = process.argv[2] || 'https://algeria-travel.onrender.com';

async function main() {
  for (const path of ['/api/live', '/api/health', '/api/chat/welcome?lang=en', '/api/tours']) {
    const r = await fetch(`${base}${path}`);
    const txt = await r.text();
    console.log(path, r.status, txt.slice(0, 120));
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
    console.log('bundle chat_error_backend', js.includes('chat_error_backend'));
    console.log('bundle api/chat', js.includes('/api/chat'));
  }
}

main().catch(console.error);
