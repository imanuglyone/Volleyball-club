import { unstable_noStore as noStore } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { cancelBooking } from '@/app/admin/actions';

type BookingPageProps = {
  params: { id: string };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function TrainingBookingsPage({ params }: BookingPageProps) {
  noStore();
  const supabase = createSupabaseAdminClient();

  const { data: training } = await supabase
    .from('trainings')
    .select('date, start_time, end_time, location_name, address')
    .eq('id', params.id)
    .single();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('training_id', params.id)
    .order('created_at', { ascending: false });

  if (!training) {
    return <div className="text-steel-200">{'\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430.'}</div>;
  }

  return (
    <div>
      <h1 className="heading text-2xl font-semibold text-white">{'\u0417\u0430\u043f\u0438\u0441\u0438 \u043d\u0430 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0443'}</h1>
      <div className="mt-2 text-sm text-steel-200">
        {training.date} · {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
      </div>
      <div className="mt-3 space-y-1 text-sm text-steel-300">
        {training.location_name ? <div>{'\u0417\u0430\u043b: '} {training.location_name}</div> : null}
        {training.address ? <div>{training.address}</div> : null}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-steel-300">
              <th className="border-b border-night-700 pb-3">{'\u0414\u0430\u0442\u0430 \u0437\u0430\u043f\u0438\u0441\u0438'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0418\u043c\u044f'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0422\u0435\u043b\u0435\u0444\u043e\u043d'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0421\u0442\u0430\u0442\u0443\u0441'}</th>
              <th className="border-b border-night-700 pb-3 text-right">{'\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435'}</th>
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((booking) => (
              <tr key={booking.id} className="border-b border-night-800">
                <td className="py-3 text-steel-200">{new Date(booking.created_at).toLocaleString('ru-RU')}</td>
                <td className="py-3 text-steel-200">{booking.name}</td>
                <td className="py-3 text-steel-200">{booking.phone}</td>
                <td className="py-3 text-steel-200">
                  {booking.status === 'active' ? '\u0410\u043a\u0442\u0438\u0432\u043d\u0430' : '\u041e\u0442\u043c\u0435\u043d\u0435\u043d\u0430'}
                </td>
                <td className="py-3 text-right">
                  {booking.status === 'active' ? (
                    <form action={cancelBooking.bind(null, booking.id)}>
                      <button type="submit" className="btn-ghost text-red-400">
                        {'\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c'}
                      </button>
                    </form>
                  ) : (
                    <span className="text-steel-400">{'\u2014'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
