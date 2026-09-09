/** NLP — SMS FR, darija, Arabizi, villes, extraction d'entités */

const CITY_ALIASES = {
  alger: ['alger', 'algiers', 'alg', 'dzair', 'el djazair', 'capitale', 'casbah', 'الجزائر'],
  oran: ['oran', 'ouahran', 'wahran', 'orn', 'وهران'],
  bejaia: ['bejaia', 'bejaïa', 'bejaya', 'bejaiaa', 'beja', 'bougie', 'bougi', 'bj', 'bja', 'بجاية'],
  constantine: ['constantine', 'qacentina', 'cst', 'قسنطينة'],
  annaba: ['annaba', 'ann', 'bone', 'عنابة'],
  tlemcen: ['tlemcen', 'telemsen', 'tlm', 'تلمسان'],
  setif: ['setif', 'sétif', 'سطif'],
  batna: ['batna', 'باتنة'],
  blida: ['blida', 'البليدة'],
  tipaza: ['tipaza', 'tipasa', 'tip', 'تيبaza'],
  'tizi-ouzou': ['tizi ouzou', 'tiziouzou', 'tizi', 'تيزي وزو'],
  bouira: ['bouira', 'البويرة'],
  jijel: ['jijel', 'jij', 'جijel'],
  skikda: ['skikda', 'سkikda'],
  mostaganem: ['mostaganem', 'مستغانem'],
  bechar: ['bechar', 'béchar', 'bechar', 'بشار'],
  tamanrasset: ['tamanrasset', 'tam', 'تمنرasset'],
  ouargla: ['ouargla', 'ورقلة'],
  ghardaia: ['ghardaia', 'ghardaïa', 'gh', 'gha', 'mzab', 'غرداية'],
  timimoun: ['timimoun', 'tim', 'تيميمون'],
  djanet: ['djanet', 'dj', 'dja', 'jant', 'جانت'],
  adrar: ['adrar', 'أdrar'],
  touggourt: ['touggourt', 'تقgourt'],
  taghit: ['taghit', 'th', 'tag', 'tgh', 'تاغيت'],
  hoggar: ['hoggar', 'assekrem', 'tuareg', 'الhoggar'],
  kabylie: ['kabylie', 'kabyle', 'kabylia', 'قبail'],
  sahara: ['sahara', 'sah', 'desert', 'des', 'désert', 'sud', 'grand sud', 'صحراء'],
};

