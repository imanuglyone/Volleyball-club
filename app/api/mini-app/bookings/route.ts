import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { upsertTelegramProfile } from '@/lib/services/profiles';
import { createProfileBookingV2, listProfileBookings } from '@/lib/services/bookings';
import { miniAppBookingSchema, normalizePhone, profileSchema } from '@/lib/validators';
import { miniAppError } from '@/lib/api-error';
import { privateJson } from '@/lib/public-api';
import { CURRENT_CONSENT_VERSION } from '@/lib/consent';
import { invalidateTrainingCache } from '@/lib/cache-tags';
import { recordOperationalEvent } from '@/lib/observability';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const { data, error } = await listProfileBookings(db, profile.id);
    if (error) throw error;
    return privateJson({ bookings: data ?? [] });
  } catch (error) { return miniAppError(error); }
}

export async function POST(request: Request) {
  recordOperationalEvent('booking_create', {
    surface: 'telegram',
    outcome: 'started',
  });
  try {
    const db = createSupabaseAdminClient();
    const profile = await upsertTelegramProfile(db, authenticateTelegramRequest(request));
    const body: unknown = await request.json().catch(() => null);
    const booking = miniAppBookingSchema.safeParse(body);
    if (!booking.success) {
      recordOperationalEvent('booking_create', {
        surface: 'telegram',
        outcome: 'error',
        code: 'validation',
      });
      return privateJson({ error: 'validation' }, { status: 400 });
    }
    if (booking.data.consent_version !== CURRENT_CONSENT_VERSION) {
      recordOperationalEvent('booking_create', {
        surface: 'telegram',
        outcome: 'error',
        code: 'consent_version',
      });
      return privateJson({ error: 'validation' }, { status: 400 });
    }
    const raw = body as Record<string, unknown>;
    const details = profileSchema.safeParse({ display_name: raw.display_name ?? profile.display_name, phone: raw.phone ?? profile.phone });
    if (!details.success) {
      recordOperationalEvent('booking_create', {
        surface: 'telegram',
        outcome: 'error',
        code: 'profile_required',
      });
      return privateJson({ error: 'profile_required' }, { status: 400 });
    }
    const { data, error } = await createProfileBookingV2(db, {
      trainingId: booking.data.training_id, profileId: profile.id,
      name: details.data.display_name, phone: normalizePhone(details.data.phone),
      consentVersion: booking.data.consent_version
    });
    if (error) throw error;
    invalidateTrainingCache(booking.data.training_id);
    recordOperationalEvent('booking_create', {
      surface: 'telegram',
      outcome: 'success',
    });
    return privateJson({ ok: true, booking_id: data?.[0]?.booking_id, remaining: data?.[0]?.remaining });
  } catch (error) {
    recordOperationalEvent('booking_create', {
      surface: 'telegram',
      outcome: 'error',
      code: error instanceof Error ? error.name : 'unknown',
    });
    return miniAppError(error);
  }
}
