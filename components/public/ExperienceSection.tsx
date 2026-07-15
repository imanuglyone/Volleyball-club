import { CalendarDays, CircleDot, UsersRound } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const steps = [
  { number: '01', icon: CalendarDays, title: 'Выбери тренировку', text: 'Актуальные даты, залы и свободные места — всё видно сразу.' },
  { number: '02', icon: CircleDot, title: 'Займи место', text: 'Первый раз — имя и телефон. Следующий — одно касание.' },
  { number: '03', icon: UsersRound, title: 'Приходи играть', text: 'Познакомься с составом и почувствуй энергию живой площадки.' }
];

export function ExperienceSection() {
  return <section className="public-experience" id="format">
    <header><SectionLabel>02 / Как это работает</SectionLabel><h2>Три шага<br/><em>до игры.</em></h2></header>
    <div className="public-experience__grid">{steps.map(({ number, icon: Icon, title, text }) => <article key={number} className="glass-panel"><div><span>{number}</span><Icon size={23}/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}
