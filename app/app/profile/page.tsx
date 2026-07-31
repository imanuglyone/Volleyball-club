import { ProfileScreen } from '@/components/app/ProfileScreen';
import { LegacyProfileScreen } from '@/components/app/legacy/LegacyProfileScreen';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export default function MiniAppProfilePage() {
  if (!getSurfaceFeatureFlags().miniAppV2) return <LegacyProfileScreen />;
  return <ProfileScreen />;
}
