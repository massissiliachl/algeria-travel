/** Prépare la page : cookies + langue FR pour des tests stables */
export async function preparePage(page) {
  await page.addInitScript(() => {
    localStorage.setItem('at_cookie_consent', 'essential');
    localStorage.setItem('language', 'fr');
    localStorage.setItem('theme', 'light');
  });
}

/** Visite une URL et vérifie qu’elle charge sans erreur critique */
export async function visitAndAssert(page, { path, name, expectSelector, timeout = 15000 }) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout });

  if (response && response.status() >= 400) {
    throw new Error(`[${name}] ${path} → HTTP ${response.status()}`);
  }

  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForSelector(expectSelector, { timeout, state: 'visible' });

  const title = await page.title();
  if (!title || title.trim().length < 3) {
    throw new Error(`[${name}] Titre de page vide sur ${path}`);
  }

  if (errors.length) {
    throw new Error(`[${name}] Erreur JS : ${errors[0]}`);
  }

  return { title };
}
