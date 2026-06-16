export interface CoreInput {
  text: string;
}

export interface CoreOutput {
  business: number;
  urgency: number;
  fit: number;
  score: number;
  decision: Decision;
  reason: string;
}

export type Decision = 'ACT' | 'WATCH' | 'IGNORE';
export type FeedbackType = 'correct' | 'incorrect' | 'override';
