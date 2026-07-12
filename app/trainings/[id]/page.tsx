'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { TrainingStats } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { LoadingState, ErrorState } from '@/components/app/States';
import { BookingAction } from '@/components/app/BookingAction';

export default function TrainingPage() {
  const { id } = useParams<{ id: string }>(); const [item, setItem] = useState<TrainingStats | null>(null); const [failed, setFailed] = useState(false);
  useEffect(() => { fetch(`/api/trainings/${id}`).then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then(setItem).catch(() => setFailed(true)); }, [id]);
  if (failed) return <div className="screen"><ErrorState/></div>; if (!item) return <div className="screen"><LoadingState/></div>;
  return <div className="screen"><header className="screen-header"><div className="eyebrow">{formatDate(item.date)}</div><h1>{formatTimeRange(item.start_time, item.end_time)}</h1><p>{item.location_name}<br/>{item.address}</p></header><section className="detail-card"><div className="stat-grid"><div><span>Вместимость</span><strong>{item.capacity}</strong></div><div><span>Свободно</span><strong>{item.remaining}</strong></div><div><span>Стоимость</span><strong>{item.price} ₽</strong></div></div><h2>Участники</h2>{item.public_bookings?.length ? <ol className="participants">{item.public_bookings.map((b) => <li key={b.id}>{b.name}</li>)}</ol> : <p className="muted">Пока никто не записался.</p>}</section><BookingAction trainingId={item.id} disabled={item.remaining <= 0 || !item.is_active}/></div>;
}
