import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const FEEDBACK_TYPES = ['correct', 'incorrect', 'override'] as const;
const DECISIONS = ['ACT', 'WATCH', 'IGNORE'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { feedback_type?: unknown; feedback_override?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { feedback_type, feedback_override } = body;
  if (!FEEDBACK_TYPES.includes(feedback_type as any)) {
    return NextResponse.json({ error: 'feedback_type must be correct, incorrect, or override' }, { status: 422 });
  }
  if (feedback_type === 'override' && !DECISIONS.includes(feedback_override as any)) {
    return NextResponse.json({ error: 'feedback_override required for override type' }, { status: 422 });
  }

  const update: Record<string, unknown> = {
    feedback_type,
    feedback_at: new Date().toISOString(),
    feedback_override: feedback_type === 'override' ? feedback_override : null,
  };

  const db = getSupabase();
  const { error } = await db.from('inbound_leads').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  console.log(JSON.stringify({ event: 'feedback', id, feedback_type, feedback_override: update.feedback_override, timestamp: update.feedback_at }));
  return NextResponse.json({ id, feedback_type, feedback_override: update.feedback_override });
}