const TOKEN_EXPANSIONS = {
  bjr: ['bonjour'], bj: ['bonjour'], slt: ['salut'], cc: ['coucou'], bsr: ['bonsoir'],
  slm: ['salam'], salam: ['salam'], yo: ['salut'], hello: ['bonjour'],
  cmb: ['combien'], cb: ['combien'], com: ['combien'], pk: ['pourquoi'], pq: ['pourquoi'],
  prq: ['pourquoi'], koi: ['quoi'], win: ['ou'], ou: ['ou'],
  ajd: ['aujourdhui'], auj: ['aujourdhui'], mtn: ['maintenant'], dem: ['demain'],
  dem1: ['demain'], apdem: ['apres demain'], j: ['jour'], jr: ['jour'], jrs: ['jours'],
  n: ['nuit'], nuit: ['nuit'], nuits: ['nuits'], sem: ['semaine'], we: ['weekend'],
  wk: ['weekend'], mat: ['matin'], aprem: ['apres midi'], soir: ['soir'],
  res: ['reservation', 'reserver'], resa: ['reservation', 'reserver'], résa: ['reservation'],
  réserv: ['reservation'], reserv: ['reservation'], book: ['reserver'], booking: ['reservation'],
  conf: ['confirmation'], dispo: ['disponibilite'], disp: ['disponible', 'disponibilite'],
  apt: ['appartement'], appart: ['appartement'], apprt: ['appartement'], app: ['appartement'],
  logt: ['logement'], heberg: ['hebergement'], héb: ['hebergement'], hotel: ['hotel'],
  hot: ['hotel'], ch: ['chambre'], chbre: ['chambre'], villa: ['villa'], camp: ['camping'],
  avion: ['avion'], vol: ['vol'], aero: ['aeroport'], aeroport: ['aeroport'],
  train: ['train'], gare: ['gare'], bus: ['bus'], taxi: ['taxi'], vtc: ['vtc'],
  ferry: ['ferry'], bateau: ['bateau'], nav: ['navette'], loc: ['location'], auto: ['voiture'],
  activ: ['activite'], act: ['activite'], exc: ['excursion'], excurs: ['excursion'],
  rando: ['randonnee'], rand: ['randonnee'], quad: ['quad'], cheval: ['cheval'],
  kayak: ['kayak'], plong: ['plongee'], surf: ['surf'], ski: ['ski'], plage: ['plage'], mer: ['mer'],
  prix: ['prix', 'tarif'], tarif: ['prix'], budget: ['budget'], promo: ['promotion'],
  rem: ['remise'], réduc: ['reduction'], cheap: ['economique'], 'pas cher': ['economique'],
  tel: ['telephone'], tél: ['telephone'], num: ['numero'], msg: ['message'],
  mail: ['email'], info: ['information'], infos: ['informations'], rdv: ['rendez vous'],
  svp: ['sil vous plait'], stp: ['sil te plait'], mrc: ['merci'], thx: ['merci'],
  ok: ['daccord'], okk: ['daccord'], oki: ['daccord'], dac: ['daccord'], dacc: ['daccord'],
  nn: ['non'], oui: ['oui'], ouais: ['oui'],
  ch7al: ['combien'], chhal: ['combien'], wach: ['quoi'], wesh: ['quoi'],
  kayn: ['il y a'], makanch: ['il n y a pas'],
  n7eb: ['je veux'], nheb: ['je veux'], n7ab: ['je veux'], hab: ['je veux'],
  bghit: ['je veux'], 'n7eb nroh': ['je veux aller'], 'n7eb nzour': ['je veux visiter'],
  nroh: ['je vais'], nrouh: ['je vais'], nzour: ['visiter'], safar: ['voyage'], siyaha: ['tourisme'],
  lyoum: ['aujourdhui'], ghodwa: ['demain'], lyoum: ['aujourdhui'],
  m3a: ['avec'], bla: ['sans'], wahdi: ['seul'], ana: ['moi'], hna: ['nous'],
  voy: ['voyage'], circ: ['circuit'], circu: ['circuit'], dest: ['destination'],
  sej: ['sejour'], tt: ['tout'], px: ['prix'], comb: ['combien'], ht: ['hotel'],
  mh: ['maison hote'], wpp: ['whatsapp'], wa: ['whatsapp'],
  resto: ['restaurant'], restau: ['restaurant'], maps: ['carte', 'localisation'],
  agent: ['humain', 'conseiller'], humain: ['humain'], conseiller: ['conseiller'],
  keske: ['qu est ce'], koi: ['quoi'], cmb: ['combien'], cb: ['combien'],
  pcq: ['parce que'], pck: ['parce que'], pk: ['pourquoi'], pq: ['pourquoi'],
  ajd: ['aujourdhui'], auj: ['aujourdhui'], mtn: ['maintenant'], dem: ['demain'],
  we: ['weekend'], wk: ['weekend'], mat: ['matin'], aprem: ['apres midi'],
  ch: ['chambre'], chbre: ['chambre'], loc: ['location'], auto: ['voiture'],
  exc: ['excursion'], excurs: ['excursion'], rand: ['randonnee'], plong: ['plongee'],
  pascher: ['pas cher', 'economique'], pscher: ['pas cher'], pch: ['pas cher'],
  ndir: ['faire', 'organiser'], ndiro: ['organiser'], ndirha: ['organiser'],
  nzour: ['visiter'], nzourou: ['visiter'], nzourha: ['visiter'],
  fi: ['a', 'dans'], f: ['a'], l: ['le'], d: ['de'],
  '3and': ['avec'], '3andi': ['j ai'], '3andna': ['nous avons'],
  wahdi: ['seul'], drari: ['enfants'], s7abi: ['amis'],
  prog: ['programme'], itin: ['itineraire'], org: ['organiser'],
  hajz: ['reservation'], htl: ['hotel'], htlm: ['hotel'],
  voudrais: ['je veux'], aimerais: ['je veux'], souhaite: ['je veux'],
  cherche: ['recherche'], recherche: ['recherche'],
  semaine: ['7 jours'], weekend: ['2 jours'],
  deux: ['2'], trois: ['3'], quatre: ['4'], cinq: ['5'], six: ['6'],
  sept: ['7'], huit: ['8'], neuf: ['9'], dix: ['10'],
  propose: ['organiser'], organise: ['organiser'], planifie: ['organiser'],
  dormir: ['hebergement'], loger: ['hebergement'], hebergement: ['hebergement'],
  partir: ['voyage'], vacances: ['sejour'], sejour: ['sejour'],
  bientot: ['prochainement'], prochainement: ['bientot'],
  octobre: ['oct'], novembre: ['nov'], decembre: ['dec'],
  // SMS / réseaux
  jv: ['je veux'], jveux: ['je veux'],
  tkt: ['ok'], b1sur: ['bien sur'], bcp: ['beaucoup'], vrmt: ['vraiment'],
  jsp: ['je sais pas'], stp: ['sil te plait'], svp: ['sil vous plait'],
  pr: ['pour'], pc: ['parce que'], tt: ['tout'], qq: ['quoi'], qqn: ['quelqu un'],
  rdv: ['rendez vous'], pkg: ['formule'], frm: ['formule'], off: ['offre'],
  // Darija / Arabizi
  ndir: ['faire', 'organiser'], ndiro: ['organiser'], ndirha: ['organiser'],
  nbdaw: ['commencer'], nbdawha: ['commencer'], nroh: ['je vais'], nrouh: ['je vais'],
  nzid: ['ajouter'], nchalah: ['inchaallah'], inchalah: ['inchaallah'],
  kifach: ['comment'], kifash: ['comment'], besh: ['pour'], bach: ['pour'],
  fih: ['il y a'], fiha: ['il y a'], bla: ['sans'], maa: ['avec'], m3ak: ['avec toi'],
  wahda: ['1'], wahed: ['1'], zouj: ['2'], tlata: ['3'], rb3a: ['4'], khamsa: ['5'],
  setti: ['6'], sebaa: ['7'], tmanya: ['8'], ts3oud: ['9'], achra: ['10'],
  ghodwa: ['demain'], lyom: ['aujourdhui'], lyoum: ['aujourdhui'],
  sahbi: ['ami'], drari: ['enfants'], khoya: ['frere'], okhti: ['soeur'],
  labas: ['ca va'], labes: ['ca va'], hamdoulah: ['merci'],
  // Voyages compacts
  aller: ['aller'], retour: ['retour'], ar: ['aller retour'], 'a/r': ['aller retour'],
  dep: ['depart'], arr: ['arrivee'], desti: ['destination'],
  htl: ['hotel'], ht: ['hotel'], chbr: ['chambre'], chamb: ['chambre'],
  app: ['appartement'], appt: ['appartement'], log: ['logement'],
  circ: ['circuit'], circu: ['circuit'], voy: ['voyage'], sej: ['sejour'],
  prog: ['programme'], itin: ['itineraire'], org: ['organiser'],
  resa: ['reservation'], reserv: ['reservation'], rez: ['reservation'],
  dispo: ['disponibilite'], disp: ['disponible', 'disponibilite'],
  px: ['prix'], cmb: ['combien'], ch7al: ['combien'], chhal: ['combien'],
  comb: ['combien'], tarif: ['prix'], budget: ['budget'],
  vol: ['vol'], aero: ['aeroport'],
  bjr: ['bonjour'], bj: ['bonjour'], slt: ['salut'], slm: ['salam'], bsr: ['bonsoir'],
  mrc: ['merci'], thx: ['merci'], ok: ['daccord'], dac: ['daccord'],
  plages: ['plage'], plage: ['plage'], mer: ['mer'], sah: ['sahara'],
  activ: ['activite'], act: ['activite'], exc: ['excursion'], rando: ['randonnee'],
  quad: ['quad'], '4x4': ['4x4'], chev: ['cheval'], drom: ['dromadaire'],
  wpp: ['whatsapp'], wa: ['whatsapp'], tel: ['telephone'], mail: ['email'],
  pascher: ['pas cher'], psch: ['pas cher'], eco: ['economique'],
  lux: ['luxe'], luxe: ['luxe'],
  // Salutations & renseignements
  bs: ['bonsoir'], hey: ['salut'], hii: ['salut'], hlo: ['bonjour'],
  renseign: ['renseigner'], reinsign: ['renseigner'], renseignement: ['renseigner'],
  renseignements: ['renseigner'], renseigne: ['renseigner'], renseignes: ['renseigner'],
  infos: ['informations'], savoir: ['savoir'], decouvrir: ['decouvrir'],
  offres: ['offres'], proposition: ['proposition'], propositions: ['propositions'],
  catalogue: ['catalogue'], doc: ['documentation'], docs: ['documentation'],
  question: ['question'], questions: ['questions'], besoin: ['besoin'],
  jaimerai: ['je veux'], jaimerais: ['je veux'], jvoudrais: ['je voudrais'],
  jvsavoir: ['je veux savoir'], jvsavoirplus: ['je veux savoir plus'],
  jvinfo: ['je veux info'], jvinfos: ['je veux infos'], jvdesinfos: ['je veux des infos'],
  jvrenseigner: ['je veux renseigner'], jvmerenseigner: ['je veux me renseigner'],
  jveuxinfo: ['je veux info'], jveuxinfos: ['je veux infos'],
  jveuxrenseigner: ['je veux renseigner'], jveuxmerenseigner: ['je veux me renseigner'],
  bjrjv: ['bonjour je veux'], bsrjv: ['bonsoir je veux'], sltjv: ['salut je veux'],
  bjrjvsavoir: ['bonjour je veux savoir'], bsrjvsavoir: ['bonsoir je veux savoir'],
  // Lexique client SMS — table agence (source unique)
  saha: ['salut', 'bonjour'],
  pers: ['personnes'], perss: ['personnes'],
  nb: ['nombre'], nbr: ['nombre'],
  incl: ['inclus'], inclus: ['inclus', 'compris'], compris: ['inclus'],
  ttc: ['toutes taxes comprises'],
  heberg: ['hebergement'], hebergement: ['hebergement'],
  chb: ['chambre'], chambre: ['chambre'],
  transf: ['transfert'], transp: ['transport'],
  aer: ['aerien'], avi: ['avion'],
  ap: ['apres'], pm: ['apres midi'],
  cmt: ['comment'], qd: ['quand'], quoi: ['quoi'],
  sv: ['service'], max: ['maximum'], min: ['minimum'],
  daccord: ['daccord'], non: ['non'],
  reserver: ['reserver'], réserver: ['reserver'], reserv: ['reservation'],
  ccmb: ['c est combien'], cestcombien: ['c est combien'], ccombien: ['c est combien'],
  activites: ['activites'], nuitees: ['nuits'], nuitee: ['nuit'],
  arrivee: ['arrivee'], depart: ['depart'],
  nom: ['nom'], prenom: ['prenom'], msg: ['message'],
  // av = avant ; avion si contexte vol (resolveContextualTokens)
  av: ['avant'],
};

