import type { Metadata } from 'next';
import { PublicBookingManager } from '@/components/public/PublicBookingManager';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: 'Управление записью — Авангард',
  description: 'Проверить или отменить запись на волейбольную тренировку.',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function BookingManagePage({ params }: Props) {
  const { id } = await params;
  const flags = getSurfaceFeatureFlags();
  return <PublicBookingManager bookingId={id} compact={!flags.siteV2}/>;
}
