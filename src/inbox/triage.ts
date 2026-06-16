import type { EmailFeatures, Decision, TriageResult } from './types';

// Seuils sur l'échelle 0–10
const THRESHOLDS = { ACT: 8, WATCH: 5 } as const;

export function scoreLead(features: EmailFeatures): TriageResult {
  const score = (features.business + features.urgency + features.fit) / 3;

  let decision: Decision;
  if (score >= THRESHOLDS.ACT) decision = 'ACT';
  else if (score >= THRESHOLDS.WATCH) decision = 'WATCH';
  else decision = 'IGNORE';

  return {
    features,
    score: Number(score.toFixed(2)),
    decision,
    logged_at: new Date().toISOString(),
  };
}
