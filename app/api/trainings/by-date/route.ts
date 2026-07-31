import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { clubDateString } from '@/lib/club-time';
import { PUBLIC_SCHEDULE_CACHE } from '@/lib/public-api';
import { isValidClubDate } from '@/lib/public-training-range';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!isValidClubDate(date)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const today = clubDateString();

  const { data: trainings, error } = await supabase
    .from('trainings_stats')
    .select('id,date,start_time,end_time,price,capacity,location_name,address,is_active,remaining,active_bookings,total_bookings')
    .eq('is_active', true)
    .gte('date', today)
    .eq('date', date)
    .order('start_time');

  if (error) {
    console.error('Trainings date fetch failed', { kind: error.name ?? 'database' });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const response = (trainings ?? []).map((training) => ({
    ...training,
    public_bookings: []
  }));

  return NextResponse.json(response, {
    headers: { 'Cache-Control': PUBLIC_SCHEDULE_CACHE }
  });
}
