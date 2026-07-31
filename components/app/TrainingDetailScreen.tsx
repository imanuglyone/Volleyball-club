'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowIcon, ClockIcon, PinIcon } from '@/components/icons/AvangardIcons';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import { StatusPill } from '@/components/ui/StatusPill';
import type { PublicBooking, TrainingSummary } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { isVisualPreview, visualTrainingFixtures } from '@/lib/visual-preview';
import { BookingAction } from './BookingAction';
import { ErrorState, LoadingState } from './States';
import { ParticipantRoster } from './ParticipantRoster';

export function TrainingDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { apiFetch, bootstrap } = useTelegram();
  const [item, setItem] = useState<(TrainingSummary & { public_bookings?: PublicBooking[] }) | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    if (isVisualPreview()) {
      setItem({ ...visualTrainingFixtures[0], id });
      return;
    }
    try {
      const response = await apiFetch(`/api/mini-app/trainings/${id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('training');
      const data = await response.json() as { training: TrainingSummary & { public_bookings?: PublicBooking[] } };
      setItem(data.training);
    } catch {
      setFailed(true);
    }
  }, [apiFetch, id]);

  useEffect(() => {
    void load();
    window.addEventListener('booking:created', load);
    return () => window.removeEventListener('booking:created', load);
  }, [load]);

  if (failed) return <div className="screen"><ErrorState retry={load}/></div>;
  if (!item) return <div className="screen"><LoadingState/></div>;

  const booked = Boolean(
    bootstrap?.active_booking?.training_id === id ||
    bootstrap?.active_booking?.trainings?.id === id ||
    bootstrap?.bookings?.some((booking) => booking.status === 'active' && (booking.training_id === id || booking.trainings?.id === id)),
  );
  const status = booked ? 'booked' : !item.is_active ? 'cancelled' : item.remaining <= 0 ? 'full' : item.remaining <= 3 ? 'almost-full' : 'available';

  return (
    <div className="screen training-detail-screen">
      <button type="button" className="detail-back" onClick={() => router.back()}><ArrowIcon size={17} className="icon-back"/>Назад</button>
      <header className="detail-hero">
        <div className="detail-hero__line" aria-hidden="true"><i/><i/><i/></div>
        <div className="eyebrow">{formatDate(item.date)}</div>
        <h1>{formatTimeRange(item.start_time, item.end_time)}</h1>
        <div className="detail-hero__meta">
          <p><PinIcon size={18}/><span><strong>{item.location_name || 'Спортивный зал'}</strong><small>{item.address || 'Ангарск'}</small></span></p>
          <p><ClockIcon size={18}/><span><strong>{item.price} ₽</strong><small>оплата на месте</small></span></p>
        </div>
        <StatusPill status={status}/>
      </header>
      <section className="detail-card">
        <div className="stat-grid">
          <div><span>Всего мест</span><strong>{item.capacity}</strong></div>
          <div><span>Свободно</span><strong>{item.remaining}</strong></div>
          <div><span>Записано</span><strong>{item.active_bookings}</strong></div>
        </div>
        <CapacityMeter booked={item.active_bookings} capacity={item.capacity} remaining={item.remaining}/>
        <ParticipantRoster bookings={item.public_bookings} capacity={item.capacity}/>
      </section>
      <BookingAction training={item} booked={booked} disabled={item.remaining <= 0 || !item.is_active}/>
    </div>
  );
}
