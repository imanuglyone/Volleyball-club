import type { TelegramUser } from './types';
import { validateTelegramInitData } from './init-data';

export function authenticateTelegramRequest(request: Request): TelegramUser {
  const initData = request.headers.get('x-telegram-init-data') ?? '';
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('telegram_not_configured');
  const maxAge = Number(process.env.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS ?? 86_400);
  return validateTelegramInitData(initData, token, maxAge).user;
}
