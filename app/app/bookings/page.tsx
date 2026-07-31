import { BookingsScreen } from '@/components/app/BookingsScreen';
import { LegacyBookingsScreen } from '@/components/app/legacy/LegacyBookingsScreen';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export default function MiniAppBookingsPage() {
  if (!getSurfaceFeatureFlags().miniAppV2) return <LegacyBookingsScreen />;
  return <BookingsScreen />;
}
