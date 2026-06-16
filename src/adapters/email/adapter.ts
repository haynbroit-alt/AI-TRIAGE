import { analyze } from '@/core/engine';
import type { CoreOutput } from '@/core/types';

export interface InboundEmail {
  from: string;
  subject: string;
  body: string;
  received_at?: string;
}

export async function triageEmail(email: InboundEmail): Promise<CoreOutput> {
  const text = `De : ${email.from}\nSujet : ${email.subject}\nMessage :\n${email.body}`;
  return analyze({ text });
}
