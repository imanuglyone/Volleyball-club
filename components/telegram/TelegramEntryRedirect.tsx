'use client';

import { useEffect } from 'react';

export function TelegramEntryRedirect() {
  useEffect(() => {
    const isMiniApp = Boolean(window.Telegram?.WebApp?.initData) || window.location.hash.includes('tgWebAppData');
    if (isMiniApp && window.location.pathname === '/') {
      window.location.replace(`/app${window.location.search}${window.location.hash}`);
    }
  }, []);
  return null;
}
