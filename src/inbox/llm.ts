import Anthropic from '@anthropic-ai/sdk';
import type { EmailFeatures, InboundEmail } from './types';

const SYSTEM_PROMPT = `Tu es un moteur de triage commercial.

Analyse l'email et retourne UNIQUEMENT du JSON valide, sans texte autour.

Attribue :
- business : note de 0 à 10 (valeur commerciale potentielle)
- urgency  : note de 0 à 10 (vitesse d'action requise)
- fit      : note de 0 à 10 (adéquation avec notre offre)
- summary  : résumé en une phrase (maximum 20 mots)

Format de sortie strict :
{
  "business": 0,
  "urgency": 0,
  "fit": 0,
  "summary": ""
}`;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function clamp(v: number): number {
  return Math.max(0, Math.min(10, v));
}

export async function extractFeatures(email: InboundEmail): Promise<EmailFeatures> {
  const userContent = [
    `De : ${email.from}`,
    `Sujet : ${email.subject}`,
    `Message :\n${email.body}`,
  ].join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`LLM did not return valid JSON. Raw: ${text}`);
  }

  const raw = JSON.parse(jsonMatch[0]);

  return {
    business: clamp(Number(raw.business ?? 0)),
    urgency: clamp(Number(raw.urgency ?? 0)),
    fit: clamp(Number(raw.fit ?? 0)),
    summary: String(raw.summary ?? '').slice(0, 200),
  };
}
