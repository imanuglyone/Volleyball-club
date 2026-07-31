import { authenticateTelegramRequest } from '@/lib/telegram/server-auth';
import { sendMessage } from '@/lib/telegram/bot-api';
import { contactRequestKeyboard } from '@/lib/telegram/keyboards';
import { miniAppError } from '@/lib/api-error';
import { privateJson } from '@/lib/public-api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = authenticateTelegramRequest(request);
    await sendMessage(
      user.id,
      'Подтвердите свой номер кнопкой ниже. Telegram передаст только ваш собственный контакт.',
      contactRequestKeyboard()
    );
    return privateJson({ ok: true });
  } catch (error) {
    return miniAppError(error);
  }
}
