'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { formatDate, formatTimeRange } from '@/lib/format';
import { EmptyState, ErrorState, LoadingState } from '@/components/app/States';

type Item = { id: string; status: 'active' | 'cancelled'; trainings: { date: string; start_time: string; end_time: string; location_name?: string; address?: string } };
export default function BookingsPage() {
  const { apiFetch, initData, haptic } = useTelegram(); const [items, setItems] = useState<Item[]>([]); const [loading, setLoading] = useState(true); const [failed, setFailed] = useState(false);
  const load = useCallback(async () => { if (!initData) { setLoading(false); return; } setLoading(true); try { const r = await apiFetch('/api/mini-app/bookings'); if (!r.ok) throw new Error(); setItems((await r.json()).bookings); } catch { setFailed(true); } finally { setLoading(false); } }, [apiFetch, initData]);
  useEffect(() => { void load(); }, [load]);
  async function cancel(id: string) { if (!window.confirm('Отменить эту запись?')) return; const r = await apiFetch('/api/mini-app/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_id: id }) }); if (r.ok) { haptic('success'); await load(); } else haptic('error'); }
  if (loading) return <div className="screen"><LoadingState/></div>;
  if (!initData) return <div className="screen"><EmptyState title="Откройте из Telegram" text="Личные записи доступны после входа через бота."/></div>;
  if (failed) return <div className="screen"><ErrorState retry={load}/></div>;
  const now = new Date().toISOString().slice(0, 10); const upcoming = items.filter((i) => i.status === 'active' && i.trainings.date >= now); const past = items.filter((i) => !upcoming.includes(i));
  return <div className="screen"><header className="screen-header"><div className="eyebrow">Личный раздел</div><h1>Мои записи</h1></header>{!items.length ? <EmptyState title="Записей пока нет" text="Выберите тренировку в расписании."/> : <><h2 className="section-title">Предстоящие</h2><div className="booking-list">{upcoming.map((i) => <article key={i.id} className="compact-card"><strong>{formatDate(i.trainings.date)} · {formatTimeRange(i.trainings.start_time, i.trainings.end_time)}</strong><span>{i.trainings.location_name}</span><button className="button-secondary danger" onClick={() => cancel(i.id)}>Отменить запись</button></article>)}</div><h2 className="section-title">История</h2><div className="booking-list muted-list">{past.map((i) => <article key={i.id} className="compact-card"><strong>{formatDate(i.trainings.date)}</strong><span>{i.status === 'cancelled' ? 'Отменена' : 'Завершена'}</span></article>)}</div></>}</div>;
}
