import { NextResponse } from 'next/server';

export function miniAppError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (message.includes('telegram_')) return NextResponse.json({ error: message }, { status: 401 });
  const conflict = ['booking_duplicate', 'booking_full', 'training_inactive', 'training_past', 'training_not_found']
    .find((code) => message.includes(code));
  if (conflict) return NextResponse.json({ error: conflict }, { status: 409 });
  console.error('Mini App request failed', { kind: error instanceof Error ? error.name : 'unknown' });
  return NextResponse.json({ error: 'server_error' }, { status: 500 });
}
