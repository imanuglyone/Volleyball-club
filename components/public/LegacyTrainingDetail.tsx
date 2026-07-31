'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { TrainingStats } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { LoadingState, ErrorState } from '@/components/app/States';
import { BookingModal } from '@/components/BookingModal';
import { ParticipantRoster } from '@/components/app/ParticipantRoster';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import { StatusPill } from '@/components/ui/StatusPill';
import { ArrowIcon, PinIcon } from '@/components/icons/AvangardIcons';

export function LegacyTrainingDetail({ id }: { id: string }) {
  const [item, setItem] = useState<TrainingStats | null>(null);
  const [failed, setFailed] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () => fetch(`/api/trainings/${id}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('training');
        return response.json();
      })
      .then((data: TrainingStats) => { if (active) setItem(data); })
      .catch(() => { if (active) setFailed(true); });
    void load();
    window.addEventListener('booking:created', load);
    return () => {
      active = false;
      window.removeEventListener('booking:created', load);
    };
  }, [id]);

  if (failed) return <main className="legacy-public-route"><section><ErrorState/></section></main>;
  if (!item) return <main className="legacy-public-route"><section><LoadingState/></section></main>;
  const status = !item.is_active ? 'cancelled' : item.remaining <= 0 ? 'full' : item.remaining <= 3 ? 'almost-full' : 'available';

  return (
    <main className="legacy-public-route">
      <header><Link href="/schedule"><ArrowIcon size={17}/> Расписание</Link></header>
      <section className="training-detail-screen">
        <div className="eyebrow">{formatDate(item.date)}</div>
        <h1>{formatTimeRange(item.start_time, item.end_time)}</h1>
        <p className="training-card__location"><PinIcon size={18}/><span><strong>{item.location_name || 'Спортивный зал'}</strong>{item.address ? <small>{item.address}</small> : null}</span></p>
        <StatusPill status={status}/>
        <div className="detail-card">
          <div className="stat-grid"><div><span>Всего мест</span><strong>{item.capacity}</strong></div><div><span>Свободно</span><strong>{item.remaining}</strong></div><div><span>Стоимость</span><strong>{item.price} ₽</strong></div></div>
          <CapacityMeter booked={item.active_bookings} capacity={item.capacity} remaining={item.remaining}/>
          <ParticipantRoster bookings={item.public_bookings} capacity={item.capacity}/>
        </div>
        <button
          className="btn-primary"
          type="button"
          disabled={item.remaining <= 0 || !item.is_active}
          onClick={() => setBookingOpen(true)}
        >
          {item.remaining <= 0 || !item.is_active ? 'Мест нет' : 'Записаться'}
        </button>
        <BookingModal
          open={bookingOpen}
          training={item}
          onClose={() => setBookingOpen(false)}
          onBooked={() => window.dispatchEvent(new Event('booking:created'))}
        />
      </section>
    </main>
  );
}
