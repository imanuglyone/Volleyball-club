import Link from 'next/link';
import { ArrowRight, CalendarCheck, MapPin, UsersRound } from 'lucide-react';
import { HeroVolleyball } from '@/components/visuals/HeroVolleyball';
import { buttonClassName } from '@/components/ui/Button';

const signals = [
  { icon: CalendarCheck, title: 'Живые тренировки', text: 'каждую неделю' },
  { icon: UsersRound, title: 'Реальные люди', text: 'и атмосфера' },
  { icon: MapPin, title: 'Простая запись', text: 'за минуту' }
];

export function HeroSection() {
  return <section className="public-hero">
    <div className="public-hero__copy mc-reveal">
      <p className="public-kicker">Ангарск · 2026</p>
      <h1>Твоя игра.<br/>Твоя <em>команда.</em></h1>
      <p className="public-hero__lead">Живой волейбол по вечерам для тех, кто любит игру, движение и команду.</p>
      <div className="public-hero__actions">
        <Link href="/app" className={buttonClassName({ size: 'lg' })}>Открыть приложение <ArrowRight size={18}/></Link>
        <Link href="/schedule" className={buttonClassName({ variant: 'secondary', size: 'lg' })}>Смотреть расписание</Link>
      </div>
    </div>
    <HeroVolleyball/>
    <div className="public-net" aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <div className="public-hero__signals">{signals.map(({ icon: Icon, title, text }) => <div key={title}><span><Icon size={18}/></span><p><strong>{title}</strong><small>{text}</small></p></div>)}</div>
  </section>;
}
