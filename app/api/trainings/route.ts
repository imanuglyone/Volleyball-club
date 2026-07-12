import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { todayDateString } from '@/lib/format';

function isDateString(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!isDateString(from) || !isDateString(to)) {
    return NextResponse.json({ error: 'invalid_range' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const today = todayDateString();

  const { data, error } = await supabase
    .from('trainings_stats')
    .select('*')
    .eq('is_active', true)
    .gte('date', today)
    .gte('date', from)
    .lte('date', to)
    .order('date')
    .order('start_time');

  if (error) {
    console.error('Trainings range fetch failed', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
