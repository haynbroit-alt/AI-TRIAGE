/**
 * Quick smoke test — run with:
 *   npx tsx scripts/test-triage.ts
 *
 * Requires ANTHROPIC_API_KEY in env (or .env.local loaded via dotenv).
 */

import { extractFeatures } from '../src/inbox/llm';
import { scoreLead } from '../src/inbox/triage';

const SAMPLE_EMAILS = [
  {
    from: 'dg@acme-corp.com',
    subject: 'Besoin urgent d\'automatisation commerciale — budget validé',
    body: `Bonjour,
Je dirige une équipe de 12 commerciaux. Nous perdons trop de temps à qualifier nos leads entrants.
Budget : 500 €/mois. Nous voulons démarrer avant fin juillet.
Pouvez-vous nous proposer une démo cette semaine ?`,
  },
  {
    from: 'random@gmail.com',
    subject: 'Partenariat',
    body: 'Bonjour, je voulais voir si vous étiez intéressés par un partenariat. Merci.',
  },
  {
    from: 'ops@startup-seed.io',
    subject: 'Question sur votre solution',
    body: `Nous sommes une startup de 8 personnes. Nous recevons une cinquantaine de leads par semaine et avons du mal à les traiter. On cherche une solution dans les 2 prochains mois. Vous faites quoi exactement ?`,
  },
];

async function main() {
  for (const email of SAMPLE_EMAILS) {
    console.log(`\n--- ${email.from} ---`);
    const features = await extractFeatures(email);
    const result = scoreLead(features);
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
