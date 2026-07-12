'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { TrainingStats } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { LoadingState, ErrorState } from '@/components/app/States';
import { BookingAction } from '@/components/app/BookingAction';

export default function TrainingPage() {
  const { id } = useParams<{ id: string }>(); const [item, setItem] = useState<TrainingStats | null>(null); const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () => fetch(`/api/trainings/${id}`, { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then((data) => { if (active) setItem(data); }).catch(() => { if (active) setFailed(true); });
    void load();
    window.addEventListener('booking:created', load);
    return () => { active = false; window.removeEventListener('booking:created', load); };
  }, [id]);
  if (failed) return <div className="screen"><ErrorState/></div>; if (!item) return <div className="screen"><LoadingState/></div>;
  return <div className="screen training-detail-screen"><header className="screen-header"><div className="eyebrow">{formatDate(item.date)}</div><h1>{formatTimeRange(item.start_time, item.end_time)}</h1><p>{item.location_name}<br/>{item.address}</p></header><section className="detail-card"><div className="stat-grid"><div><span>Вместимость</span><strong>{item.capacity}</strong></div><div><span>Свободно</span><strong>{item.remaining}</strong></div><div><span>Стоимость</span><strong>{item.price} ₽</strong></div></div><div className="participants-heading"><div><span className="section-number">02</span><h2>На площадке</h2></div><span>{item.public_bookings?.length ?? 0} / {item.capacity}</span></div>{item.public_bookings?.length ? <ol className="participants">{item.public_bookings.map((b, index) => <li key={b.id}><span className="participant-index">{String(index + 1).padStart(2, '0')}</span><span className="participant-avatar">{b.name.trim().charAt(0).toUpperCase()}</span><strong>{b.name}</strong><i aria-hidden="true"/></li>)}</ol> : <div className="participants-empty"><span>○</span><p>Площадка ждёт первых игроков.</p></div>}</section><BookingAction trainingId={item.id} disabled={item.remaining <= 0 || !item.is_active}/></div>;
}