/** Phrases collées sans espace → avec espaces */
const COMPACT_GLUE = [
  ['n7ebnroh', 'n7eb nroh'], ['n7ebnzour', 'n7eb nzour'], ['n7eballer', 'n7eb aller'],
  ['n7ebnrouh', 'n7eb nrouh'], ['nhebnroh', 'nheb nroh'], ['bghitnroh', 'bghit nroh'],
  ['n7ebtaghit', 'n7eb taghit'], ['n7ebbejaia', 'n7eb bejaia'], ['n7eboran', 'n7eb oran'],
  ['n7ebalger', 'n7eb alger'], ['n7ebdjanet', 'n7eb djanet'], ['n7ebghardaia', 'n7eb ghardaia'],
  ['bghittaghit', 'bghit taghit'], ['bghitbejaia', 'bghit bejaia'], ['bghitbejaia', 'bghit bejaia'],
  ['sltn7eb', 'slt n7eb'], ['slmn7eb', 'slm n7eb'], ['bjrn7eb', 'bjr n7eb'],
  ['sltn7ebbejaia', 'slt n7eb bejaia'], ['n7ebbejaia', 'n7eb bejaia'],
  ['ch7altaghit', 'ch7al taghit'], ['ch7alhotel', 'ch7al hotel'], ['ch7albejaia', 'ch7al bejaia'],
  ['ch7alpx', 'ch7al prix'], ['cmbpx', 'combien prix'], ['cmbhotel', 'combien hotel'],
  ['ch7alhtl', 'ch7al hotel'], ['ch7altgh', 'ch7al taghit'], ['ch7alhoteltgh', 'ch7al hotel taghit'],
  ['cmbpxtaghit', 'combien prix taghit'], ['cmbtaghit', 'combien taghit'],
  ['hoteltaghit', 'hotel taghit'], ['hotelbejaia', 'hotel bejaia'], ['hoteloran', 'hotel oran'],
  ['htltaghit', 'hotel taghit'], ['htlbejaia', 'hotel bejaia'], ['htlbja', 'hotel bja'],
  ['resataghit', 'resa taghit'], ['resabejaia', 'resa bejaia'], ['booktaghit', 'book taghit'],
  ['voytaghit', 'voy taghit'], ['voybejaia', 'voy bejaia'], ['circsahara', 'circ sahara'],
  ['progbejaia', 'prog bejaia'], ['prog taghit', 'prog taghit'],
  ['bghitndiroghodwabja', 'bghit ndiro ghodwa bja'], ['bghitndiro', 'bghit ndiro'], ['ndiroghodwa', 'ndiro ghodwa'], ['ndirolyoum', 'ndiro lyoum'],
  ['m3a3', 'm3a 3'], ['m3a4', 'm3a 4'], ['pr3', 'pr 3'], ['pr4', 'pr 4'],
  ['pour3', 'pour 3'], ['pour4', 'pour 4'],
  ['alleralger', 'aller alger'], ['allerbejaia', 'aller bejaia'], ['alleroran', 'aller oran'],
  ['algeroran', 'alger oran'], ['algerbejaia', 'alger bejaia'], ['algerbja', 'alger bja'],
  ['de alger', 'de alger'], ['dalger', 'd alger'], ['dbejaia', 'd bejaia'],
  ['jveuxaller', 'je veux aller'], ['jveux', 'je veux'], ['jvoudrais', 'je voudrais'],
  ['winhotel', 'win hotel'], ['kaynhotel', 'kayn hotel'], ['kayndispo', 'kayn dispo'],
  ['pascherhotel', 'pas cher hotel'], ['hotelpascher', 'hotel pas cher'],
  ['4j2p', '4j 2p'], ['3j2p', '3j 2p'], ['5j4p', '5j 4p'], ['4j2pers', '4j 2 pers'],
  ['taghit23', 'taghit 23'], ['taghit28', 'taghit 28'], ['vol23', 'vol 23'], ['vol28', 'vol 28'],
  ['bjrjv', 'bjr je veux'], ['bsrjv', 'bsr je veux'], ['sltjv', 'slt je veux'],
  ['bjrjvrenseigner', 'bjr je veux renseigner'], ['bsrjvrenseigner', 'bsr je veux renseigner'],
  ['bjrjvmerenseigner', 'bjr je veux me renseigner'], ['bsrjvmerenseigner', 'bsr je veux me renseigner'],
  ['jvrenseigner', 'je veux renseigner'], ['jvmerenseigner', 'je veux me renseigner'],
  ['jveuxrenseigner', 'je veux renseigner'], ['jveuxmerenseigner', 'je veux me renseigner'],
  ['jvdesinfos', 'je veux des infos'], ['jvinfos', 'je veux infos'], ['jvsavoir', 'je veux savoir'],
  ['besoininfos', 'besoin infos'], ['besoindinfos', 'besoin d infos'], ['besoinrenseignements', 'besoin renseignements'],
  ['jaibesoin', 'j ai besoin'], ['jvaibesoin', 'jv ai besoin'], ['jvaibesoininfos', 'jv ai besoin infos'],
  ['bonjourjv', 'bonjour je veux'], ['bonsoirjv', 'bonsoir je veux'],
  ['bonjourjveux', 'bonjour je veux'], ['bonsoirjveux', 'bonsoir je veux'],
  ['bonjourjerenseigne', 'bonjour je renseigne'], ['bonjourjerenseigner', 'bonjour je renseigner'],
  ['jerenseigne', 'je renseigne'], ['jerenseigner', 'je renseigner'], ['jemerenseigne', 'je me renseigne'],
  ['jemerenseigner', 'je me renseigner'], ['veuxmerenseigner', 'veux me renseigner'],
  ['veuxrenseigner', 'veux renseigner'],   ['reinsigner', 'renseigner'], ['reinsign', 'renseigner'],
  ['destinationsdates', 'destinations dates'], ['destinationsdispo', 'destinations dispo'],
  ['datesdispo', 'dates dispo'], ['vosdestinations', 'vos destinations'],
  ['vosdates', 'vos dates'], ['datesdisponibles', 'dates disponibles'],
  ['quellessontvosdestinations', 'quelles sont vos destinations'],
  ['quessontvosdestinations', 'que sont vos destinations'],
  ['destinationsetdates', 'destinations et dates'], ['datesetdestinations', 'dates et destinations'],
  ['ccmb', 'c cmb'], ['ccombien', 'c combien'], ['cestcombien', 'c est combien'],
  ['datearr', 'date arr'], ['datedep', 'date dep'], ['datearrivee', 'date arrivee'],
  ['datedepart', 'date depart'], ['perss', 'pers'],
  ['pr2pers', 'pr 2 pers'], ['pr3pers', 'pr 3 pers'], ['pr4pers', 'pr 4 pers'],
  ['cmbtaghit', 'cmb taghit'], ['cmbttc', 'cmb ttc'], ['ch7alttc', 'ch7al ttc'],
  ['resataghit', 'resa taghit'], ['dispotaghit', 'dispo taghit'],
  ['bjrcmb', 'bjr cmb'], ['sltcmb', 'slt cmb'], ['bjrresa', 'bjr resa'],
  ['hotelttc', 'hotel ttc'], ['tarifttc', 'tarif ttc'],
];

