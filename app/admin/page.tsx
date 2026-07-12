import Link from 'next/link';
import { CalendarPlus, ChevronRight, MapPin, Pencil, Power, Trash2, Users } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { todayDateString, formatDate, formatTimeRange } from '@/lib/format';
import type { TrainingStats } from '@/lib/types';
import { deleteTraining, toggleTrainingActive } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from('trainings_stats').select('*').gte('date', todayDateString()).order('date').order('start_time');
  const trainings = (data ?? []) as TrainingStats[];
  const active = trainings.filter((item) => item.is_active);
  const booked = trainings.reduce((sum, item) => sum + item.active_bookings, 0);
  const capacity = trainings.reduce((sum, item) => sum + item.capacity, 0);

  return <div className="admin-dashboard">
    <section className="admin-page-head"><div><span className="admin-eyebrow">ПАНЕЛЬ УПРАВЛЕНИЯ / АНГАРСК</span><h1>Тренировки</h1><p>Расписание, вместимость и участники — в одном месте.</p></div><Link href="/admin/trainings/new" className="admin-primary"><CalendarPlus size={19}/>Создать тренировку</Link></section>
    <section className="admin-stats"><article><span>Будущих</span><strong>{trainings.length}</strong><small>тренировок в расписании</small></article><article><span>Активных</span><strong>{active.length}</strong><small>доступны для записи</small></article><article><span>Участников</span><strong>{booked}</strong><small>из {capacity} возможных мест</small></article></section>
    <div className="admin-list-head"><h2>Ближайшие даты</h2><span>{trainings.length} событий</span></div>
    {trainings.length ? <section className="admin-training-list">{trainings.map((training) => {
      const percent = Math.min(100, training.active_bookings / training.capacity * 100);
      return <article className="admin-training-card" key={training.id}>
        <div className="admin-training-date"><span>{formatDate(training.date)}</span><strong>{formatTimeRange(training.start_time, training.end_time)}</strong></div>
        <div className="admin-training-place"><MapPin size={17}/><div><strong>{training.location_name || 'Спортивный зал'}</strong><span>{training.address || 'Адрес не указан'}</span></div></div>
        <div className="admin-occupancy"><div><span><Users size={15}/>Записано {training.active_bookings} из {training.capacity}</span><strong>{training.remaining} свободно</strong></div><i><b style={{ width: `${percent}%` }}/></i></div>
        <div className="admin-training-actions"><form action={toggleTrainingActive.bind(null, training.id, !training.is_active)}><button className={training.is_active ? 'admin-state active' : 'admin-state'} type="submit"><Power size={15}/>{training.is_active ? 'Запись открыта' : 'Отключена'}</button></form><Link href={`/admin/trainings/${training.id}/bookings`} className="admin-action-link"><Users size={16}/>Участники<ChevronRight size={16}/></Link><Link href={`/admin/trainings/${training.id}/edit`} className="admin-icon-action" aria-label="Редактировать"><Pencil size={17}/></Link><form action={deleteTraining.bind(null, training.id)}><button type="submit" className="admin-icon-action danger" aria-label="Удалить"><Trash2 size={17}/></button></form></div>
      </article>;
    })}</section> : <div className="admin-empty"><CalendarPlus size={30}/><h2>Тренировок пока нет</h2><p>Создайте первую дату — она сразу появится в приложении.</p></div>}
  </div>;
}
