import Link from 'next/link';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { todayDateString } from '@/lib/format';
import type { TrainingStats } from '@/lib/types';
import { deleteTraining, toggleTrainingActive } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();
  const today = todayDateString();

  const { data } = await supabase
    .from('trainings_stats')
    .select('*')
    .gte('date', today)
    .order('date')
    .order('start_time');

  const trainings = (data ?? []) as TrainingStats[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="heading text-2xl font-semibold">{'\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438'}</h1>
        <Link href="/admin/trainings/new" className="btn-primary">
          {'\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0443'}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-steel-300">
              <th className="border-b border-night-700 pb-3">{'\u0414\u0430\u0442\u0430'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0412\u0440\u0435\u043c\u044f'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0417\u0430\u043b'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0426\u0435\u043d\u0430'}</th>
              <th className="border-b border-night-700 pb-3">{'\u041b\u0438\u043c\u0438\u0442'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0410\u043a\u0442\u0438\u0432\u043d\u0430'}</th>
              <th className="border-b border-night-700 pb-3">{'\u0417\u0430\u043f\u0438\u0441\u0435\u0439'}</th>
              <th className="border-b border-night-700 pb-3 text-right">{'\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f'}</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map((training) => (
              <tr key={training.id} className="border-b border-night-800">
                <td className="py-3 text-steel-200">{training.date}</td>
                <td className="py-3 text-steel-200">
                  {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
                </td>
                <td className="py-3 text-steel-200">{training.location_name ?? '\u2014'}</td>
                <td className="py-3 text-steel-200">{training.price} {'\u20bd'}</td>
                <td className="py-3 text-steel-200">{training.capacity}</td>
                <td className="py-3">
                  <form action={toggleTrainingActive.bind(null, training.id, !training.is_active)}>
                    <button
                      type="submit"
                      className={`btn-ghost ${training.is_active ? 'text-steel-200' : 'text-steel-400'}`}
                    >
                      {training.is_active ? '\u0414\u0430' : '\u041d\u0435\u0442'}
                    </button>
                  </form>
                </td>
                <td className="py-3 text-steel-200">
                  {training.active_bookings}/{training.total_bookings}
                </td>
                <td className="py-3 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Link className="btn-ghost" href={`/admin/trainings/${training.id}/edit`}>
                      {'\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c'}
                    </Link>
                    <Link className="btn-ghost" href={`/admin/trainings/${training.id}/bookings`}>
                      {'\u0417\u0430\u043f\u0438\u0441\u0438'}
                    </Link>
                    <form action={deleteTraining.bind(null, training.id)}>
                      <button type="submit" className="btn-ghost text-red-400">
                        {'\u0423\u0434\u0430\u043b\u0438\u0442\u044c'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
