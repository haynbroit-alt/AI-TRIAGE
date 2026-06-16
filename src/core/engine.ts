import OpenAI from 'openai';
import { score } from './scorer';
import type { CoreInput, CoreOutput } from './types';

const SYSTEM_PROMPT = `Tu es Priorix, un moteur de décision pour flux entrants.

Analyse le message et retourne uniquement du JSON valide.

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

const SAFE_IGNORE: CoreOutput = {
  business: 0,
  urgency: 0,
  fit: 0,
  score: 0,
  decision: 'IGNORE',
  reason: 'Analyse impossible — décision de sécurité par défaut.',
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function clamp(v: number): number {
  return Math.max(0, Math.min(10, v));
}

async function callModel(text: string): Promise<CoreOutput> {
  const response = await client.chat.completions.create({
    model: 'gpt-4.1',
    max_tokens: 256,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
  });

  const content = response.choices[0]?.message?.content ?? '';
  const raw = JSON.parse(content);

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

export async function analyze(input: CoreInput): Promise<CoreOutput> {
  try {
    return await callModel(input.text);
  } catch {
    // 1 retry — même modèle, même logique
    try {
      return await callModel(input.text);
    } catch {
      // Safe default : IGNORE plutôt que crash
      return SAFE_IGNORE;
    }
  }
}
