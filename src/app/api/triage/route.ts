import { NextRequest, NextResponse } from 'next/server';
import { extractFeatures } from '@/inbox/llm';
import { scoreLead } from '@/inbox/triage';
import { getSupabase } from '@/lib/supabase';
import { notifySlack } from '@/lib/slack';
import type { InboundEmail } from '@/inbox/types';

export async function POST(req: NextRequest) {
  // Optional webhook secret validation
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const provided = req.headers.get('x-webhook-secret');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let email: InboundEmail;
  try {
    email = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!email.from || !email.subject || !email.body) {
    return NextResponse.json(
      { error: 'Missing required fields: from, subject, body' },
      { status: 422 }
    );
  }

  let features;
  try {
    features = await extractFeatures(email);
  } catch (err) {
    console.error('[triage] LLM extraction failed', err);
    return NextResponse.json({ error: 'Feature extraction failed' }, { status: 500 });
  }

  const result = scoreLead(features);

  // Structured log (the money log — keep it)
  console.log(
    JSON.stringify({
      event: 'triage',
      sender: email.from,
      subject: email.subject,
      features: {
        B: features.business,
        U: features.urgency,
        F: features.fit,
      },
      score: result.score,
      decision: result.decision,
      summary: features.summary,
      timestamp: result.logged_at,
    })
  );

  // Persist to Supabase
  try {
    const db = getSupabase();
    await db.from('inbound_leads').insert({
      sender: email.from,
      subject: email.subject,
      summary: features.summary,
      business: features.business,
      urgency: features.urgency,
      fit: features.fit,
      score: result.score,
      decision: result.decision,
      raw_email: email,
      processed_at: result.logged_at,
    });
  } catch (err) {
    // Log but don't fail the request — the triage result is still valid
    console.error('[triage] Supabase insert failed', err);
  }

  // Alert sales on hot leads
  if (result.decision === 'ACT') {
    const msg = [
      `*[Priorix] ACT — répondre immédiatement*`,
      `*De :* ${email.from}`,
      `*Sujet :* ${email.subject}`,
      `*Résumé :* ${features.summary}`,
      `*Score :* ${result.score}/10  B:${features.business}  U:${features.urgency}  F:${features.fit}`,
    ].join('\n');
    await notifySlack(msg).catch((e) => console.error('[triage] Slack notify failed', e));
  }

  return NextResponse.json(result);
}
