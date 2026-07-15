import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TrainingFeed } from '@/components/app/TrainingFeed';

export function SchedulePreview() {
  return <section className="public-schedule" id="schedule">
    <header><div><SectionLabel>03 / Ближайшие игры</SectionLabel><h2>Время выходить<br/>на площадку.</h2></div><Link href="/schedule">Всё расписание <ArrowUpRight size={17}/></Link></header>
    <TrainingFeed limit={3} surface="public"/>
  </section>;
}
