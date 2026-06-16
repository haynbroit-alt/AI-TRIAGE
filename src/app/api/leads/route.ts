import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const decision = searchParams.get('decision'); // ACT | WATCH | IGNORE
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200);

  const db = getSupabase();
  let query = db
    .from('inbound_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (decision && ['ACT', 'WATCH', 'IGNORE'].includes(decision)) {
    query = query.eq('decision', decision);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
