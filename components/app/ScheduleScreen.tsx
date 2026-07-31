'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowIcon, PinIcon } from '@/components/icons/AvangardIcons';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import { StatusPill } from '@/components/ui/StatusPill';
import type { TrainingSummary } from '@/lib/types';
import { formatTimeRange } from '@/lib/format';
import { addClubDays, clubDateString, clubWeekday } from '@/lib/club-time';
import { isVisualPreview, visualTrainingFixtures } from '@/lib/visual-preview';
import { EmptyState, ErrorState, LoadingState } from './States';
import { trainingStatus } from './TrainingCard';

type Range = 'all' | 'weekend' | 'available';

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Irkutsk',
  }).format(new Date(`${value}T12:00:00+08:00`));
}

export function ScheduleScreen() {
  const [items, setItems] = useState<TrainingSummary[]>([]);
  const [range, setRange] = useState<Range>('all');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    if (isVisualPreview()) {
      setItems(visualTrainingFixtures);
      setLoading(false);
      return;
    }
    try {
      const from = clubDateString();
      const query = `from=${from}&to=${addClubDays(from, 45)}`;
      const response = await fetch(`/api/public/trainings?${query}`);
      if (!response.ok) throw new Error('schedule');
      const data = await response.json() as { trainings?: TrainingSummary[] };
      setItems(data.trainings ?? []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => items.filter((item) => {
    if (range === 'available') return item.is_active && item.remaining > 0;
    if (range === 'weekend') {
      const day = clubWeekday(item.date);
      return day === 0 || day === 6;
    }
    return true;
  }), [items, range]);

  const groups = useMemo(() => {
    const result = new Map<string, TrainingSummary[]>();
    visible.forEach((item) => result.set(item.date, [...(result.get(item.date) ?? []), item]));
    return [...result.entries()];
  }, [visible]);

  if (loading) return <div className="screen schedule-screen"><LoadingState /></div>;
  if (failed) return <div className="screen schedule-screen"><ErrorState retry={load} /></div>;

  return (
    <div className="screen schedule-screen">
      <header className="screen-header">
        <div><div className="eyebrow">Ближайшие 45 дней</div><h1>Расписание</h1></div>
        <p>{items.length} тренировок</p>
      </header>
      <div className="schedule-filters" role="group" aria-label="Фильтр расписания">
        {([
          ['all', 'Все'],
          ['available', 'Есть места'],
          ['weekend', 'Выходные'],
        ] as const).map(([value, label]) => <button type="button" key={value} className={range === value ? 'active' : ''} onClick={() => setRange(value)}>{label}</button>)}
      </div>
      {groups.length ? <div className="schedule-groups">{groups.map(([date, trainings]) => (
        <section className="schedule-group" key={date} aria-labelledby={`date-${date}`}>
          <h2 id={`date-${date}`}>{dateLabel(date)}</h2>
          <div>{trainings.map((training) => {
            const status = trainingStatus(training);
            return <Link href={`/app/trainings/${training.id}`} className="schedule-row" key={training.id}>
              <div className="schedule-row__time"><strong>{formatTimeRange(training.start_time, training.end_time)}</strong><span>{training.price} ₽</span></div>
              <div className="schedule-row__place"><strong>{training.location_name || 'Спортивный зал'}</strong><span><PinIcon size={13}/>{training.address || 'Ангарск'}</span><CapacityMeter booked={training.active_bookings} capacity={training.capacity} remaining={training.remaining}/></div>
              <StatusPill status={status.key} label={status.key === 'available' ? `${training.remaining} мест` : status.label}/>
              <ArrowIcon size={16}/>
            </Link>;
          })}</div>
        </section>
      ))}</div> : <EmptyState title="Ничего не найдено" text="Сбросьте фильтр или загляните позже — новые даты появятся здесь." />}
    </div>
  );
}
