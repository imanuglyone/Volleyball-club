import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isSameOrigin } from '@/lib/security';
import { managementExchangeSchema } from '@/lib/validators';
import {
  exchangeManagementToken,
  managementCookieName,
  MANAGEMENT_TOKEN_TTL_MS
} from '@/lib/services/public-bookings';
import { PRIVATE_NO_STORE, privateJson, publicApiError } from '@/lib/public-api';

export async function exchangeManagementRequest(
  request: Request,
  db: SupabaseClient,
  bookingId: string
) {
  if (!isSameOrigin(request)) {
    return privateJson({ error: 'not_found' }, { status: 404 });
  }
  const parsed = managementExchangeSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return privateJson({ error: 'validation' }, { status: 400 });
  }
  try {
    const result = await exchangeManagementToken(db, bookingId, parsed.data.token);
    if (!result) return privateJson({ error: 'not_found' }, { status: 404 });
    const response = new NextResponse(null, {
      status: 204,
      headers: { 'Cache-Control': PRIVATE_NO_STORE }
    });
    response.cookies.set({
      name: managementCookieName(bookingId),
      value: result.replacementToken,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(MANAGEMENT_TOKEN_TTL_MS / 1000),
      expires: new Date(result.expiresAt)
    });
    return response;
  } catch (error) {
    return publicApiError(error);
  }
}

