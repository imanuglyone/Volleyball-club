import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatTimeRange, todayDateString } from '@/lib/format';
import { helpMessage, trainingSummary } from './messages';

export function parseDateInput(input?: string) {
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(input);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

export async function nextTraining() {
  const { data } = await createSupabaseAdminClient().from('trainings_stats').select('*')
    .eq('is_active', true).gte('date', todayDateString()).order('date').order('start_time').limit(1);
  return data?.[0] ? trainingSummary(data[0]) : 'Ближайших тренировок пока нет.';
}

export async function listForDate(date: string) {
  const db = createSupabaseAdminClient();
  const { data: trainings } = await db.from('trainings_stats').select('*').eq('date', date).order('start_time');
  if (!trainings?.length) return `На ${formatDate(date)} тренировок нет.`;
  const ids = trainings.map((item) => item.id);
  const { data: bookings } = await db.from('bookings').select('training_id,name').in('training_id', ids).eq('status', 'active').order('created_at');
  return trainings.map((training) => {
    const names = (bookings ?? []).filter((b) => b.training_id === training.id).map((b, index) => `${index + 1}. ${b.name}`);
    return `${formatTimeRange(training.start_time, training.end_time)}\n${names.join('\n') || 'Нет записей.'}`;
  }).join('\n\n');
}

export async function statsForDate(date: string) {
  const { data } = await createSupabaseAdminClient().from('trainings_stats').select('*').eq('date', date).order('start_time');
  if (!data?.length) return `На ${formatDate(date)} тренировок нет.`;
  return data.map((t) => `${formatTimeRange(t.start_time, t.end_time)} — занято ${t.active_bookings}, свободно ${t.remaining}`).join('\n');
}

export { helpMessage };
