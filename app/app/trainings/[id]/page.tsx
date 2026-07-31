import { TrainingDetailScreen } from '@/components/app/TrainingDetailScreen';
import { LegacyTrainingDetailScreen } from '@/components/app/legacy/LegacyTrainingDetailScreen';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

type Props = { params: Promise<{ id: string }> };

export default async function MiniAppTrainingPage({ params }: Props) {
  const { id } = await params;
  if (!getSurfaceFeatureFlags().miniAppV2) {
    return <LegacyTrainingDetailScreen id={id} />;
  }
  return <TrainingDetailScreen id={id} />;
}
