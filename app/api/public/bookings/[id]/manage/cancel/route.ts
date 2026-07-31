import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  cancelManagedBooking,
  managementCookieName
} from '@/lib/services/public-bookings';
import { isSameOrigin } from '@/lib/security';
import {
  PRIVATE_NO_STORE,
  privateJson,
  publicApiError
} from '@/lib/public-api';
import { invalidateTrainingCache } from '@/lib/cache-tags';
import { recordOperationalEvent } from '@/lib/observability';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  recordOperationalEvent('booking_cancel', {
    surface: 'web',
    outcome: 'started',
  });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success || !isSameOrigin(request)) {
    recordOperationalEvent('booking_cancel', {
      surface: 'web',
      outcome: 'error',
      code: 'not_found',
    });
    return privateJson({ error: 'not_found' }, { status: 404 });
  }
  const cookieName = managementCookieName(id);
  const token = request.cookies.get(cookieName)?.value;
  if (!token) {
    recordOperationalEvent('booking_cancel', {
      surface: 'web',
      outcome: 'error',
      code: 'not_found',
    });
    return privateJson({ error: 'not_found' }, { status: 404 });
  }
  try {
    const result = await cancelManagedBooking(
      createSupabaseAdminClient(),
      id,
      token
    );
    if (!result) {
      recordOperationalEvent('booking_cancel', {
        surface: 'web',
        outcome: 'error',
        code: 'not_found',
      });
      return privateJson({ error: 'not_found' }, { status: 404 });
    }
    invalidateTrainingCache(result.trainingId);
    recordOperationalEvent('booking_cancel', {
      surface: 'web',
      outcome: 'success',
    });
    const response = NextResponse.json(
      { ok: true },
      { headers: { 'Cache-Control': PRIVATE_NO_STORE } }
    );
    response.cookies.set({
      name: cookieName,
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });
    return response;
  } catch (error) {
    recordOperationalEvent('booking_cancel', {
      surface: 'web',
      outcome: 'error',
      code: error instanceof Error ? error.name : 'unknown',
    });
    return publicApiError(error);
  }
}
