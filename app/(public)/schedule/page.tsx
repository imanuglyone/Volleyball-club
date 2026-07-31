import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/PublicHeader';
import { SchedulePreview } from '@/components/public/SchedulePreview';
import { LegacySchedulePage } from '@/components/public/LegacySchedulePage';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { ArrowIcon } from '@/components/icons/AvangardIcons';
import { getPublicTrainingsResult } from '@/lib/dal/trainings';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export const metadata: Metadata = {
  title: 'Расписание тренировок — Авангард',
  description: 'Актуальные волейбольные тренировки в Ангарске: время, зал, стоимость и свободные места.'
};

export default async function SchedulePage() {
  const flags = getSurfaceFeatureFlags();
  if (!flags.siteV2) return <LegacySchedulePage/>;
  const { trainings, failed: scheduleLoadFailed } = await getPublicTrainingsResult();
  return (
    <main className="public-site public-subpage">
      <PublicHeader/>
      <section className="public-subpage__hero">
        <p>Авангард · Ангарск</p>
        <h1>Расписание<br/><em>игры.</em></h1>
        <span>Выбери удобный вечер. Свободные места обновляются после каждой записи.</span>
      </section>
      <SchedulePreview initialTrainings={trainings} initialError={scheduleLoadFailed}/>
      <footer className="public-footer">
        <AvangardWordmark/>
        <p>Волейбол, который становится привычкой.</p>
        <nav><Link href="/">Главная</Link><Link href="/app">Mini App <ArrowIcon size={15}/></Link></nav>
        <small>© 2026 Авангард</small>
      </footer>
    </main>
  );
}
