import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { formatDate, formatTimeRange } from '@/lib/format';
import type { TrainingStats } from '@/lib/types';

export function trainingStatus(training: TrainingStats) {
  if (!training.is_active) return { key: 'cancelled', label: 'Отменена' };
  if (training.remaining <= 0) return { key: 'full', label: 'Мест нет' };
  if (training.remaining <= 3) return { key: 'almost_full', label: 'Почти заполнена' };
  return { key: 'available', label: 'Есть места' };
}

export function TrainingCard({ training, featured = false }: { training: TrainingStats; featured?: boolean }) {
  const status = trainingStatus(training);
  return <article className={featured ? 'training-card featured' : 'training-card'}>
    <div className="card-top"><div><div className="eyebrow">{formatDate(training.date)}</div><h2>{formatTimeRange(training.start_time, training.end_time)}</h2></div><span className={`status ${status.key}`}><i/>{status.label}</span></div>
    <div className="location"><MapPin size={17}/><div><strong>{training.location_name || 'Спортивный зал'}</strong>{training.address && <span>{training.address}</span>}</div></div>
    <div className="capacity"><div><span>Занято</span><strong>{training.active_bookings}/{training.capacity}</strong></div><div className="capacity-track"><i style={{ width: `${Math.min(100, training.active_bookings / training.capacity * 100)}%` }}/></div><span>{training.remaining} свободно</span></div>
    <Link className="button-primary" href={`/trainings/${training.id}`}><span>{training.remaining > 0 ? 'Занять место' : 'Посмотреть'}</span><ArrowUpRight size={16}/></Link>
  </article>;
}
