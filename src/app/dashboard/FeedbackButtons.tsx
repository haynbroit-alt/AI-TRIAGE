'use client';

import { useState } from 'react';
import type { FeedbackType, Decision } from '@/inbox/types';
import styles from './dashboard.module.css';

type OverrideDecision = 'ACT' | 'WATCH' | 'IGNORE';

export function FeedbackButtons({
  leadId,
  feedbackType,
  feedbackOverride,
}: {
  leadId: string;
  feedbackType: FeedbackType | null;
  feedbackOverride: Decision | null;
}) {
  const [currentType, setCurrentType] = useState<FeedbackType | null>(feedbackType);
  const [currentOverride, setCurrentOverride] = useState<OverrideDecision | null>(
    feedbackOverride as OverrideDecision | null
  );
  const [saving, setSaving] = useState(false);

  async function submit(type: FeedbackType, override?: OverrideDecision) {
    if (saving) return;
    setSaving(true);
    try {
      const body: { feedback_type: FeedbackType; feedback_override?: OverrideDecision } = {
        feedback_type: type,
      };
      if (type === 'override' && override) {
        body.feedback_override = override;
      }
      await fetch(`/api/leads/${leadId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setCurrentType(type);
      setCurrentOverride(type === 'override' ? (override ?? null) : null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.feedbackGroup}>
      <button
        onClick={() => submit('correct')}
        disabled={saving}
        className={`${styles.feedbackBtn} ${currentType === 'correct' ? styles.feedbackActiveCorrect : ''}`}
        title="Correct"
      >
        &#10003;
      </button>
      <button
        onClick={() => submit('incorrect')}
        disabled={saving}
        className={`${styles.feedbackBtn} ${currentType === 'incorrect' ? styles.feedbackActiveIncorrect : ''}`}
        title="Incorrect"
      >
        &#10007;
      </button>
      <span className={styles.feedbackSep} />
      {(['ACT', 'WATCH', 'IGNORE'] as OverrideDecision[]).map((opt) => (
        <button
          key={opt}
          onClick={() => submit('override', opt)}
          disabled={saving}
          className={`${styles.feedbackBtn} ${styles.feedbackBtnOverride} ${currentType === 'override' && currentOverride === opt ? styles[`feedbackActiveOverride${opt}`] : ''}`}
          title={`Override: ${opt}`}
        >
          {opt[0]}
        </button>
      ))}
    </div>
  );
}
