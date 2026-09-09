const { generateLocalReply } = require('../lib/chatKnowledge');
const { extractEntities, detectIntent } = require('../lib/chatNlp');

const cases = [
  { q: 'hotel', expectId: null, notId: 'taghit-hotel', label: 'hotel seul' },
  { q: 'ch7al hotel oran 3n 2p', expectPlace: 'oran', label: 'hotel oran' },
  { q: 'hote oran', expectAcc: 'hotel', expectDest: 'oran', label: 'hote oran' },
  { q: 'ann', notId: 'faq-saison', label: 'ann pas saison' },
  { q: 'slt n7eb bejaia 4j', expectDest: 'bejaia', label: 'bejaia compact' },
  { q: 'cc', expectGreeting: true, label: 'cc salutation' },
  { q: 'bonsoir', expectGreeting: true, expectEvening: true, label: 'bonsoir' },
  { q: 'bsr', expectGreeting: true, expectEvening: true, label: 'bsr abbr' },
  { q: 'bonjour je veux me renseigner', expectInfo: true, label: 'bonjour renseigner' },
  { q: 'bjr jv me renseigner', expectInfo: true, label: 'bjr jv renseigner' },
  { q: 'bsr jveux des infos', expectInfo: true, label: 'bsr jveux infos' },
  { q: 'slt jv me reinsigner', expectInfo: true, label: 'slt reinsigner typo' },
  { q: 'jv des infos sur taghit', expectInfo: true, expectDest: 'taghit', label: 'jv infos taghit' },
  {
    q: 'quelles sont vos destinations et vos dates disponibles',
    expectDestAvail: true,
    label: 'destinations et dates',
  },
  { q: 'que sont vos destination et vos date disponible', expectDestAvail: true, label: 'destinations typo' },
  { q: 'dates dispo', expectDestAvail: true, label: 'dates dispo' },
  { q: 'taghit', expectDestPrompt: 'sahara', label: 'taghit sans plages' },
  { q: 'bejaia', expectDestPrompt: 'coastal', label: 'bejaia avec plages' },
  { q: 'saha', expectGreeting: true, label: 'saha salutation' },
  { q: 'c cmb taghit', expectPrice: true, expectDest: 'taghit', label: 'c cmb taghit' },
  { q: 'bjr cmb taghit pr 2 pers', expectPrice: true, expectDest: 'taghit', expectTravelers: 2, label: 'bjr cmb pr pers' },
  { q: 'disp taghit', expectAvail: true, label: 'disp taghit' },
  { q: 'stp cmb taghit ttc', expectPrice: true, expectDest: 'taghit', label: 'stp cmb ttc' },
  { q: 'resa taghit pr 2 perss', expectDest: 'taghit', expectTravelers: 2, label: 'resa perss' },
  { q: 'slt saha', expectGreeting: true, label: 'slt saha' },
];

let failed = 0;

for (const c of cases) {
  const before = failed;
  const { entities, intent } = extractEntities(c.q);
  const out = generateLocalReply(c.q, 'fr', {});
  const topId = out.reply.includes('Taghit') && out.reply.includes('75') ? 'taghit-hotel' : 'other';

  if (c.expectAcc && entities.accommodation !== c.expectAcc) {
    console.log(`FAIL [${c.label}] accommodation: got ${entities.accommodation}, want ${c.expectAcc}`);
    failed += 1;
  }
  if (c.expectDest && entities.destination !== c.expectDest) {
    console.log(`FAIL [${c.label}] destination: got ${entities.destination}, want ${c.expectDest}`);
    failed += 1;
  }
  if (c.expectPlace && !out.reply.toLowerCase().includes(c.expectPlace)) {
    console.log(`FAIL [${c.label}] reply missing ${c.expectPlace}: ${out.reply.slice(0, 120)}…`);
    failed += 1;
  }
  if (c.notId === 'taghit-hotel' && out.reply.includes('Offre Taghit') && out.reply.includes('75')) {
    console.log(`FAIL [${c.label}] should not default to Taghit`);
    failed += 1;
  }
  if (c.expectGreeting && !/bonjour|bonsoir|comment puis-je|good evening|hello/i.test(out.reply)) {
    console.log(`FAIL [${c.label}] expected greeting: ${out.reply.slice(0, 80)}`);
    failed += 1;
  }
  if (c.expectEvening && !/bonsoir|good evening|مساء/i.test(out.reply)) {
    console.log(`FAIL [${c.label}] expected evening greeting: ${out.reply.slice(0, 80)}`);
    failed += 1;
  }
  if (c.expectDestPrompt === 'sahara') {
    if (/plage|beach|🏖️|شواطئ/i.test(out.reply)) {
      console.log(`FAIL [${c.label}] should not mention beaches: ${out.reply.slice(0, 120)}`);
      failed += 1;
    }
    if (!/dunes|sahara|4×4|dromadaire|🏜️/i.test(out.reply)) {
      console.log(`FAIL [${c.label}] expected Sahara options: ${out.reply.slice(0, 120)}`);
      failed += 1;
    }
  }
  if (c.expectDestPrompt === 'coastal') {
    if (!/plage|beach|🏖️/i.test(out.reply)) {
      console.log(`FAIL [${c.label}] expected beaches for coastal dest: ${out.reply.slice(0, 120)}`);
      failed += 1;
    }
  }
  if (c.expectPrice && !entities.wantsPrice && intent !== 'FOLLOWUP_PRICE') {
    console.log(`FAIL [${c.label}] expected price intent, got ${intent}, wantsPrice=${entities.wantsPrice}`);
    failed += 1;
  }
  if (c.expectTravelers && entities.travelers !== c.expectTravelers) {
    console.log(`FAIL [${c.label}] travelers: got ${entities.travelers}, want ${c.expectTravelers}`);
    failed += 1;
  }
  if (c.expectAvail && !entities.wantsAvailability) {
    console.log(`FAIL [${c.label}] expected wantsAvailability`);
    failed += 1;
  }
  if (c.expectDestAvail) {
    if (intent !== 'DESTINATIONS_AVAILABILITY') {
      console.log(`FAIL [${c.label}] intent: got ${intent}, want DESTINATIONS_AVAILABILITY`);
      failed += 1;
    }
    if (!/taghit/i.test(out.reply) || !/23/.test(out.reply) || !/28/.test(out.reply)) {
      console.log(`FAIL [${c.label}] expected Taghit 23-28: ${out.reply.slice(0, 150)}`);
      failed += 1;
    }
  }
  if (c.expectInfo) {
    if (intent !== 'INFO_REQUEST') {
      console.log(`FAIL [${c.label}] intent: got ${intent}, want INFO_REQUEST`);
      failed += 1;
    }
    if (!/renseigner|renseign|infos|plaisir|découvrir|Taghit|destinations/i.test(out.reply)) {
      console.log(`FAIL [${c.label}] expected info reply: ${out.reply.slice(0, 100)}`);
      failed += 1;
    }
  }
  if (c.notId === 'faq-saison' && /meilleur moment|automne|printemps/i.test(out.reply) && c.q === 'ann') {
    console.log(`FAIL [${c.label}] false positive saison FAQ`);
    failed += 1;
  }
  if (failed === before) console.log(`OK  [${c.label}]`);
}

const dur = extractEntities('ch7al hotel oran 3 n 2p');
if (dur.entities.nights !== 3) {
  console.log(`FAIL [3 n nights] got ${dur.entities.nights}`);
  failed += 1;
} else {
  console.log('OK  [3 n nights]');
}

process.exit(failed > 0 ? 1 : 0);
