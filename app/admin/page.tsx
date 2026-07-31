import Link from 'next/link';
import { CalendarPlus, ChevronRight, MapPin, Pencil, Power, Trash2, Users } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatTimeRange } from '@/lib/format';
import { clubDateString } from '@/lib/club-time';
import type { TrainingStats } from '@/lib/types';
import { deleteTraining, toggleTrainingActive } from './actions';
import { AdminConfirmSubmit } from '@/components/admin/AdminConfirmSubmit';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('trainings_stats')
    .select('id, date, start_time, end_time, price, capacity, location_name, address, is_active, active_bookings, total_bookings, remaining, created_at')
    .gte('date', clubDateString())
    .order('date')
    .order('start_time')
    .limit(50);
  const trainings = (data ?? []) as TrainingStats[];
  const active = trainings.filter((item) => item.is_active);
  const booked = trainings.reduce((sum, item) => sum + item.active_bookings, 0);
  const capacity = trainings.reduce((sum, item) => sum + item.capacity, 0);

  return <div className="admin-dashboard"><section className="admin-page-head"><div><span className="admin-eyebrow">ОБЗОР / АНГАРСК</span><h1>Ближайшие тренировки</h1><p>Заполненность, статус записи и быстрые действия без перехода между разделами.</p></div><Link href="/admin/trainings/new" className="admin-primary"><CalendarPlus size={19}/>Создать тренировку</Link></section><section className="admin-stats"><article><span>В расписании</span><strong>{trainings.length}</strong><small>будущих тренировок</small></article><article><span>Запись открыта</span><strong>{active.length}</strong><small>доступны игрокам</small></article><article><span>Заполненность</span><strong>{capacity ? Math.round(booked / capacity * 100) : 0}%</strong><small>{booked} из {capacity} мест занято</small></article></section><div className="admin-list-head"><h2>Рабочая лента</h2><span>{trainings.length} событий</span></div>{trainings.length ? <section className="admin-training-list">{trainings.map((training, index) => { const percent = Math.min(100, training.capacity ? training.active_bookings / training.capacity * 100 : 0); return <article className="admin-training-card" key={training.id}><div className="admin-training-date"><span>{index === 0 ? 'Ближайшая · ' : ''}{formatDate(training.date)}</span><strong>{formatTimeRange(training.start_time, training.end_time)}</strong></div><div className="admin-training-place"><MapPin size={17}/><div><strong>{training.location_name || 'Спортивный зал'}</strong><span>{training.address || 'Адрес не указан'}</span></div></div><div className="admin-occupancy"><div><span><Users size={15}/>Записано {training.active_bookings} из {training.capacity}</span><strong>{training.remaining > 0 ? `${training.remaining} свободно` : 'Зал заполнен'}</strong></div><i><b className={training.remaining <= 0 ? 'full' : ''} style={{ width: `${percent}%` }}/></i></div><div className="admin-training-actions"><form action={toggleTrainingActive.bind(null, training.id, !training.is_active)}><button className={training.is_active ? 'admin-state active' : 'admin-state'} type="submit"><Power size={15}/>{training.is_active ? 'Запись открыта' : 'Отключена'}</button></form><Link href={`/admin/trainings/${training.id}/bookings`} className="admin-action-link"><Users size={16}/>Участники<ChevronRight size={16}/></Link><Link href={`/admin/trainings/${training.id}/edit`} className="admin-icon-action" aria-label="Редактировать"><Pencil size={17}/></Link><form action={deleteTraining.bind(null, training.id)}><AdminConfirmSubmit className="admin-icon-action danger" ariaLabel="Удалить тренировку" title="Удалить тренировку?" description="Тренировка и связанные с ней записи будут удалены. Это действие нельзя отменить." confirmLabel="Удалить"><Trash2 size={17}/></AdminConfirmSubmit></form></div></article>; })}</section> : <div className="admin-empty"><CalendarPlus size={30}/><h2>Тренировок пока нет</h2><p>Создайте первую дату — она сразу появится на сайте и в приложении.</p></div>}</div>;
}
