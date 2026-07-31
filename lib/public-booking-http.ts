import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { clientIp } from '@/lib/security';
import { verifyTurnstile } from '@/lib/turnstile';
import { normalizePhone, publicBookingSchema } from '@/lib/validators';
import {
  checkPublicBookingIngressRateLimit,
  createPublicBooking,
  releasePublicBookingRequest,
  reservePublicBookingRequest,
} from '@/lib/services/public-bookings';
import {
  privateJson,
  publicApiError
} from '@/lib/public-api';
import { CURRENT_CONSENT_VERSION } from '@/lib/consent';
import { invalidateTrainingCache } from '@/lib/cache-tags';
import { recordOperationalEvent } from '@/lib/observability';

export async function handlePublicBookingCreate(request: Request) {
  const parsed = publicBookingSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success || parsed.data.website !== '') {
    recordOperationalEvent('booking_create', {
      surface: 'web',
      outcome: 'error',
      code: 'validation',
    });
    return privateJson({ error: 'validation' }, { status: 400 });
  }
  if (parsed.data.consent_version !== CURRENT_CONSENT_VERSION) {
    recordOperationalEvent('booking_create', {
      surface: 'web',
      outcome: 'error',
      code: 'consent_version',
    });
    return privateJson({ error: 'validation' }, { status: 400 });
  }
  recordOperationalEvent('booking_create', {
    surface: 'web',
    outcome: 'started',
  });
  try {
    const ip = clientIp(request);
    const phoneNormalized = normalizePhone(parsed.data.phone);
    const db = createSupabaseAdminClient();
    const bookingInput = {
      trainingId: parsed.data.training_id,
      name: parsed.data.name,
      phone: phoneNormalized,
      phoneNormalized,
      consentVersion: parsed.data.consent_version,
      idempotencyKey: parsed.data.idempotency_key,
    };
    const ingress = await checkPublicBookingIngressRateLimit(db, ip);
    if (!ingress.allowed) {
      recordOperationalEvent('booking_create', {
        surface: 'web',
        outcome: 'error',
        code: 'rate_limited_ingress_ip',
      });
      const response = privateJson({ error: 'rate_limited' }, { status: 429 });
      response.headers.set('Retry-After', String(Math.max(ingress.retryAfter, 1)));
      return response;
    }
    let reservation = await reservePublicBookingRequest(db, bookingInput, { ip });
    if (reservation.status === 'rate_limited') {
      const bucket = reservation.limitedBucket ?? 'unknown';
      recordOperationalEvent('booking_create', {
        surface: 'web',
        outcome: 'error',
        code: `rate_limited_${bucket}`,
      });
      const response = privateJson({ error: 'rate_limited' }, { status: 429 });
      response.headers.set('Retry-After', String(Math.max(reservation.retryAfter, 1)));
      return response;
    }
    if (reservation.status === 'pending') {
      for (const delay of [150, 350, 750] as const) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        reservation = await reservePublicBookingRequest(db, bookingInput, { ip });
        if (reservation.status !== 'pending') break;
      }
    }

    if (reservation.status === 'rate_limited') {
      const bucket = reservation.limitedBucket ?? 'unknown';
      recordOperationalEvent('booking_create', {
        surface: 'web',
        outcome: 'error',
        code: `rate_limited_${bucket}`,
      });
      const response = privateJson({ error: 'rate_limited' }, { status: 429 });
      response.headers.set('Retry-After', String(Math.max(reservation.retryAfter, 1)));
      return response;
    }
    if (reservation.status === 'owner') {
      recordOperationalEvent('api_result', {
        surface: 'web',
        outcome: 'success',
        code: 'rate_allowed_ip_phone_training',
      });
    }

    if (reservation.status === 'pending') {
      recordOperationalEvent('booking_create', {
        surface: 'web',
        outcome: 'blocked',
        code: 'idempotency_pending',
      });
      const response = privateJson({ error: 'conflict' }, { status: 409 });
      response.headers.set('Retry-After', '2');
      return response;
    }

    if (reservation.status === 'owner') {
      if (!await verifyTurnstile(parsed.data.turnstile_token, ip)) {
        await releasePublicBookingRequest(
          db,
          bookingInput,
          reservation.ownerToken!,
        );
        recordOperationalEvent('booking_create', {
          surface: 'web',
          outcome: 'error',
          code: 'turnstile',
        });
        return privateJson({ error: 'unauthorized' }, { status: 403 });
      }
    }

    let result;
    try {
      result = await createPublicBooking(
        db,
        bookingInput,
        reservation.ownerToken,
      );
    } catch (error) {
      if (reservation.status === 'owner' && reservation.ownerToken) {
        await releasePublicBookingRequest(
          db,
          bookingInput,
          reservation.ownerToken,
        ).catch(() => undefined);
      }
      throw error;
    }
    invalidateTrainingCache(parsed.data.training_id);
    recordOperationalEvent('booking_create', {
      surface: 'web',
      outcome: 'success',
      code: result.replayed ? 'replayed' : 'created',
    });
    const origin = new URL(request.url).origin;
    return privateJson({
      booking_id: result.bookingId,
      remaining: result.remaining,
      manage_url: `${origin}/booking/${result.bookingId}#token=${result.token}`
    }, { status: 201 });
  } catch (error) {
    recordOperationalEvent('booking_create', {
      surface: 'web',
      outcome: 'error',
      code: error instanceof Error ? error.name : 'unknown',
    });
    return publicApiError(error);
  }
}
