'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import type { TrainingStats } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { LoadingState, ErrorState } from '@/components/app/States';
import { BookingAction } from '@/components/app/BookingAction';
import { ParticipantRoster } from '@/components/app/ParticipantRoster';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import { StatusPill } from '@/components/ui/StatusPill';
import { isVisualPreview, visualTrainingFixtures } from '@/lib/visual-preview';

export default function TrainingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<TrainingStats | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    if (isVisualPreview()) { setItem(visualTrainingFixtures[0]); return () => { active = false; }; }
    const load = () => fetch(`/api/trainings/${id}`, { cache: 'no-store' }).then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((data: TrainingStats) => { if (active) setItem(data); }).catch(() => { if (active) setFailed(true); });
    void load();
    window.addEventListener('booking:created', load);
    return () => { active = false; window.removeEventListener('booking:created', load); };
  }, [id]);
  if (failed) return <div className="screen"><ErrorState/></div>;
  if (!item) return <div className="screen"><LoadingState/></div>;
  const status = !item.is_active ? 'cancelled' : item.remaining <= 0 ? 'full' : item.remaining <= 3 ? 'almost-full' : 'available';
  return <div className="screen training-detail-screen">
    <button type="button" className="detail-back" onClick={() => router.back()}><ArrowLeft size={18}/>Назад</button>
    <header className="detail-hero"><div className="detail-hero__media" aria-hidden="true"><span className="detail-ball"/></div><div className="eyebrow">{formatDate(item.date)}</div><h1>{formatTimeRange(item.start_time, item.end_time)}</h1><p><MapPin size={18}/><span><strong>{item.location_name || 'Спортивный зал'}</strong>{item.address && <small>{item.address}</small>}</span></p><StatusPill status={status}/></header>
    <section className="detail-card"><div className="stat-grid"><div><span>Всего мест</span><strong>{item.capacity}</strong></div><div><span>Свободно</span><strong>{item.remaining}</strong></div><div><span>Стоимость</span><strong>{item.price} ₽</strong></div></div><CapacityMeter booked={item.active_bookings} capacity={item.capacity} remaining={item.remaining}/><ParticipantRoster bookings={item.public_bookings} capacity={item.capacity}/></section>
    <BookingAction training={item} disabled={item.remaining <= 0 || !item.is_active}/>
  </div>;
}
