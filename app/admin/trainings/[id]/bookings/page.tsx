import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { ArrowLeft, MapPin } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatTimeRange } from '@/lib/format';
import { AdminBookingList } from '@/components/admin/AdminBookingList';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

type BookingPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function TrainingBookingsPage({ params }: BookingPageProps) {
  noStore();
  const { id } = await params;
  const { adminV2 } = getSurfaceFeatureFlags();
  const supabase = createSupabaseAdminClient();
  const [{ data: training }, { data: bookings }] = await Promise.all([
    supabase
      .from('trainings')
      .select('date, start_time, end_time, location_name, address, capacity')
      .eq('id', id)
      .single(),
    supabase
      .from('bookings')
      .select('id, name, phone, status, created_at, profile_id')
      .eq('training_id', id)
      .order('created_at', { ascending: false }),
  ]);
  if (!training) {
    return <div className="admin-empty"><h2>Тренировка не найдена</h2></div>;
  }

  const allBookings = bookings ?? [];
  const active = allBookings.filter((item) => item.status === 'active');

  return (
    <div className="admin-bookings-page">
      <Link href="/admin" className="admin-back"><ArrowLeft size={17}/>К тренировкам</Link>
      <section className="admin-page-head">
        <div>
          <span className="admin-eyebrow">УЧАСТНИКИ / {formatDate(training.date)}</span>
          <h1>{formatTimeRange(training.start_time, training.end_time)}</h1>
          <p className="admin-place-line">
            <MapPin size={16}/>
            {training.location_name || 'Спортивный зал'} · {training.address || 'Адрес не указан'}
          </p>
        </div>
        <div className="admin-capacity-badge">
          <strong>{active.length}</strong>
          <span>из {training.capacity}<br/>записано</span>
        </div>
      </section>
      <AdminBookingList bookings={allBookings} v2Enabled={adminV2}/>
    </div>
  );
}