const GREETING_ONLY_TOKENS = new Set([
  'bj', 'bjr', 'slt', 'slm', 'salam', 'saha', 'bsr', 'bs', 'cc', 'coucou', 'yo', 'hello', 'hi', 'hey',
  'bonjour', 'salut', 'bonsoir', 'marhaba', 'ahlan', 'hii', 'hlo',
]);

const GREETING_PREFIX_RE = /^(bjr|bj|bsr|bs|slt|salut|cc|coucou|bonjour|bonsoir|slm|salam|saha|marhaba|ahlan|hello|hi|hey|labas|labes|bonne soiree|good morning|good evening|salam alkom|salam alikom)\b/;

const GREETING_ONLY_RE = /^(bjr|bj|bsr|bs|slt|salut|cc|coucou|bonjour|bonsoir|slm|salam|saha|marhaba|ahlan|hello|hi|hey|labas|labes|bonne soiree|good morning|good evening|salam alkom|salam alikom|hii|hlo)(\s*[!?.…]*)$/;

const INFO_REQUEST_RE = /(?:renseign|reinsign|info|infos|informations|documentation|question|questions|besoin|savoir plus|plus d info|plus d infos|demande|offres|propositions|catalogue|comment ca marche|what do you offer|tell me about|learn more|je veux savoir|jv savoir|jveux savoir|besoin d|j ai besoin|jaibesoin|pouvez vous|pourriez vous|aide moi|aidez moi|guide moi|orienter|orientation|conseil|conseils|renseignement|renseignements)/;

const DEST_AVAIL_RE = /(?:destinations?.*(?:dates?|dispo|disponib|creneaux?|periodes?)|(?:dates?|dispo|disponib|creneaux?|periodes?).*destinations?|destinations? et (?:vos )?dates|dates et destinations|destinations disponibles|dates disponibles|quelles sont vos|quels sont vos|que sont vos|vos destinations|nos destinations|liste destinations|catalogue destinations|where do you travel|available dates|dates available)/;

const SPLIT_ABBREVS = [
  'ch7al', 'chhal', 'n7eb', 'nheb', 'n7ab', 'bghit', 'win', 'wach', 'wesh', 'kayn', 'makanch',
  'kifach', 'kifash', 'ndir', 'ndiro', 'nroh', 'nrouh', 'nzour', 'nzourou',
  'slt', 'bjr', 'bsr', 'slm', 'salam', 'marhaba', 'ahlan', 'coucou', 'cc', 'yo',
  'resa', 'reserv', 'reservation', 'dispo', 'disp', 'book', 'booking', 'hajz', 'rez',
  'hotel', 'htl', 'apt', 'appart', 'apprt', 'appt', 'logt', 'heberg', 'villa', 'camp', 'mh',
  'voy', 'circ', 'circu', 'sej', 'safar', 'siyaha', 'vol', 'avion', 'aero', 'ferry', 'train', 'bus', 'taxi',
  'plage', 'plages', 'beach', 'sahara', 'desert', 'resto', 'restau', 'activ', 'quad', 'rando', 'exc',
  'cmb', 'combien', 'prix', 'tarif', 'px', 'budget', 'ch7al',
  'bejaia', 'bejaïa', 'bejaya', 'bougie', 'bja', 'oran', 'alger', 'taghit', 'djanet',
  'ghardaia', 'timimoun', 'jijel', 'constantine', 'annaba', 'tipaza', 'tlemcen', 'setif', 'blida', 'kabylie',
  'pascher', 'pas cher', 'm3a', 'pour', 'lyali', 'ghodwa', 'lyoum', 'lyom',
  'prog', 'itin', 'org', 'aller', 'retour', 'dep', 'oct', 'nov', 'dec',
  'jveux', 'jv', 'wpp', 'wa', 'svp', 'stp', 'merci', 'mrc', 'thx',
  'renseign', 'reinsign', 'renseignement', 'renseignements', 'infos', 'info', 'besoin',
  'bonjour', 'bonsoir', 'salut', 'coucou', 'hey', 'bonne', 'soiree', 'saha',
  'pers', 'perss', 'nb', 'nbr', 'incl', 'ttc', 'transf', 'transp', 'aer', 'chb',
  'cmt', 'qd', 'arr', 'dep', 'ccmb', 'cestcombien', 'ccombien', 'datearr', 'datedep',
  'inclus', 'compris', 'incl', 'ttc', 'transf', 'transp', 'reserver', 'réserver',
  'nuitees', 'nuitee', 'activites', 'nom', 'prenom', 'quoi', 'koi',
].sort((a, b) => b.length - a.length);

