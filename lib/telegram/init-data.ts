import { createHmac, timingSafeEqual } from 'node:crypto';
import type { TelegramUser } from './types';

export type VerifiedTelegramData = { user: TelegramUser; authDate: number; queryId?: string };

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86_400,
  nowSeconds = Math.floor(Date.now() / 1000)
): VerifiedTelegramData {
  if (!initData || !botToken) throw new Error('telegram_auth_missing');
  const params = new URLSearchParams(initData);
  const receivedHash = params.get('hash');
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) throw new Error('telegram_auth_invalid');
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secretKey).update(dataCheckString).digest();
  const received = Buffer.from(receivedHash, 'hex');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new Error('telegram_auth_invalid');
  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || authDate > nowSeconds + 30 || nowSeconds - authDate > maxAgeSeconds) {
    throw new Error('telegram_auth_expired');
  }
  const rawUser = params.get('user');
  if (!rawUser) throw new Error('telegram_user_missing');
  const user = JSON.parse(rawUser) as TelegramUser;
  if (!Number.isSafeInteger(user.id) || user.id <= 0 || !user.first_name) throw new Error('telegram_user_invalid');
  return { user, authDate, queryId: params.get('query_id') ?? undefined };
}
