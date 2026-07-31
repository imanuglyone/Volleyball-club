import { sendMessage, setAppMenuButton } from './bot-api';
import { appInlineKeyboard, appKeyboard } from './keyboards';
import { startMessage } from './messages';
import { helpMessage, listForDate, nextTraining, parseDateInput, statsForDate } from './commands';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/validators';
import { verifyTelegramContactAndClaim } from '@/lib/services/profiles';
import type { TelegramContact } from './types';
import { recordOperationalEvent } from '@/lib/observability';

export type TelegramUpdate = {
  message?: {
    chat?: { id?: number; type?: string };
    from?: { id?: number; first_name?: string };
    text?: string;
    contact?: TelegramContact;
    web_app_data?: unknown;
  };
};

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const chatId = update.message?.chat?.id;
  const contact = update.message?.contact;
  if (chatId && contact) {
    const fromId = update.message?.from?.id;
    if (
      update.message?.chat?.type !== 'private'
      || !fromId
      || contact.user_id !== fromId
    ) {
      recordOperationalEvent('booking_claim', {
        surface: 'telegram',
        outcome: 'error',
        code: 'contact_owner_mismatch',
      });
      return sendMessage(chatId, 'Не удалось подтвердить контакт. Отправьте свой номер кнопкой Telegram.');
    }
    try {
      const result = await verifyTelegramContactAndClaim(
        createSupabaseAdminClient(),
        {
          telegramUserId: fromId,
          phone: contact.phone_number,
          phoneNormalized: normalizePhone(contact.phone_number)
        }
      );
      recordOperationalEvent('booking_claim', {
        surface: 'telegram',
        outcome: result.conflicts > 0 ? 'blocked' : 'success',
        code: result.conflicts > 0 ? 'claim_conflict' : 'contact_verified',
        count: result.claimed,
      });
      return sendMessage(
        chatId,
        result.claimed > 0
          ? `Номер подтверждён. Записей подключено: ${result.claimed}.`
          : 'Номер подтверждён.'
      );
    } catch (error) {
      recordOperationalEvent('booking_claim', {
        surface: 'telegram',
        outcome: 'error',
        code: error instanceof Error ? error.name : 'unknown',
      });
      return sendMessage(
        chatId,
        'Сначала откройте приложение клуба, затем повторите подтверждение номера.',
        appKeyboard()
      );
    }
  }
  const text = update.message?.text?.trim();
  if (!chatId || !text) return;
  const [rawCommand, arg] = text.split(/\s+/, 2);
  const command = rawCommand.split('@')[0];
  if (command === '/start') {
    await setAppMenuButton(chatId);
    return sendMessage(chatId, startMessage(update.message?.from?.first_name), appInlineKeyboard());
  }
  const adminChatId = process.env.TELEGRAM_CHAT_ID;
  const isAdmin = Boolean(adminChatId && String(chatId) === adminChatId);
  if (command !== '/help' && command !== '/start' && !isAdmin) {
    return sendMessage(chatId, 'Запись и управление тренировками доступны в приложении.', appKeyboard());
  }
  if (command === '/next') return sendMessage(chatId, await nextTraining(), appKeyboard());
  if (command === '/help') return sendMessage(chatId, helpMessage, appKeyboard());
  if (command === '/list' || command === '/stats') {
    const date = parseDateInput(arg);
    if (!date) return sendMessage(chatId, 'Укажите дату: YYYY-MM-DD или DD.MM.YYYY', appKeyboard());
    return sendMessage(chatId, command === '/list' ? await listForDate(date) : await statsForDate(date), appKeyboard());
  }
}
