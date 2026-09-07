/**
 * Migration SQL au build Render — ignore si DATABASE_URL absent (preview, CI).
 */
require('dotenv').config();
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

if (!process.env.DATABASE_URL) {
  console.warn('[render-migrate] DATABASE_URL absent — migration ignorée au build.');
  process.exit(0);
}

require('../backend/scripts/migrate.js');
