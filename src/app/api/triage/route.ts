import { NextRequest, NextResponse } from 'next/server';
import { triageEmail } from '@/adapters/email/adapter';
import type { InboundEmail } from '@/adapters/email/adapter';
import { getSupabase } from '@/lib/supabase';
import { notifySlack } from '@/lib/slack';

const FREE_DAILY_LIMIT = Number(process.env.FREE_DAILY_LIMIT ?? 10);

async function checkRateLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const db = getSupabase();
  const { data: count } = await db.rpc('try_increment_usage', {
    p_user_id: userId,
    p_limit: FREE_DAILY_LIMIT,
  });

  if (count === null || count === undefined) {
    return { allowed: false, count: FREE_DAILY_LIMIT };
  }
  return { allowed: true, count };
}

export async function POST(req: NextRequest) {
  // Webhook secret validation
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const provided = req.headers.get('x-webhook-secret');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // User identification — Gmail Add-on envoie x-user-id, sinon fallback IP
  const userId =
    req.headers.get('x-user-id')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'anonymous';

  // Rate limit check
  const { allowed, count } = await checkRateLimit(userId);
  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Limite journalière atteinte.',
        limit: FREE_DAILY_LIMIT,
        used: FREE_DAILY_LIMIT,
        remaining: 0,
        reset: 'minuit UTC',
      },
      { status: 429 }
    );
  }

  const remaining = FREE_DAILY_LIMIT - count;

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

  let result;
  try {
    result = await triageEmail(email);
  } catch (err) {
    console.error('[triage] LLM extraction failed', err);
    return NextResponse.json({ error: 'Feature extraction failed' }, { status: 500 });
  }

  const logged_at = new Date().toISOString();

  console.log(
    JSON.stringify({
      event: 'triage',
      user_id: userId,
      sender: email.from,
      subject: email.subject,
      features: { B: result.business, U: result.urgency, F: result.fit },
      score: result.score,
      decision: result.decision,
      reason: result.reason,
      usage: { count, limit: FREE_DAILY_LIMIT, remaining },
      timestamp: logged_at,
    })
  );

  try {
    const db = getSupabase();
    await db.from('inbound_leads').insert({
      sender: email.from,
      subject: email.subject,
      reason: result.reason,
      business: result.business,
      urgency: result.urgency,
      fit: result.fit,
      score: result.score,
      decision: result.decision,
      raw_email: email,
      processed_at: logged_at,
    });
  } catch (err) {
    console.error('[triage] Supabase insert failed', err);
  }

  if (result.decision === 'ACT') {
    const msg = [
      `*[Priorix] ACT — répondre immédiatement*`,
      `*De :* ${email.from}`,
      `*Sujet :* ${email.subject}`,
      `*Résumé :* ${result.reason}`,
      `*Score :* ${result.score}/10  B:${result.business}  U:${result.urgency}  F:${result.fit}`,
    ].join('\n');
    await notifySlack(msg).catch((e) => console.error('[triage] Slack notify failed', e));
  }

  return NextResponse.json({
    ...result,
    usage: { count, limit: FREE_DAILY_LIMIT, remaining },
  });
}
