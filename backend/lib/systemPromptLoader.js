const fs = require('fs');
const path = require('path');

const PROMPT_FILE = path.join(__dirname, 'prompts', 'algeria-travel-system.prompt.md');
const CLIENT_PROMPT_FILE = path.join(__dirname, 'prompts', 'algeria-travel-client-instructions.prompt.md');

/** Règles essentielles (fallback si aucun fichier prompt) */
const CORE_SYSTEM_RULES = `
Tu es l'assistant virtuel officiel de Algeria Travel.

OBJECTIF : comprendre la demande, identifier destination/dates/voyageurs/prestations, répondre clairement, ne demander que ce qui manque, orienter vers un conseiller si nécessaire.

RÈGLES ABSOLUES :
- Ne jamais inventer prix, disponibilité, hôtel, adresse, téléphone, horaires, programme, réduction, activité, transport ni confirmer une réservation sans validation réelle.
- Utiliser uniquement le catalogue fourni pour les tarifs officiels.
- Comprendre abréviations SMS, darija, arabe, anglais et fautes de frappe.
- Style : professionnel, chaleureux, simple, naturel, rassurant — réponses courtes si question courte.
- Ne pas poser 10 questions à la fois ; priorité : destination → dates → voyageurs → prestation.
- Ne pas redemander une information déjà fournie.
- Nuits = date départ − date arrivée. Prix total = unitaire × quantité si applicable.
- Paiement : jamais demander mot de passe, CVV, carte complète ou OTP dans le chat.
- Langue : répondre dans la langue du client (fr, darija, ar, en).
`.trim();

function loadFullPromptFile() {
  for (const file of [CLIENT_PROMPT_FILE, PROMPT_FILE]) {
    try {
      if (fs.existsSync(file)) {
        return fs.readFileSync(file, 'utf8').trim();
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function buildSystemPrompt(lang, catalogAppendix = '') {
  const fullFile = loadFullPromptFile();
  const base = fullFile || CORE_SYSTEM_RULES;

  const langInstruction = lang === 'en'
    ? 'Respond primarily in English unless the user writes in French, Arabic or Darija — then match their language.'
    : lang === 'ar'
      ? 'Répondez principalement en arabe sauf si l\'utilisateur écrit en français, darija ou anglais — adaptez-vous.'
      : 'Répondez principalement en français ; acceptez darija, arabe et anglais selon l\'utilisateur.';

  return [
    base,
    '',
    '---',
    langInstruction,
    '',
    'DONNÉES CATALOGUE ALGERIA TRAVEL (priorité absolue pour prix et offres) :',
    catalogAppendix,
  ].join('\n');
}

module.exports = { buildSystemPrompt, CORE_SYSTEM_RULES, PROMPT_FILE };
