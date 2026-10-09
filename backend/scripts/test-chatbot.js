/**
 * Simule une conversation avec le chatbot (catalogue réel, aucune écriture en base : les demandes sont simulées).
 *   npm run test:chatbot                       → les 20 messages de référence
 *   npm run test:chatbot -- "bjr|prix tadrart|je reserve"   → votre propre scénario (messages séparés par |)
 */
require('dotenv').config({ quiet: true });
const { handleMessage } = require('../lib/chatbot/dialog');

const DEFAULT = [
  'bjr', 'slt je veux un hotel', 'prix tadrart svp', 'tadrart c combien', 'combien pr tadrart', 'dispo décembre ?',
  'je veux faire une resa', 'je veux réserver un hotel', 'بشحال تادرارت', 'نحب نحجز', 'كاين بلايص', 'je veux un appart à béjaia',
  'hotel a djanet dispo ?', 'je veux partir en décembre', '4 personnes', 'du 12 au 18', 'ok', 'oui', 'non', 'je veux parler à un conseiller',
];

const actions = {
  createBookingRequest: async (d) => {
    console.log('   ⤷ [simulé] demande de réservation :', JSON.stringify(d));
    return { reference: 'CB-TEST' };
  },
  createContactRequest: async (d) => {
    console.log('   ⤷ [simulé] demande de rappel :', JSON.stringify(d));
    return { reference: 'CC-TEST' };
  },
};

(async () => {
  const arg = process.argv.slice(2).join(' ').trim();
  const messages = arg ? arg.split('|').map((m) => m.trim()).filter(Boolean) : DEFAULT;
  let context = null;
  for (const message of messages) {
    const r = await handleMessage({ context, message, language: 'fr', actions });
    context = r.context;
    console.log(`\n👤 ${message}\n🤖 [${r.intent}] ${r.reply.replace(/\n/g, '\n   ')}`);
    if (r.suggestions.length) console.log(`   [${r.suggestions.map((s) => s.label).join('] [')}]`);
  }
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
