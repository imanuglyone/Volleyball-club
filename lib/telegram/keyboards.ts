function appUrl() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com').replace(/\/$/, '');
  return `${baseUrl}/app`;
}

export function appKeyboard() {
  return {
    keyboard: [[{ text: 'Открыть приложение', web_app: { url: appUrl() } }], [{ text: '/next' }, { text: '/help' }]],
    resize_keyboard: true
  };
}

export function appInlineKeyboard() {
  return { inline_keyboard: [[{ text: 'Открыть приложение', web_app: { url: appUrl() } }]] };
}
