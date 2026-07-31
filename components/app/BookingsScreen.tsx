'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { PinIcon } from '@/components/icons/AvangardIcons';
import { useTelegram, type MiniAppBooking } from '@/components/telegram/TelegramProvider';
import { formatDate, formatTimeRange } from '@/lib/format';
import { clubDateString } from '@/lib/club-time';
import { isVisualPreview, visualBookingFixtures } from '@/lib/visual-preview';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusPill } from '@/components/ui/StatusPill';
import { EmptyState, ErrorState, LoadingState } from './States';

type Tab = 'active' | 'history';

export function BookingsScreen() {
  const {
    apiFetch,
    initData,
    haptic,
    bootstrap,
    loading: bootstrapLoading,
    refreshBootstrap,
  } = useTelegram();
  const [items, setItems] = useState<MiniAppBooking[]>(bootstrap?.bookings ?? []);
  const [loading, setLoading] = useState(!bootstrap?.bookings);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>('active');
  const [selected, setSelected] = useState<MiniAppBooking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [visualPreview, setVisualPreview] = useState(false);
  const locallyCancelledIds = useRef(new Set<string>());

  const load = useCallback(async () => {
    if (isVisualPreview()) {
      setVisualPreview(true);
      setItems(visualBookingFixtures as MiniAppBooking[]);
      setLoading(false);
      return;
    }
    if (!initData) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFailed(false);
    try {
      const response = await apiFetch('/api/mini-app/bookings', { cache: 'no-store' });
      if (!response.ok) throw new Error('bookings');
      const data = await response.json() as { bookings?: MiniAppBooking[] };
      setItems(data.bookings ?? []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, initData]);

  useEffect(() => {
    if (bootstrap?.bookings) {
      const incoming = bootstrap.bookings;
      for (const id of locallyCancelledIds.current) {
        const booking = incoming.find((item) => item.id === id);
        if (!booking || booking.status !== 'active') {
          locallyCancelledIds.current.delete(id);
        }
      }
      setItems(incoming.map((item) =>
        locallyCancelledIds.current.has(item.id) && item.status === 'active'
          ? { ...item, status: 'cancelled' }
          : item
      ));
      setFailed(false);
      setLoading(false);
      return;
    }
    if (bootstrapLoading || (initData && !bootstrap)) {
      setLoading(true);
      return;
    }
    void load();
  }, [bootstrap, bootstrap?.bookings, bootstrapLoading, initData, load]);

  async function cancel() {
    if (!selected) return;
    const target = selected;
    const before = items;
    locallyCancelledIds.current.add(target.id);
    setSelected(null);
    setCancelling(true);
    setItems((current) => current.map((item) => item.id === target.id ? { ...item, status: 'cancelled' } : item));
    setNotice('Запись отменена. Место уже доступно другому игроку.');
    haptic('success');
    try {
      const response = await apiFetch('/api/mini-app/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: target.id }),
      });
      if (!response.ok) throw new Error('cancel');
      void refreshBootstrap();
    } catch {
      locallyCancelledIds.current.delete(target.id);
      setItems(before);
      setNotice('Отмена не сохранилась. Запись восстановлена — попробуйте ещё раз.');
      haptic('error');
    } finally {
      setCancelling(false);
    }
  }

  const groups = useMemo(() => {
    const today = clubDateString(
      bootstrap?.server_time ? new Date(bootstrap.server_time) : new Date(),
    );
    const upcoming = items.filter((item) => item.status === 'active' && item.trainings.date >= today);
    const upcomingIds = new Set(upcoming.map((item) => item.id));
    return { upcoming, history: items.filter((item) => !upcomingIds.has(item.id)) };
  }, [bootstrap?.server_time, items]);

  if (loading) return <div className="screen"><LoadingState/></div>;
  if (!initData && !visualPreview) return <div className="screen"><EmptyState title="Откройте из Telegram" text="Личные записи доступны после входа через бота."/></div>;
  if (failed) return <div className="screen"><ErrorState retry={load}/></div>;
  const visible = tab === 'active' ? groups.upcoming : groups.history;

  return (
    <div className="screen bookings-screen">
      <header className="screen-header"><div><div className="eyebrow">Личный раздел</div><h1>Мои записи</h1></div><p>{groups.upcoming.length} активных</p></header>
      <div className="segmented-control" role="tablist" aria-label="Тип записей">
        <button type="button" role="tab" aria-selected={tab === 'active'} className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>Активные <span>{groups.upcoming.length}</span></button>
        <button type="button" role="tab" aria-selected={tab === 'history'} className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>История <span>{groups.history.length}</span></button>
      </div>
      {notice && <div className="inline-notice" role="status"><span>{notice}</span><button type="button" aria-label="Закрыть уведомление" onClick={() => setNotice(null)}><X size={16}/></button></div>}
      {visible.length ? <section className="booking-list">{visible.map((item) => <article key={item.id} className="booking-card">
        <div className="booking-card__top"><div><span>{formatDate(item.trainings.date)}</span><strong>{formatTimeRange(item.trainings.start_time, item.trainings.end_time)}</strong></div><StatusPill status={item.status === 'cancelled' ? 'cancelled' : tab === 'history' ? 'completed' : 'booked'}/></div>
        <p><PinIcon size={16}/><span>{item.trainings.location_name || 'Спортивный зал'}{item.trainings.address && <small>{item.trainings.address}</small>}</span></p>
        {tab === 'active' && <Button variant="danger" full disabled={cancelling} onClick={() => setSelected(item)}>Отменить запись</Button>}
      </article>)}</section> : <EmptyState title={tab === 'active' ? 'Нет активных записей' : 'История пока пуста'} text={tab === 'active' ? 'Выберите тренировку — свободные места уже ждут.' : 'Завершённые и отменённые записи появятся здесь.'}/>}
      <Dialog open={Boolean(selected)} onClose={() => !cancelling && setSelected(null)} title="Отменить запись?">
        <p>Место на тренировке {selected ? `${formatDate(selected.trainings.date)}, ${formatTimeRange(selected.trainings.start_time, selected.trainings.end_time)}` : ''} станет доступно другим игрокам.</p>
        <div className="dialog-actions"><Button variant="danger" full loading={cancelling} onClick={cancel}>Да, отменить</Button><Button variant="secondary" full onClick={() => setSelected(null)}>Оставить запись</Button></div>
      </Dialog>
    </div>
  );
}
