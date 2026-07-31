import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { miniAppError } from '@/lib/api-error';
import { privateJson } from '@/lib/public-api';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    authenticateTelegramRequest(request);
    const { id } = await params;
    const db = createSupabaseAdminClient();
    const [{ data: training, error }, { data: bookings, error: bookingsError }] =
      await Promise.all([
        db
          .from('trainings_stats')
          .select('id,date,start_time,end_time,price,capacity,location_name,address,is_active,remaining,active_bookings,total_bookings')
          .eq('id', id)
          .maybeSingle(),
        db
          .from('bookings')
          .select('id,name')
          .eq('training_id', id)
          .eq('status', 'active')
          .order('created_at'),
      ]);
    if (error || bookingsError) throw error ?? bookingsError;
    if (!training) {
      return privateJson({ error: 'training_not_found' }, { status: 404 });
    }
    return privateJson({
      training: {
        ...training,
        public_bookings: bookings ?? [],
      },
    });
  } catch (error) {
    return miniAppError(error);
  }
}
