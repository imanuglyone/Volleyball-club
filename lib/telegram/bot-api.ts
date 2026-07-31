import { appUrl } from './keyboards';

export type ReplyMarkup = Record<string, unknown>;

export async function callTelegram(method: string, payload: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('telegram_bot_not_configured');
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    console.error('Telegram Bot API request failed', { method, status: response.status });
    throw new Error('telegram_api_failed');
  }
}

export function sendMessage(chatId: number, text: string, replyMarkup?: ReplyMarkup) {
  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {})
  });
}

export function setAppMenuButton(chatId?: number) {
  if (!process.env.NEXT_PUBLIC_APP_URL) return Promise.resolve();
  return callTelegram('setChatMenuButton', {
    ...(chatId ? { chat_id: chatId } : {}),
    menu_button: {
      type: 'web_app',
      text: 'Открыть приложение',
      web_app: { url: appUrl() }
    }
  });
}
