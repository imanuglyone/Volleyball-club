import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { clubDateString, clubLocalDateTimeKey, clubNowIso } from '@/lib/club-time';
import { miniAppError } from '@/lib/api-error';
import { privateJson } from '@/lib/public-api';
import { recordOperationalEvent } from '@/lib/observability';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(
      db,
      authenticateTelegramRequest(request)
    );
    const [bookingsResult, trainingsResult] = await Promise.all([
      db
        .from('bookings')
        .select('id,training_id,status,created_at,trainings(date,start_time,end_time,location_name,address)')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false }),
      db
        .from('trainings_stats')
        .select('id,date,start_time,end_time,price,capacity,location_name,address,is_active,created_at,remaining,active_bookings,total_bookings')
        .eq('is_active', true)
        .gte('date', clubDateString())
        .order('date')
        .order('start_time')
        .limit(20)
    ]);
    if (bookingsResult.error) throw bookingsResult.error;
    if (trainingsResult.error) throw trainingsResult.error;
    const nowKey = clubLocalDateTimeKey();
    const nextTraining = (trainingsResult.data ?? []).find((training) =>
      `${training.date}T${String(training.start_time).slice(0, 8)}` > nowKey
    ) ?? null;
    const bookings = bookingsResult.data ?? [];
    const latency = Date.now() - startedAt;
    recordOperationalEvent('mini_app_bootstrap', {
      surface: 'telegram',
      outcome: 'success',
      latency_ms: latency,
    });
    return privateJson({
      version: 1,
      server_time: clubNowIso(),
      profile,
      next_training: nextTraining,
      bookings_summary: {
        active: bookings.filter((booking) => booking.status === 'active'),
        history: bookings.filter((booking) => booking.status !== 'active')
      },
      bootstrap_ms: latency
    });
  } catch (error) {
    recordOperationalEvent('mini_app_bootstrap', {
      surface: 'telegram',
      outcome: 'error',
      code: error instanceof Error ? error.name : 'unknown',
      latency_ms: Date.now() - startedAt,
    });
    return miniAppError(error);
  }
}
