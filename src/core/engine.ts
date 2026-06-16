import Anthropic from '@anthropic-ai/sdk';
import { score } from './scorer';
import type { CoreInput, CoreOutput } from './types';

const SYSTEM_PROMPT = `Tu es Priorix, un moteur de décision pour flux entrants.

Analyse le message et retourne UNIQUEMENT du JSON valide.

Évalue :
- business : valeur business potentielle (0–10)
- urgency  : vitesse d'action requise (0–10)
- fit      : pertinence pour le destinataire (0–10)
- reason   : explication courte et compréhensible (maximum 20 mots)

Format strict :
{
  "business": 0,
  "urgency": 0,
  "fit": 0,
  "reason": ""
}`;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function clamp(v: number): number {
  return Math.max(0, Math.min(10, v));
}

export async function analyze(input: CoreInput): Promise<CoreOutput> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: input.text }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`LLM returned no JSON. Raw: ${text}`);

  const raw = JSON.parse(match[0]);
  const b = clamp(Number(raw.business ?? 0));
  const u = clamp(Number(raw.urgency ?? 0));
  const f = clamp(Number(raw.fit ?? 0));
  const { score: s, decision } = score(b, u, f);

  return {
    business: b,
    urgency: u,
    fit: f,
    score: s,
    decision,
    reason: String(raw.reason ?? '').slice(0, 200),
  };
}
