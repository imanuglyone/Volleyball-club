import { unstable_cache } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { addClubDays, clubDateString } from '@/lib/club-time';
import { normalizePublicTrainingRange } from '@/lib/public-training-range';
import { PUBLIC_TRAININGS_TAG } from '@/lib/cache-tags';
import type { TrainingSummary } from '@/lib/types';

export type PublicTraining = TrainingSummary;

async function fetchPublicTrainingsUncached(
  from: string,
  to: string,
): Promise<PublicTraining[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from('trainings_stats')
    .select('id,date,start_time,end_time,price,capacity,location_name,address,is_active,remaining,active_bookings,total_bookings')
    .eq('is_active', true)
    .gte('date', from)
    .lte('date', to)
    .order('date')
    .order('start_time');
  if (error) throw error;
  return (data ?? []) as PublicTraining[];
}

const getCachedPublicTrainings = unstable_cache(
  fetchPublicTrainingsUncached,
  ['public-trainings-v1'],
  { revalidate: 60, tags: [PUBLIC_TRAININGS_TAG] }
);

export function getPublicTrainings(
  from = clubDateString(),
  to = addClubDays(from, 60),
) {
  const safe = normalizePublicTrainingRange(from, to);
  return getCachedPublicTrainings(safe.from, safe.to);
}

export async function getPublicTrainingsResult(
  from = clubDateString(),
  to = addClubDays(from, 60),
) {
  try {
    return { trainings: await getPublicTrainings(from, to), failed: false as const };
  } catch (error) {
    console.error('Public schedule load failed', {
      kind: error instanceof Error ? error.name : 'unknown',
    });
    return { trainings: [], failed: true as const };
  }
}
