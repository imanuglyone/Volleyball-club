import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { formatDate, formatTimeRange } from '@/lib/format';
import type { TrainingStats } from '@/lib/types';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import { StatusPill, type TrainingVisualStatus } from '@/components/ui/StatusPill';
import { buttonClassName } from '@/components/ui/Button';

export function trainingStatus(training: TrainingStats) {
  if (!training.is_active) return { key: 'cancelled' as const, label: 'Отменена' };
  if (training.remaining <= 0) return { key: 'full' as const, label: 'Мест нет' };
  if (training.remaining <= 3) return { key: 'almost-full' as const, label: 'Мало мест' };
  return { key: 'available' as const, label: 'Есть места' };
}

type TrainingCardProps = { training: TrainingStats; featured?: boolean; surface?: 'app' | 'public'; booked?: boolean };

export function TrainingCard({ training, featured = false, surface = 'app', booked = false }: TrainingCardProps) {
  const status = trainingStatus(training);
  const visualStatus: TrainingVisualStatus = booked ? 'booked' : status.key;
  return <article className={`training-card${featured ? ' training-card--featured' : ''} training-card--${surface}`}>
    <div className="training-card__top"><div><div className="eyebrow">{formatDate(training.date)}</div><h2>{formatTimeRange(training.start_time, training.end_time)}</h2></div><StatusPill status={visualStatus} label={booked ? undefined : status.label}/></div>
    <div className="training-card__location"><MapPin size={17}/><div><strong>{training.location_name || 'Спортивный зал'}</strong>{training.address && <span>{training.address}</span>}</div></div>
    {featured ? <div className="training-card__availability" aria-label={`Свободно ${training.remaining} из ${training.capacity}`}><strong>{training.remaining}</strong><span>/ {training.capacity}<small>мест свободно</small></span></div> : <CapacityMeter booked={training.active_bookings} capacity={training.capacity} remaining={training.remaining}/>} 
    <div className="training-card__footer"><span className="training-card__price">{training.price} ₽</span><Link className={buttonClassName({ variant: status.key === 'cancelled' ? 'ghost' : 'primary', size: 'sm' })} href={`/trainings/${training.id}`}><span>{booked ? 'Открыть запись' : training.remaining > 0 && training.is_active ? 'Занять место' : 'Посмотреть'}</span><ArrowUpRight size={16}/></Link></div>
  </article>;
}
