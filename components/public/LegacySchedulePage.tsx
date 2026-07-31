import Link from 'next/link';
import { TrainingFeed } from '@/components/app/TrainingFeed';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { ArrowIcon } from '@/components/icons/AvangardIcons';

export function LegacySchedulePage() {
  return (
    <main className="legacy-public-route">
      <header><Link href="/"><AvangardWordmark compact/></Link><Link href="/app">Открыть приложение <ArrowIcon size={16}/></Link></header>
      <section>
        <div className="eyebrow">Ближайшие даты</div>
        <h1>Расписание</h1>
        <p>Выбери тренировку и займи место.</p>
        <TrainingFeed surface="public"/>
      </section>
    </main>
  );
}
