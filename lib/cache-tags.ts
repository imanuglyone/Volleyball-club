import { revalidateTag } from 'next/cache';
import { recordOperationalEvent } from '@/lib/observability';

export const PUBLIC_TRAININGS_TAG = 'public-trainings';

export function trainingCacheTag(trainingId: string) {
  return `training:${trainingId}`;
}

export function invalidateTrainingCache(trainingId: string) {
  revalidateTag(PUBLIC_TRAININGS_TAG);
  revalidateTag(trainingCacheTag(trainingId));
  recordOperationalEvent('cache_invalidation', {
    surface: 'system',
    outcome: 'success',
    code: 'training_and_schedule',
  });
}
