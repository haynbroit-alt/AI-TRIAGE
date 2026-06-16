import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const VALID: string[] = ['ACT', 'WATCH', 'IGNORE'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { feedback?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const feedback = body.feedback;
  if (typeof feedback !== 'string' || !VALID.includes(feedback)) {
    return NextResponse.json(
      { error: 'feedback must be ACT, WATCH, or IGNORE' },
      { status: 422 }
    );
  }

  const db = getSupabase();
  const { error } = await db
    .from('inbound_leads')
    .update({ feedback, feedback_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(JSON.stringify({ event: 'feedback', id, feedback, timestamp: new Date().toISOString() }));

  return NextResponse.json({ id, feedback });
}
