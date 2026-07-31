import { NextResponse } from 'next/server';
import { PRIVATE_NO_STORE } from '@/lib/public-api';

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': PRIVATE_NO_STORE }
  });
}

export function miniAppError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
      ? error.message
      : String(error ?? '');
  if (message.includes('telegram_')) return noStoreJson({ error: message }, 401);
  if (message.includes('consent_required')) return noStoreJson({ error: 'validation' }, 400);
  if (message.includes('phone_invalid')) return noStoreJson({ error: 'validation' }, 400);
  if (message.includes('phone_not_verified')) return noStoreJson({ error: 'phone_not_verified' }, 409);
  const conflict = ['booking_duplicate', 'booking_full', 'training_inactive', 'training_past', 'training_not_found']
    .find((code) => message.includes(code));
  if (conflict) return noStoreJson({ error: conflict }, 409);
  console.error('Mini App request failed', { kind: error instanceof Error ? error.name : 'unknown' });
  return noStoreJson({ error: 'server_error' }, 500);
}
