require('dotenv').config();
const { testConnection, closePool } = require('../config/db');

testConnection()
  .then((db) => {
    console.log('Connexion OK');
    console.log(`  Base     : ${db.database}`);
    console.log(`  Heure    : ${db.server_time}`);
    console.log(`  Version  : ${db.version.split(',')[0]}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connexion échouée');
    console.error(`  ${err.message}`);
    console.error('\nVérifiez backend/.env et Supabase → Settings → Database');
    process.exit(1);
  })
  .finally(() => closePool());
