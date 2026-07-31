'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import type { TrainingStats } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { LoadingState, ErrorState } from '@/components/app/States';
import { BookingAction } from '@/components/app/BookingAction';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import { StatusPill } from '@/components/ui/StatusPill';
import { isVisualPreview, visualTrainingFixtures } from '@/lib/visual-preview';

export function LegacyTrainingDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { apiFetch, initData } = useTelegram();
  const [item, setItem] = useState<TrainingStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (isVisualPreview()) {
      setItem(visualTrainingFixtures[0]);
      return () => { active = false; };
    }
    if (!initData) return () => { active = false; };
    const load = () => apiFetch(`/api/mini-app/trainings/${id}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('training');
        return response.json() as Promise<{ training: TrainingStats }>;
      })
      .then((data) => { if (active) setItem(data.training); })
      .catch(() => { if (active) setFailed(true); });
    void load();
    window.addEventListener('booking:created', load);
    return () => {
      active = false;
      window.removeEventListener('booking:created', load);
    };
  }, [apiFetch, id, initData]);

  if (failed) return <div className="screen"><ErrorState /></div>;
  if (!item) return <div className="screen"><LoadingState /></div>;
  const status = !item.is_active ? 'cancelled' : item.remaining <= 0 ? 'full' : item.remaining <= 3 ? 'almost-full' : 'available';

  return (
    <div className="screen training-detail-screen">
      <button type="button" className="detail-back" onClick={() => router.back()}><ArrowLeft size={18} />Назад</button>
      <header className="detail-hero">
        <div className="eyebrow">{formatDate(item.date)}</div>
        <h1>{formatTimeRange(item.start_time, item.end_time)}</h1>
        <p><MapPin size={18} /><span><strong>{item.location_name || 'Спортивный зал'}</strong>{item.address ? <small>{item.address}</small> : null}</span></p>
        <StatusPill status={status} />
      </header>
      <section className="detail-card">
        <div className="stat-grid">
          <div><span>Всего мест</span><strong>{item.capacity}</strong></div>
          <div><span>Свободно</span><strong>{item.remaining}</strong></div>
          <div><span>Стоимость</span><strong>{item.price} ₽</strong></div>
        </div>
        <CapacityMeter booked={item.active_bookings} capacity={item.capacity} remaining={item.remaining} />
      </section>
      <BookingAction training={item} disabled={item.remaining <= 0 || !item.is_active} />
    </div>
  );
}
