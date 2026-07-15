import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { ArrowLeft, MapPin, Phone, UserRound, UserX } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { cancelBooking } from '@/app/admin/actions';
import { formatDate, formatTimeRange } from '@/lib/format';
import { AdminConfirmSubmit } from '@/components/admin/AdminConfirmSubmit';

type BookingPageProps = { params: { id: string } };
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function TrainingBookingsPage({ params }: BookingPageProps) {
  noStore();
  const supabase = createSupabaseAdminClient();
  const [{ data: training }, { data: bookings }] = await Promise.all([supabase.from('trainings').select('date, start_time, end_time, location_name, address, capacity').eq('id', params.id).single(), supabase.from('bookings').select('*').eq('training_id', params.id).order('created_at', { ascending: false })]);
  if (!training) return <div className="admin-empty"><h2>Тренировка не найдена</h2></div>;
  const active = (bookings ?? []).filter((item) => item.status === 'active');

  return <div className="admin-bookings-page"><Link href="/admin" className="admin-back"><ArrowLeft size={17}/>К тренировкам</Link><section className="admin-page-head"><div><span className="admin-eyebrow">УЧАСТНИКИ / {formatDate(training.date)}</span><h1>{formatTimeRange(training.start_time, training.end_time)}</h1><p className="admin-place-line"><MapPin size={16}/>{training.location_name || 'Спортивный зал'} · {training.address || 'Адрес не указан'}</p></div><div className="admin-capacity-badge"><strong>{active.length}</strong><span>из {training.capacity}<br/>записано</span></div></section><div className="admin-list-head"><h2>Список участников</h2><span>{active.length} активных</span></div>{(bookings ?? []).length ? <section className="admin-booking-list">{(bookings ?? []).map((booking, index) => <article key={booking.id} className={booking.status === 'active' ? 'admin-booking-card' : 'admin-booking-card cancelled'}><span className="admin-person-index">{String(index + 1).padStart(2, '0')}</span><div className="admin-person-avatar"><UserRound size={19}/></div><div className="admin-person-data"><strong>{booking.name}</strong><a href={`tel:${booking.phone}`}><Phone size={13}/>{booking.phone}</a><small>{new Date(booking.created_at).toLocaleString('ru-RU')}</small></div><span className="admin-booking-status">{booking.status === 'active' ? 'Активна' : 'Отменена'}</span>{booking.status === 'active' && <form action={cancelBooking.bind(null, booking.id)}><AdminConfirmSubmit className="admin-cancel-person" ariaLabel={`Отменить запись ${booking.name}`} title="Отменить запись игрока?" description={`Место ${booking.name} освободится, а запись останется в истории.`} confirmLabel="Отменить запись"><UserX size={18}/><span>Отменить</span></AdminConfirmSubmit></form>}</article>)}</section> : <div className="admin-empty"><UserRound size={30}/><h2>Пока никто не записался</h2><p>Новые участники появятся здесь автоматически.</p></div>}</div>;
}
