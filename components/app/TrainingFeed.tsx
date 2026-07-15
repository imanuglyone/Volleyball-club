'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TrainingStats } from '@/lib/types';
import { todayDateString } from '@/lib/format';
import { TrainingCard } from './TrainingCard';
import { EmptyState, ErrorState, LoadingState } from './States';
import { isVisualPreview, visualTrainingFixtures } from '@/lib/visual-preview';

function addDays(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }

export function TrainingFeed({ limit, surface = 'app' }: { limit?: number; surface?: 'app' | 'public' }) {
  const [items, setItems] = useState<TrainingStats[]>([]); const [loading, setLoading] = useState(true); const [failed, setFailed] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setFailed(false);
    if (isVisualPreview()) { setItems(visualTrainingFixtures); setLoading(false); return; }
    try { const r = await fetch(`/api/trainings?from=${todayDateString()}&to=${addDays(45)}`); if (!r.ok) throw new Error(); setItems(await r.json()); }
    catch { setFailed(true); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const dates = useMemo(() => [...new Set(items.map((item) => item.date))].slice(0, 10), [items]);
  const visible = (date ? items.filter((item) => item.date === date) : items).slice(0, limit ?? 50);
  if (loading) return <LoadingState/>; if (failed) return <ErrorState retry={load}/>; if (!items.length) return <EmptyState title="Пока без тренировок" text="Новые даты появятся здесь."/>;
  return <>{!limit && <div className="date-strip" aria-label="Фильтр по датам"><button type="button" className={!date ? 'selected' : ''} onClick={() => setDate(null)}>Все</button>{dates.map((value) => <button type="button" key={value} className={date === value ? 'selected' : ''} onClick={() => setDate(value)}>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`))}</button>)}</div>}<div className={`training-list training-list--${surface}`}>{visible.map((item, index) => <TrainingCard key={item.id} training={item} featured={Boolean(limit && index === 0)} surface={surface}/>)}</div></>;
}
