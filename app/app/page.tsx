import { MiniAppHome } from '@/components/app/MiniAppHome';
import { TrainingFeed } from '@/components/app/TrainingFeed';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export default function MiniAppHomePage() {
  if (!getSurfaceFeatureFlags().miniAppV2) return <div className="screen home-screen"><header className="home-intro"><div><div className="eyebrow">Следующая игра</div><h1>Ближайшая тренировка</h1></div></header><TrainingFeed limit={1}/></div>;
  return <MiniAppHome />;
}
