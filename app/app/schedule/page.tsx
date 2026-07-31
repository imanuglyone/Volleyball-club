import { ScheduleScreen } from '@/components/app/ScheduleScreen';
import { LegacyScheduleScreen } from '@/components/app/legacy/LegacyScheduleScreen';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export default function MiniAppSchedulePage() {
  if (!getSurfaceFeatureFlags().miniAppV2) return <LegacyScheduleScreen />;
  return <ScheduleScreen />;
}
