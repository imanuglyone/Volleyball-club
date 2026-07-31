import { AdminShell } from '@/components/admin/AdminShell';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminV2 } = getSurfaceFeatureFlags();
  return <AdminShell v2Enabled={adminV2}>{children}</AdminShell>;
}
