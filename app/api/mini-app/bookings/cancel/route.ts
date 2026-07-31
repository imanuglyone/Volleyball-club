import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { cancelProfileBooking } from '@/lib/services/bookings';
import { cancelBookingSchema } from '@/lib/validators';
import { miniAppError } from '@/lib/api-error';
import { privateJson } from '@/lib/public-api';
import { invalidateTrainingCache } from '@/lib/cache-tags';
import { recordOperationalEvent } from '@/lib/observability';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  recordOperationalEvent('booking_cancel', {
    surface: 'telegram',
    outcome: 'started',
  });
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const parsed = cancelBookingSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      recordOperationalEvent('booking_cancel', {
        surface: 'telegram',
        outcome: 'error',
        code: 'validation',
      });
      return privateJson({ error: 'validation' }, { status: 400 });
    }
    const { data: existing, error: lookupError } = await db
      .from('bookings')
      .select('training_id')
      .eq('id', parsed.data.booking_id)
      .eq('profile_id', profile.id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    const { data, error } = await cancelProfileBooking(db, parsed.data.booking_id, profile.id);
    if (error) throw error;
    if (!data) {
      recordOperationalEvent('booking_cancel', {
        surface: 'telegram',
        outcome: 'error',
        code: 'booking_not_found',
      });
      return privateJson({ error: 'booking_not_found' }, { status: 404 });
    }
    if (existing?.training_id) invalidateTrainingCache(existing.training_id);
    recordOperationalEvent('booking_cancel', {
      surface: 'telegram',
      outcome: 'success',
    });
    return privateJson({ ok: true });
  } catch (error) {
    recordOperationalEvent('booking_cancel', {
      surface: 'telegram',
      outcome: 'error',
      code: error instanceof Error ? error.name : 'unknown',
    });
    return miniAppError(error);
  }
}
