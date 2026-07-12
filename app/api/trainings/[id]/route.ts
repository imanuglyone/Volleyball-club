import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = createSupabaseAdminClient();
  const { data: training, error } = await db.from('trainings_stats').select('*').eq('id', params.id).single();
  if (error || !training) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { data: bookings } = await db.from('bookings').select('id,name').eq('training_id', params.id).eq('status', 'active').order('created_at');
  return NextResponse.json(
    { ...training, public_bookings: bookings ?? [] },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
