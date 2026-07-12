import { sendMessage, setAppMenuButton } from './bot-api';
import { appInlineKeyboard, appKeyboard } from './keyboards';
import { startMessage } from './messages';
import { helpMessage, listForDate, nextTraining, parseDateInput, statsForDate } from './commands';

export type TelegramUpdate = { message?: { chat?: { id?: number }; from?: { first_name?: string }; text?: string; web_app_data?: unknown } };

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const chatId = update.message?.chat?.id;
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
