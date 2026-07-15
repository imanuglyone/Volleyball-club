'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Profile } from '@/lib/types';
import type { TelegramWebApp } from '@/lib/telegram/types';

type TelegramContextValue = {
  webApp: TelegramWebApp | null; initData: string; profile: Profile | null;
  loading: boolean; error: string | null; apiFetch: typeof fetch;
  haptic: (type: 'success' | 'error' | 'warning') => void;
};
const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initData = webApp?.initData ?? '';
  const apiFetch = useCallback<typeof fetch>((input, init = {}) => fetch(input, {
    ...init, headers: { ...Object.fromEntries(new Headers(init.headers).entries()), 'x-telegram-init-data': initData }
  }), [initData]);

  useEffect(() => {
    const app = window.Telegram?.WebApp ?? null;
    setWebApp(app);
    app?.ready(); app?.expand();
    const root = document.documentElement;
    const safe = app?.safeAreaInset;
    const contentSafe = app?.contentSafeAreaInset;
    if (safe || contentSafe) {
      root.style.setProperty('--tg-safe-area-inset-top', `${Math.max(safe?.top ?? 0, contentSafe?.top ?? 0)}px`);
      root.style.setProperty('--tg-safe-area-inset-right', `${Math.max(safe?.right ?? 0, contentSafe?.right ?? 0)}px`);
      root.style.setProperty('--tg-safe-area-inset-bottom', `${Math.max(safe?.bottom ?? 0, contentSafe?.bottom ?? 0)}px`);
      root.style.setProperty('--tg-safe-area-inset-left', `${Math.max(safe?.left ?? 0, contentSafe?.left ?? 0)}px`);
    }
    Object.entries(app?.themeParams ?? {}).forEach(([key, value]) => root.style.setProperty(`--tg-theme-${key.replaceAll('_', '-')}`, value));
    if (!app?.initData) { setLoading(false); return; }
    fetch('/api/telegram/auth', { method: 'POST', headers: { 'x-telegram-init-data': app.initData } })
      .then(async (response) => { if (!response.ok) throw new Error('Не удалось подтвердить вход'); return response.json(); })
      .then((data: { profile: Profile }) => setProfile(data.profile))
      .catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ webApp, initData, profile, loading, error, apiFetch,
    haptic: (type: 'success' | 'error' | 'warning') => webApp?.HapticFeedback?.notificationOccurred(type)
  }), [webApp, initData, profile, loading, error, apiFetch]);
  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  const value = useContext(TelegramContext);
  if (!value) throw new Error('useTelegram must be used inside TelegramProvider');
  return value;
}
