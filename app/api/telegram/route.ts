import { NextResponse } from 'next/server';
import { handleTelegramUpdate, type TelegramUpdate } from '@/lib/telegram/webhook';

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || request.headers.get('x-telegram-bot-api-secret-token') !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const update = await request.json().catch(() => null) as TelegramUpdate | null;
  if (!update) return NextResponse.json({ ok: false }, { status: 400 });
  try { await handleTelegramUpdate(update); }
  catch (error) { console.error('Telegram webhook failed', { kind: error instanceof Error ? error.name : 'unknown' }); }
  return NextResponse.json({ ok: true });
}
