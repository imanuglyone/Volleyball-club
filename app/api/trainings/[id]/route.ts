import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { PUBLIC_SCHEDULE_CACHE } from '@/lib/public-api';

export const revalidate = 60;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createSupabaseAdminClient();
  const { data: training, error } = await db.from('trainings_stats')
    .select('id,date,start_time,end_time,price,capacity,location_name,address,is_active,remaining,active_bookings,total_bookings')
    .eq('id', id).single();
  if (error || !training) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(
    { ...training, public_bookings: [] },
    { headers: { 'Cache-Control': PUBLIC_SCHEDULE_CACHE } }
  );
}