const EMOJI_HINTS = {
  '🏨': 'hotel', '🏡': 'logement', '🏖️': 'plage', '🌊': 'mer', '🏜️': 'sahara',
  '🏔️': 'montagne', '🚗': 'voiture', '✈️': 'vol', '🚆': 'train', '🚌': 'bus',
  '🚢': 'ferry', '🍽️': 'restaurant', '📍': 'localisation', '📅': 'date',
  '💰': 'prix', '💳': 'paiement', '🛻': 'quad', '🐎': 'cheval',
};

function normalizeQuery(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''´`]/g, ' ')
    .replace(/[^a-z0-9\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasWholeToken(text, token) {
  if (!token) return false;
  if (text === token) return true;
  const re = new RegExp(`(^|\\s)${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\s)`);
  return re.test(text);
}

function stripGreetingPrefix(text) {
  return normalizeQuery(text).replace(GREETING_PREFIX_RE, '').trim();
}

function isGreetingOnly(text) {
  return GREETING_ONLY_RE.test(normalizeQuery(text).trim());
}

function isEveningGreeting(text) {
  return /^(bonsoir|bsr|bs|bonne soiree|good evening)\b/.test(normalizeQuery(text));
}

function isInfoRequest(text) {
  const n = normalizeQuery(text);
  const core = stripGreetingPrefix(n) || n;
  if (isDestinationsAvailabilityQuery(n)) return false;
  if (INFO_REQUEST_RE.test(core)) return true;
  if (/^(jv|jveux|je veux)\s+(des\s+)?(infos?|renseign)/.test(core)) return true;
  if (/^(jv|jveux|je veux)\s+me\s+renseign/.test(core)) return true;
  return false;
}

function isDestinationsAvailabilityQuery(text) {
  const n = normalizeQuery(text);
  const core = stripGreetingPrefix(n) || n;
  if (DEST_AVAIL_RE.test(core)) return true;
  const asksDest = /(?:quelles?|quels?|que|vos|nos|liste|catalogue|proposez|offrez|destinations?|desti|ou partez|ou allez)/.test(core);
  const asksDates = /(?:dates?|dispo|disponib|creneaux?|periodes?|quand partez|semaines?|octobre|oct|23|28)/.test(core);
  if (asksDest && asksDates) return true;
  if (/^(dates? dispo|dates? disp(?:\s+o)?|dispo dates?|dates disponibles|creneaux disponibles)(\s*[!?.…]*)$/.test(core)) return true;
  if (/^(vos|quelles?|quels?|que|nos)\s+destinations?(\s*[!?.…]*)$/.test(core)) return true;
  return false;
}

function preprocessMessage(raw) {
  let text = splitCompactMessage(String(raw || '').trim());
  // Fautes fréquentes & variantes « renseigner »
  text = text
    .replace(/\breinsign(er|e|ement|ements|e|es)?\b/gi, 'renseign$1')
    .replace(/\b(je\s+veux|jveux|jv)\s+me\s+reinsign(er)?\b/gi, 'je veux me renseigner')
    .replace(/\b(je\s+veux|jveux|jv)\s+me\s+renseign(er|e|es)?\b/gi, 'je veux me renseigner')
    .replace(/\b(je\s+veux|jveux|jv)\s+renseign(er|e|es|ement|ements)?\b/gi, 'je veux renseigner')
    .replace(/\b(je\s+veux|jveux|jv)\s+(des\s+)?infos?\b/gi, 'je veux des infos')
    .replace(/\b(je\s+veux|jveux|jv)\s+savoir\b/gi, 'je veux savoir')
    .replace(/\bbonjour\s+bonsoir\b/gi, 'bonsoir')
    .replace(/\bbonsoir\s+bonjour\b/gi, 'bonsoir')
    .replace(/\bc\s+cmb\b/gi, 'c est combien')
    .replace(/\bc\s+combien\b/gi, 'c est combien')
    .replace(/\bquel est le prix\b/gi, 'combien prix');
  // Normalisation langage naturel parlé
  text = text
    .replace(/\b(je\s+voudrais|j'aimerais|j aimerais|je\s+souhaite|est ce que|est-ce que|svp|s'il vous plait|sil vous plait)\b/gi, ' ')
    .replace(/\b(on\s+est|nous\s+sommes|nous\s+serons)\b/gi, ' ')
    .replace(/\b(ou\s+dormir|where\s+to\s+stay|comment\s+faire)\b/gi, ' hebergement ')
    .replace(/\b(propose\s+moi|aide\s+moi|organise\s+moi|planifie\s+moi)\b/gi, ' organiser ')
    .replace(/\b(pas\s+trop\s+cher|pas\s+cher|budget\s+serre)\b/gi, ' economique ')
    .replace(/\b(lune\s+de\s+miel|en\s+couple|avec\s+ma\s+femme|avec\s+mon\s+mari)\b/gi, ' couple ')
    .replace(/\b(avec\s+mes\s+enfants|en\s+famille)\b/gi, ' famille ')
    .replace(/\s+/g, ' ')
    .trim();
  for (const [emoji, hint] of Object.entries(EMOJI_HINTS)) {
    if (text.includes(emoji)) text += ` ${hint}`;
  }
  return text;
}

/** Découpe les messages compacts : sltn7ebbejaia4j, ch7alhotel3n2p, etc. */
function splitCompactMessage(text) {
  let s = String(text || '').trim().toLowerCase();
  if (!s) return s;

  for (const [from, to] of COMPACT_GLUE.sort((a, b) => b[0].length - a[0].length)) {
    s = s.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to);
  }

  const PROTECTED = ['n7eb', 'nheb', 'n7ab', 'ch7al', 'chhal', 'bghit', 'm3a', '3and', '3andi', '3andna', '3lyali', 'combien', 'ghodwa', 'dispo', 'disponible', 'disponibilite', 'saha'];
  const placeholders = {};
  PROTECTED.forEach((tok, i) => {
    const ph = `__p${i}__`;
    placeholders[ph] = tok;
    s = s.replace(new RegExp(tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ph);
  });

  for (const ab of SPLIT_ABBREVS) {
    const esc = ab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`(${esc})(?=[a-z0-9\u0600-\u06ff_])`, 'gi'), '$1 ');
    s = s.replace(new RegExp(`(?<=[a-z0-9\u0600-\u06ff])(${esc})`, 'gi'), ' $1');
  }

  s = s
    .replace(/(\d{1,2})[-/–](\d{1,2})/g, '$1 $2')
    .replace(/(\d+)([a-z\u0600-\u06ff]{2,})/gi, '$1 $2')
    .replace(/([a-z\u0600-\u06ff]{2,})(\d+)/gi, '$1 $2')
    .replace(/(\d+)([jnp])(?=\s|$|[^a-z0-9])/gi, '$1$2 ')
    .replace(/(\d+)lyali/gi, '$1 lyali')
    .replace(/(\d+)pers\b/gi, '$1 pers')
    .replace(/(\d+)p(?=\s|$|[^a-z0-9])/gi, '$1 p')
    .replace(/pr(\d+)/gi, 'pr $1')
    .replace(/m3a(\d+)/gi, 'm3a $1')
    .replace(/pour(\d+)/gi, 'pour $1')
    .replace(/(\d+)\s*(pers|perso|personnes?|pax|lyali|nuits?)/gi, '$1 $2')
    .replace(/(\d+)\s*(j|jr|jrs|jours?|days?|n|nuits?)/gi, '$1 $2');

  for (const [ph, tok] of Object.entries(placeholders)) {
    s = s.split(ph).join(` ${tok} `);
  }

  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

function resolveContextualTokens(text, tokens) {
  const n = normalizeQuery(text);
  const resolved = [...tokens];

  if (resolved.includes('av')) {
    const flightCtx = /vol|avion|aer|aero|transp|flight|aller retour|aerien/.test(n);
    resolved.push(flightCtx ? 'avion' : 'avant');
  }
  if (resolved.includes('aer')) {
    resolved.push('avion', 'aerien');
  }
  if (resolved.includes('pm')) {
    const eveningCtx = /soir|18h|19h|20h|21h|22h|ce soir|demain soir/.test(n);
    const morningCtx = /matin|mat\b|8h|9h|10h/.test(n);
    if (eveningCtx && !morningCtx) resolved.push('soir');
    else if (morningCtx) resolved.push('matin');
    else resolved.push('apres midi');
  }

  for (let i = 0; i < resolved.length; i += 1) {
    if (resolved[i] === 'p' && resolved[i + 1] && /^\d+$/.test(resolved[i + 1])) {
      resolved[i] = 'pour';
    }
    if (resolved[i] === 'p' && resolved[i - 1] && /^\d+$/.test(resolved[i - 1])) {
      resolved.push('personnes');
    }
  }

  if (/c est combien|cest combien|c combien/.test(n)) {
    resolved.push('combien', 'prix');
  }
  if (/quel est le prix/.test(n)) {
    resolved.push('combien', 'prix', 'tarif');
  }

  return [...new Set(resolved)];
}

function expandTokens(tokens) {
  const expanded = new Set(tokens);
  let changed = true;
  // Expansion en cascade (ex: jv → je veux)
  while (changed) {
    changed = false;
    for (const token of [...expanded]) {
      if (TOKEN_EXPANSIONS[token]) {
        for (const t of TOKEN_EXPANSIONS[token]) {
          const norm = normalizeQuery(t);
          if (!expanded.has(norm)) {
            expanded.add(norm);
            changed = true;
          }
          norm.split(' ').filter(Boolean).forEach((part) => {
            if (!expanded.has(part)) {
              expanded.add(part);
              changed = true;
            }
          });
        }
      }
    }
  }
  return [...expanded];
}

function expandQuery(raw) {
  const preprocessed = preprocessMessage(raw);
  const original = normalizeQuery(preprocessed);
  const tokens = resolveContextualTokens(original, original.split(' ').filter(Boolean));
  const expanded = expandTokens(tokens);

  for (const [cityId, aliases] of Object.entries(CITY_ALIASES)) {
    const all = [cityId, ...aliases].map(normalizeQuery);
    const matched = all.some((a) => {
      if (!a) return false;
      if (tokens.includes(a)) return true;
      if (a.length <= 3) return hasWholeToken(original, a);
      return original.includes(a);
    });
    if (matched) {
      all.forEach((a) => expanded.push(a));
      expanded.push(cityId);
    }
  }

  return {
    original,
    tokens,
    expanded: [...new Set(expanded)],
    searchText: [...new Set(expanded)].join(' '),
  };
}

function detectLanguage(text) {
  const t = String(text || '');
  if (/[\u0600-\u06FF]/.test(t)) return 'ar';
  if (/\b(hi|hello|thanks|book|trip|travel|hotel|price|how much)\b/i.test(t)) return 'en';
  if (/\b(ch7al|n7eb|win|wach|bghit|lyoum|ghodwa|m3a|slm)\b/i.test(t)) return 'fr';
  return 'fr';
}

function findDestination(text, tokens) {
  const n = normalizeQuery(text);
  const tokenSet = new Set(tokens);
  const travelCtx = /hotel|ht|voyage|voy|n7eb|nheb|bghit|resa|prix|ch7al|jours?|nuits?|lyali|pers|circuit|sejour|prog|vol|aller|nzour|visiter|taghit|bejaia|oran|sahara/.test(n);

  for (const [cityId, aliases] of Object.entries(CITY_ALIASES)) {
    const all = [cityId, ...aliases].map(normalizeQuery);
    for (const a of all) {
      if (!a) continue;

      // Alias très court (bj, th, dj…) : token exact + contexte voyage
      if (a.length <= 3) {
        if (GREETING_ONLY_TOKENS.has(a) && tokens.length <= 2 && !travelCtx) continue;
        if (tokenSet.has(a) && (travelCtx || tokens.length > 1)) return cityId;
        continue;
      }

      if (tokenSet.has(a)) return cityId;
      // Mot entier dans la phrase (évite oran ⊂ hote)
      const wordRe = new RegExp(`(?:^|\\s)${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`, 'i');
      if (wordRe.test(n)) return cityId;
      if (a.length >= 5 && n.includes(a)) return cityId;
    }
  }
  return null;
}

function parsePersons(text) {
  const wordNums = {
    un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5,
    six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
  };
  const patterns = [
    /(\d+)\s*(?:pers(?:onnes?)?|perss|p(?:ers)?|personnes?|persons?|people|pax|ashkhas|adultes?|voyageurs?)/i,
    /(?:nb|nbr)\s*(\d+)\s*(?:pers(?:onnes?)?|perss|p(?:ers)?|personnes?)/i,
    /(?:pr|pour)\s*(\d+)/i,
    /(\d+)p(?=\s|$|[^a-z0-9])/i,
    /(\d+)pers\b/i,
    /(\d+)perso\b/i,
    /m3a\s*(\d+)/i,
    /zouj\s*(?:pers|personnes?|nass)?/i,
    /tlata\s*(?:pers|personnes?|nass)?/i,
    /rb3a\s*(?:pers|personnes?|nass)?/i,
    /(?:on est|nous sommes|nous serons|we are)\s*(\d+)/i,
    /(?:deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s*(?:pers(?:onnes?)?|personnes?|adultes?|voyageurs?)/i,
    /couple|en couple|ma femme|mon mari|lune de miel/i,
    /famille|en famille|avec mes enfants|avec les enfants/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      if (/couple|femme|mari|lune|zouj/i.test(m[0])) return { travelers: 2, type: 'couple' };
      if (/famille|enfants|drari/i.test(m[0])) return { travelers: null, type: 'family' };
      if (/zouj/i.test(m[0])) return { travelers: 2, type: 'couple' };
      if (/tlata/i.test(m[0])) return { travelers: 3, type: 'group' };
      if (/rb3a/i.test(m[0])) return { travelers: 4, type: 'group' };
      if (m[1] && wordNums[m[1].toLowerCase()]) return { travelers: wordNums[m[1].toLowerCase()], type: 'group' };
      if (/deux|trois|quatre|cinq|six|sept|huit|neuf|dix/i.test(m[0])) {
        const w = m[0].match(/deux|trois|quatre|cinq|six|sept|huit|neuf|dix/i)[0].toLowerCase();
        return { travelers: wordNums[w], type: 'group' };
      }
      return { travelers: parseInt(m[1], 10), type: 'group' };
    }
  }
  return {};
}

function parseDuration(text) {
  const n = normalizeQuery(text);
  let days = null;
  let nights = null;

  if (/\bune?\s*semaine\b|\b1\s*semaine\b|\bweek\b/.test(n)) days = 7;
  if (/\bweekend\b|\bwe\b|\bfin\s*de\s*semaine\b/.test(n)) days = 2;

  const dayMatch = n.match(/(\d+)\s*(?:j|jr|jrs|jours?|days?|lyali?)/);
  if (dayMatch) {
    const val = parseInt(dayMatch[1], 10);
    if (/lyali|nuits?|n\b/.test(dayMatch[0])) nights = val;
    else days = val;
  }

  const wordDayMatch = n.match(/\b(deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s*(?:jours?|days?)\b/);
  if (wordDayMatch) {
    const map = { deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 };
    days = map[wordDayMatch[1]];
  }

  const nightMatch = n.match(/(\d+)\s*(?:nuits?|nights?|lyali|3lyali)/);
  if (nightMatch) nights = parseInt(nightMatch[1], 10);

  const shortNightMatch = n.match(/(\d+)n\b/);
  if (shortNightMatch) nights = parseInt(shortNightMatch[1], 10);

  const spacedNightMatch = n.match(/(\d+)\s+n\b/);
  if (spacedNightMatch) nights = parseInt(spacedNightMatch[1], 10);

  const shortDayMatch = n.match(/(\d+)j\b/);
  if (shortDayMatch) days = parseInt(shortDayMatch[1], 10);

  const spacedDayMatch = n.match(/(\d+)\s+j\b/);
  if (spacedDayMatch) days = parseInt(spacedDayMatch[1], 10);

  const lyaliMatch = n.match(/(\d+)lyali/);
  if (lyaliMatch) nights = parseInt(lyaliMatch[1], 10);

  const pourMatch = n.match(/(?:pendant|pour)\s*(\d+)\s*(?:jours?|days?|nuits?|nights?)/);
  if (pourMatch) {
    const val = parseInt(pourMatch[1], 10);
    if (/nuits?|nights?/.test(pourMatch[0])) nights = val;
    else days = val;
  }

  return { days, nights };
}

function parseDateRange(text) {
  const patterns = [
    /du\s*(\d{1,2})\s*(?:au|a|→|-)\s*(\d{1,2})/i,
    /(\d{1,2})\s*(?:au|a|→|-)\s*(\d{1,2})/,
    /(\d{1,2})\s*o\s*(\d{1,2})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return { arrivalDay: parseInt(m[1], 10), departureDay: parseInt(m[2], 10) };
  }
  return {};
}

function parseBudget(text) {
  const n = normalizeQuery(text);
  if (/pas cher|economique|cheap|petit budget|low budget/.test(n)) {
    return { budgetLevel: 'economique' };
  }
  if (/luxe|haut de gamme|5 etoiles|5 étoiles/.test(n)) {
    return { budgetLevel: 'luxe' };
  }
  const m = n.match(/(?:budget\s*)?(\d+)\s*(?:k|m|000|da|dzd|dinars?)?/);
  if (m) {
    let amount = parseInt(m[1], 10);
    if (/k|000/.test(m[0]) || amount >= 1000) {
      if (amount < 1000 && /k/.test(m[0])) amount *= 1000;
    }
    if (amount >= 5000) return { budgetAmount: amount };
  }
  return {};
}

function detectIntent(text, entities, rawText = text) {
  const n = normalizeQuery(text);
  const trimmed = n.trim();
  const rawNorm = normalizeQuery(rawText).trim();
  if (isGreetingOnly(trimmed) || isGreetingOnly(rawNorm)) return 'GREETING';
  const greetingParts = trimmed.split(/\s+/).filter(Boolean);
  if (greetingParts.length > 1 && greetingParts.every((t) => GREETING_ONLY_TOKENS.has(t))) return 'GREETING';
  if (isDestinationsAvailabilityQuery(rawNorm) || isDestinationsAvailabilityQuery(n)) return 'DESTINATIONS_AVAILABILITY';
  if (isInfoRequest(n)) return 'INFO_REQUEST';
  if (/humain|agent|conseiller|appelez|appeler|parler a quelqu/.test(n)) return 'CONTACT';
  if (/reflech|reflechi|voir avec|famille d abord|je vais voir/.test(n)) return 'THINKING';
  if (/devis|quote\b/.test(n)) return 'DEVIS';
  if (/acompte/.test(n)) return 'DEPOSIT';
  if (/modif|changer.*date|change.*date|changer la date/.test(n)) return 'MODIFICATION';
  if (/remise|reduction|promo|rabais|prix special|vous faites un prix/.test(n)) return 'DISCOUNT';
  if (/circuit complet/.test(n)) return 'CIRCUIT_COMPLETE';
  if (/^(detail|details|donne details|plus d infos|explique|inclus quoi)\??$/.test(trimmed) || /inclus quoi|cnclu/.test(n)) return 'DETAIL_REQUEST';
  if (/prix par personne|tarif par personne|par pers\b/.test(n) && /prix|tarif|cmb|combien|ch7al/.test(n)) return 'PRICE_PER_PERSON';
  if (/voyage famille|avec les enfants|on vient avec les enfants/.test(n)) return 'FAMILY_TRIP';
  if (/voyage en couple|en couple/.test(n) && !/lune de miel/.test(n)) return 'COUPLE_TRIP';
  if (/transfert aeroport|transfert aero|transfer airport/.test(n)) return 'AIRPORT_TRANSFER';
  if (/^(quad|bateau|boat|kayak|dromadaire|drom|chameau|camel|cheval|equitation)\??$/.test(trimmed)) return 'ACTIVITY_INQUIRY';
  const ackOnly = /^(merci|thx|mrc|ok|okk|oki|dac|dacc|daccord|parfait|c bon|c est bon|oui)(\s*[!?.…]*)$/;
  if (ackOnly.test(trimmed)) return 'ACK';
  if (/^(prix|tarif|cmb|ch7al|combien|px|budget|coute|coûte|c est combien|quel est le prix)\??$/.test(n)) return 'FOLLOWUP_PRICE';
  if (/c est combien|quel est le prix/.test(n) && entities.destination) return 'FOLLOWUP_PRICE';
  if (/^(dispo|disp|disponible)\??$/.test(n) || /^(dispo|disp|disponible)\??$/.test(rawNorm)) return 'FOLLOWUP_AVAILABILITY';
  if (entities.wantsPrice && entities.destination) return 'FOLLOWUP_PRICE';

  // Langage naturel — voyage / projet (incl. abréviations)
  const naturalTrip = /je\s+(?:veux|voudrais|aimerais|souhaite|cherche)|i\s+(?:want|would like|am looking)|bghit|n7eb|nheb|n7ab|jv|jveux|propose|organise|planifie|aide\s+moi|prepare|preparer|partir\s+(?:en|a|à)|envie\s+de\s+(?:partir|visiter)|ndir|ndiro|nroh|nrouh|nzour/.test(n);
  if (naturalTrip && (entities.destination || entities.days || entities.travelers || entities.accommodation)) {
    return 'TRIP_PLANNING';
  }

  if (/vol|avion|aero|ferry|train|bus|taxi|loc voiture|location voiture|transport|comment aller|trajet|comment se rendre|comment faire pour aller/.test(n)) return 'TRANSPORT';
  if (/reserv|resa|book|hajz|حجز|je veux reserver|prendre une reservation/.test(n)) return 'BOOKING';
  if (/programme|itineraire|itinéraire|plan|organiser|que faire|quoi faire/.test(n)) return 'ITINERARY';
  if (/hotel|ht|apt|appart|heberg|logement|villa|camping|ou dormir|where to stay/.test(n)) return 'ACCOMMODATION_SEARCH';
  if (/resto|restaurant|restau|manger|cuisine|ou manger/.test(n)) return 'RESTAURANT_SEARCH';
  if (/quoi faire|qqch|qq chose|truc a faire|visiter|nzour|decouvrir|découvrir|activites|activités/.test(n)) return 'ACTIVITY_SEARCH';
  if (/plage|beach|mer|bord de mer/.test(n)) return 'BEACH_SEARCH';
  if (/activ|quad|4x4|rando|excursion|cheval|kayak|bateau/.test(n)) return 'ACTIVITY_SEARCH';
  if (/voyage|voy|circuit|sejour|safar|siyaha|trip|travel|vacances|partir/.test(n)) return 'TRIP_PLANNING';
  if (/capitale|capital/.test(n) && /alger|algerie|dz/.test(n)) return 'GENERAL_INFORMATION';
  if (/meteo|météo|weather|climat/.test(n)) return 'WEATHER';
  if (/annul/.test(n)) return 'CANCELLATION';
  if (/paiement|payer|carte|paypal/.test(n)) return 'PAYMENT';
  if (entities.destination && !entities.accommodation && !entities.activity && n.length < 28) return 'DESTINATION_SEARCH';
  if (entities.destination) return 'TRIP_PLANNING';
  return 'GENERAL_QUESTION';
}

function extractEntities(raw) {
  const rawText = String(raw || '').trim();
  const text = preprocessMessage(rawText);
  const queryExp = expandQuery(text);
  const { tokens } = queryExp;

  const destination = findDestination(text, tokens);
  const persons = parsePersons(text);
  const duration = parseDuration(text);
  const dates = parseDateRange(text);
  const budget = parseBudget(text);

  let accommodation = null;
  const n = normalizeQuery(text);
  if (/\bmaison\s*d['']?\s*hote\b|\bguesthouse\b|\bmh\b/.test(n)) accommodation = 'guesthouse';
  else if (/\bhotel\b|\bhtl\b|\bht\b|\bhot\b|\bhote\b/.test(n)) accommodation = 'hotel';
  else if (/\bapt\b|\bappart\b|\bappt\b|\bapp\b/.test(n)) accommodation = 'appartement';
  else if (/\bheberg\b|\blogement\b|\blog\b|\bdormir\b/.test(n)) accommodation = 'guesthouse';
  else if (/\bvilla\b/.test(n)) accommodation = 'villa';
  else if (/\bcamping\b|\bcamp\b/.test(n)) accommodation = 'camping';

  let activity = null;
  if (/quad/.test(n)) activity = 'quad';
  else if (/4x4|4wd/.test(n)) activity = '4x4';
  else if (/dromadaire|chameau|camel|drom/.test(n)) activity = 'camel';
  else if (/kayak/.test(n)) activity = 'kayak';
  else if (/bateau|ferry|nav/.test(n)) activity = 'boat';
  else if (/plage|beach/.test(n)) activity = 'beach';

  let interests = [];
  if (/plage|mer|beach/.test(n)) interests.push('plage');
  if (/nature|rando|montagne/.test(n)) interests.push('nature');
  if (/culture|patrimoine|monument|ksar/.test(n)) interests.push('culture');
  if (/aventure|quad|4x4/.test(n)) interests.push('aventure');
  if (/couple|romantique|lune de miel|honeymoon/.test(n)) interests.push('couple');
  if (/famille|enfants|bebe/.test(n)) interests.push('famille');

  const entities = {
    destination,
    accommodation,
    activity,
    interests,
    travelers: persons.travelers,
    travelerType: persons.type,
    days: duration.days,
    nights: duration.nights,
    arrivalDay: dates.arrivalDay,
    departureDay: dates.departureDay,
    budgetLevel: budget.budgetLevel,
    budgetAmount: budget.budgetAmount,
    wantsPrice: /ch7al|chhal|cmb|combien|prix|tarif|px|budget|price|how much|كم|comb\b|c est combien|quel est le prix|ttc\b/.test(n),
    wantsAvailability: /dispo|disp|disponib|disponible|available|kayn|makanch/.test(n),
  };

  if (entities.arrivalDay && entities.departureDay) {
    entities.nights = Math.max(0, entities.departureDay - entities.arrivalDay);
  }

  return { entities, queryExp, intent: detectIntent(text, entities, rawText) };
}

module.exports = {
  normalizeQuery,
  expandQuery,
  preprocessMessage,
  splitCompactMessage,
  detectLanguage,
  extractEntities,
  detectIntent,
  findDestination,
  isGreetingOnly,
  isEveningGreeting,
  isInfoRequest,
  isDestinationsAvailabilityQuery,
  stripGreetingPrefix,
  CITY_ALIASES,
  TOKEN_EXPANSIONS,
};
