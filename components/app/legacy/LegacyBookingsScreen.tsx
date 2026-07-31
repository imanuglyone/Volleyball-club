'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { useTelegram, type MiniAppBooking } from '@/components/telegram/TelegramProvider';
import { formatDate, formatTimeRange } from '@/lib/format';
import { clubDateString } from '@/lib/club-time';
import { EmptyState, ErrorState, LoadingState } from '@/components/app/States';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { StatusPill } from '@/components/ui/StatusPill';
import { isVisualPreview, visualBookingFixtures } from '@/lib/visual-preview';

type Tab = 'active' | 'history';

export function LegacyBookingsScreen() {
  const { apiFetch, initData, haptic } = useTelegram();
  const [items, setItems] = useState<MiniAppBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>('active');
  const [selected, setSelected] = useState<MiniAppBooking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [visualPreview, setVisualPreview] = useState(false);

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

  useEffect(() => { void load(); }, [load]);

  async function cancel() {
    if (!selected) return;
    setCancelling(true);
    const response = await apiFetch('/api/mini-app/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: selected.id }),
    });
    setCancelling(false);
    if (response.ok) {
      haptic('success');
      setSelected(null);
      setNotice('Запись отменена. При желании можно записаться снова.');
      await load();
    } else {
      haptic('error');
      setNotice('Не удалось отменить запись. Попробуйте ещё раз.');
    }
  }

  const groups = useMemo(() => {
    const today = clubDateString();
    const upcoming = items.filter(
      (item) => item.status === 'active' && item.trainings.date >= today,
    );
    const upcomingIds = new Set(upcoming.map((item) => item.id));
    return {
      upcoming,
      history: items.filter((item) => !upcomingIds.has(item.id)),
    };
  }, [items]);

  if (loading) return <div className="screen"><LoadingState /></div>;
  if (!initData && !visualPreview) {
    return (
      <div className="screen">
        <EmptyState title="Откройте из Telegram" text="Личные записи доступны после входа через бота." />
      </div>
    );
  }
  if (failed) return <div className="screen"><ErrorState retry={load} /></div>;

  const visible = tab === 'active' ? groups.upcoming : groups.history;
  return (
    <div className="screen bookings-screen">
      <header className="screen-header">
        <div className="eyebrow">Личный раздел</div>
        <h1>Мои записи</h1>
      </header>
      <div className="segmented-control" role="tablist" aria-label="Тип записей">
        <button type="button" role="tab" aria-selected={tab === 'active'} className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>
          Активные <span>{groups.upcoming.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'history'} className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          История <span>{groups.history.length}</span>
        </button>
      </div>
      {notice ? (
        <div className="inline-notice" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Закрыть уведомление" onClick={() => setNotice(null)}><X size={16} /></button>
        </div>
      ) : null}
      {visible.length ? (
        <section className="booking-list">
          {visible.map((item) => (
            <article key={item.id} className="booking-card">
              <div className="booking-card__top">
                <div>
                  <span>{formatDate(item.trainings.date)}</span>
                  <strong>{formatTimeRange(item.trainings.start_time, item.trainings.end_time)}</strong>
                </div>
                <StatusPill status={item.status === 'cancelled' ? 'cancelled' : tab === 'history' ? 'completed' : 'booked'} />
              </div>
              <p>
                <MapPin size={16} />
                <span>{item.trainings.location_name || 'Спортивный зал'}{item.trainings.address ? <small>{item.trainings.address}</small> : null}</span>
              </p>
              {tab === 'active' ? <Button variant="danger" full onClick={() => setSelected(item)}>Отменить запись</Button> : null}
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title={tab === 'active' ? 'Нет активных записей' : 'История пока пуста'}
          text={tab === 'active' ? 'Выберите тренировку в расписании.' : 'Завершённые и отменённые записи появятся здесь.'}
        />
      )}
      <Dialog open={Boolean(selected)} onClose={() => !cancelling && setSelected(null)} title="Отменить запись?">
        <p>Освободившееся место станет доступно другим игрокам.</p>
        <div className="dialog-actions">
          <Button variant="danger" full loading={cancelling} onClick={cancel}>Да, отменить</Button>
          <Button variant="secondary" full onClick={() => setSelected(null)}>Оставить запись</Button>
        </div>
      </Dialog>
    </div>
  );
}
