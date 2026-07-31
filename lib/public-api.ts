import { NextResponse } from 'next/server';

export const PRIVATE_NO_STORE = 'private, no-store, max-age=0';
export const PUBLIC_SCHEDULE_CACHE = 'public, s-maxage=60, stale-while-revalidate=300';

export type StableErrorCode =
  | 'validation'
  | 'unauthorized'
  | 'expired'
  | 'booking_duplicate'
  | 'booking_full'
  | 'training_inactive'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server_error';

export function privateJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', PRIVATE_NO_STORE);
  return response;
}

export function publicApiError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : '';
  const mappings: Array<[string, StableErrorCode, number]> = [
    ['phone_invalid', 'validation', 400],
    ['idempotency_conflict', 'conflict', 409],
    ['reservation_lost', 'conflict', 409],
    ['booking_duplicate', 'booking_duplicate', 409],
    ['booking_full', 'booking_full', 409],
    ['training_inactive', 'training_inactive', 409],
    ['training_past', 'training_inactive', 409],
    ['training_not_found', 'not_found', 404]
  ];
  const match = mappings.find(([needle]) => message.includes(needle));
  if (match) return privateJson({ error: match[1] }, { status: match[2] });
  console.error('Public API request failed', {
    kind: error instanceof Error ? error.name : 'unknown'
  });
  return privateJson({ error: 'server_error' }, { status: 500 });
}
