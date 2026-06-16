export type { Decision, FeedbackType } from '@/core/types';

export interface LeadRecord {
  id: string;
  sender: string;
  subject: string;
  reason: string;
  business: number;
  urgency: number;
  fit: number;
  score: number;
  decision: import('@/core/types').Decision;
  feedback_type: import('@/core/types').FeedbackType | null;
  feedback_override: import('@/core/types').Decision | null;
  feedback_at: string | null;
  raw_email: object;
  created_at: string;
  processed_at: string | null;
}
