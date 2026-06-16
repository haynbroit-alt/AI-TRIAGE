export interface InboundEmail {
  from: string;
  subject: string;
  body: string;
  received_at?: string;
}

export interface EmailFeatures {
  business: number;  // 0–10 : valeur commerciale potentielle
  urgency: number;   // 0–10 : vitesse d'action requise
  fit: number;       // 0–10 : adéquation avec l'offre
  summary: string;   // ≤ 20 mots
}

export type Decision = 'ACT' | 'WATCH' | 'IGNORE';

export interface TriageResult {
  features: EmailFeatures;
  score: number;       // moyenne brute 0–10
  decision: Decision;
  logged_at: string;
}

export interface LeadRecord {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  business: number;
  urgency: number;
  fit: number;
  score: number;
  decision: Decision;
  feedback: Decision | null;
  feedback_at: string | null;
  raw_email: InboundEmail;
  created_at: string;
  processed_at: string | null;
}
