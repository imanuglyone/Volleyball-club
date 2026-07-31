import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { PUBLIC_SCHEDULE_CACHE } from '@/lib/public-api';
import {
  isValidClubDate,
  normalizePublicTrainingRange,
} from '@/lib/public-training-range';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedFrom = searchParams.get('from');
  const requestedTo = searchParams.get('to');

  if (
    !isValidClubDate(requestedFrom)
    || !isValidClubDate(requestedTo)
    || requestedTo < requestedFrom
  ) {
    return NextResponse.json({ error: 'invalid_range' }, { status: 400 });
  }
  const { from, to } = normalizePublicTrainingRange(
    requestedFrom,
    requestedTo,
  );

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('trainings_stats')
    .select('id,date,start_time,end_time,price,capacity,location_name,address,is_active,remaining,active_bookings,total_bookings')
    .eq('is_active', true)
    .gte('date', from)
    .lte('date', to)
    .order('date')
    .order('start_time');

  if (error) {
    console.error('Trainings range fetch failed', { kind: error.name ?? 'database' });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': PUBLIC_SCHEDULE_CACHE }
  });
}
