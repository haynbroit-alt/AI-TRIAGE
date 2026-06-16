import type { CoreOutput, Decision } from './types';

export function score(b: number, u: number, f: number): { score: number; decision: Decision } {
  const s = (b + u + f) / 3;
  let decision: Decision;
  if (s >= 8) decision = 'ACT';
  else if (s >= 5) decision = 'WATCH';
  else decision = 'IGNORE';
  return { score: Number(s.toFixed(2)), decision };
}
