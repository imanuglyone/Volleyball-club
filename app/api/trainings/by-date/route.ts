import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { todayDateString } from '@/lib/format';
import type { TrainingStats } from '@/lib/types';

function isDateString(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!isDateString(date)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const today = todayDateString();

  const { data: trainings, error } = await supabase
    .from('trainings_stats')
    .select('*')
    .eq('is_active', true)
    .gte('date', today)
    .eq('date', date)
    .order('start_time');

  if (error) {
    console.error('Trainings date fetch failed', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const trainingList = (trainings ?? []) as TrainingStats[];
  const trainingIds = trainingList.map((item) => item.id);

  if (trainingIds.length === 0) {
    return NextResponse.json([]);
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, training_id, name')
    .eq('status', 'active')
    .in('training_id', trainingIds)
    .order('created_at');

  if (bookingsError) {
    console.error('Bookings fetch failed', bookingsError);
  }

  const grouped = new Map<string, { id: string; name: string }[]>();
  (bookings ?? []).forEach((booking) => {
    if (!grouped.has(booking.training_id)) {
      grouped.set(booking.training_id, []);
    }
    grouped.get(booking.training_id)?.push({ id: booking.id, name: booking.name });
  });

  const response = trainingList.map((training) => ({
    ...training,
    public_bookings: grouped.get(training.id) ?? []
  }));

  return NextResponse.json(response);
}
