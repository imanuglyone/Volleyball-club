'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Profile, TrainingStats } from '@/lib/types';
import type { TelegramWebApp } from '@/lib/telegram/types';

export type MiniAppBooking = {
  id: string;
  training_id?: string;
  status: 'active' | 'cancelled';
  created_at?: string;
  trainings: Pick<TrainingStats, 'date' | 'start_time' | 'end_time' | 'location_name' | 'address'> &
    Partial<Pick<TrainingStats, 'id' | 'price' | 'capacity'>>;
};

export type MiniAppProfile = Profile & {
  phone_verified_at?: string | null;
};

export type MiniAppBootstrap = {
  profile: MiniAppProfile;
  next_training?: TrainingStats | null;
  nearest_training?: TrainingStats | null;
  active_booking?: MiniAppBooking | null;
  bookings?: MiniAppBooking[];
  bookings_summary?: { active?: MiniAppBooking[]; history?: MiniAppBooking[] };
  server_time?: string;
};

type TelegramContextValue = {
  webApp: TelegramWebApp | null; initData: string; profile: MiniAppProfile | null;
  bootstrap: MiniAppBootstrap | null;
  loading: boolean; error: string | null; apiFetch: typeof fetch;
  refreshBootstrap: () => Promise<void>;
  haptic: (type: 'success' | 'error' | 'warning') => void;
};
const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [profile, setProfile] = useState<MiniAppProfile | null>(null);
  const [bootstrap, setBootstrap] = useState<MiniAppBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initData = webApp?.initData ?? '';
  const apiFetch = useCallback<typeof fetch>((input, init = {}) => fetch(input, {
    ...init, headers: { ...Object.fromEntries(new Headers(init.headers).entries()), 'x-telegram-init-data': initData }
  }), [initData]);

  const refreshBootstrap = useCallback(async () => {
    if (!initData) return;
    setError(null);
    const response = await apiFetch('/api/mini-app/bootstrap', { method: 'POST', cache: 'no-store' });
    if (response.status === 404 || response.status === 405) {
      const legacy = await apiFetch('/api/telegram/auth', { method: 'POST', cache: 'no-store' });
      if (!legacy.ok) throw new Error('Не удалось подтвердить вход');
      const data = await legacy.json() as { profile: MiniAppProfile };
      setProfile(data.profile);
      setBootstrap({ profile: data.profile });
      return;
    }
    if (!response.ok) throw new Error('Не удалось загрузить приложение');
    const raw = await response.json() as MiniAppBootstrap & {
      nearestTraining?: TrainingStats | null;
      activeBooking?: MiniAppBooking | null;
    };
    const bookings = raw.bookings ?? [
      ...(raw.bookings_summary?.active ?? []),
      ...(raw.bookings_summary?.history ?? []),
    ];
    const normalized: MiniAppBootstrap = {
      ...raw,
      next_training: raw.next_training ?? raw.nearest_training ?? raw.nearestTraining ?? null,
      active_booking: raw.active_booking ?? raw.activeBooking ?? raw.bookings_summary?.active?.[0] ?? null,
      bookings,
    };
    setProfile(normalized.profile);
    setBootstrap(normalized);
  }, [apiFetch, initData]);

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
  }, []);

  useEffect(() => {
    if (!initData) return;
    setLoading(true);
    void refreshBootstrap()
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [initData, refreshBootstrap]);

  const value = useMemo(() => ({ webApp, initData, profile, bootstrap, loading, error, apiFetch, refreshBootstrap,
    haptic: (type: 'success' | 'error' | 'warning') => webApp?.HapticFeedback?.notificationOccurred(type)
  }), [webApp, initData, profile, bootstrap, loading, error, apiFetch, refreshBootstrap]);
  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  const value = useContext(TelegramContext);
  if (!value) throw new Error('useTelegram must be used inside TelegramProvider');
  return value;
}
