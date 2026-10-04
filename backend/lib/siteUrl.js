function normalizeUrl(url) {
  if (!url) return '';
  return String(url).replace(/\/$/, '');
}

function resolveSiteUrl() {
  return (
    normalizeUrl(process.env.SITE_URL) ||
    normalizeUrl(process.env.FRONTEND_URL) ||
    normalizeUrl(process.env.RENDER_EXTERNAL_URL) ||
    'http://localhost:3000'
  );
}

function resolveFrontendUrl() {
  return normalizeUrl(process.env.FRONTEND_URL) || resolveSiteUrl();
}

function resolveAdminUrl() {
  const explicit = normalizeUrl(process.env.ADMIN_URL);
  if (explicit) return explicit;

  const renderUrl = normalizeUrl(process.env.RENDER_EXTERNAL_URL);
  if (renderUrl) return `${renderUrl}/admin`;

  return 'http://localhost:5173';
}

module.exports = { resolveSiteUrl, resolveFrontendUrl, resolveAdminUrl };
