'use client';

import { useState } from 'react';
import type { Decision } from '@/inbox/types';
import styles from './dashboard.module.css';

const OPTIONS: Decision[] = ['ACT', 'WATCH', 'IGNORE'];

export function FeedbackButtons({
  leadId,
  initial,
}: {
  leadId: string;
  initial: Decision | null;
}) {
  const [current, setCurrent] = useState<Decision | null>(initial);
  const [saving, setSaving] = useState(false);

  async function submit(feedback: Decision) {
    if (saving) return;
    const next = current === feedback ? null : feedback;
    setSaving(true);
    try {
      await fetch(`/api/leads/${leadId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: next ?? feedback }),
      });
      setCurrent(next ?? feedback);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.feedbackGroup}>
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => submit(opt)}
          disabled={saving}
          className={`${styles.feedbackBtn} ${current === opt ? styles[`feedbackActive${opt}`] : ''}`}
          title={`Marquer comme ${opt}`}
        >
          {opt[0]}
        </button>
      ))}
    </div>
  );
}
