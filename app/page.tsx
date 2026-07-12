'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { TrainingFeed } from '@/components/app/TrainingFeed';
import { useTelegram } from '@/components/telegram/TelegramProvider';

export default function HomePage() {
  const { profile } = useTelegram();
  return <div className="screen home-screen">
    <section className="void-hero">
      <div className="hero-copy">
        <div className="eyebrow">Авангард · Volleyball club</div>
        <h1>{profile?.first_name ? <>Игра начинается<br/><em>с тебя, {profile.first_name}</em></> : <>Игра начинается<br/><em>с тебя</em></>}</h1>
        <p>Тренировки, люди и энергия площадки. Выбери свой вечер — остальное мы уже подготовили.</p>
      </div>
      <div className="portal" aria-hidden="true"><div className="portal-ring ring-one"/><div className="portal-ring ring-two"/><div className="portal-core"><span>V</span></div><i className="particle p1"/><i className="particle p2"/><i className="particle p3"/><i className="particle p4"/></div>
      <div className="hero-index"><span>ИРКУТСК</span><span>52°17′N</span></div>
    </section>
    <section className="next-section"><div className="section-heading"><div><span className="section-number">01</span><h2>Ближайшая<br/><em>тренировка</em></h2></div><Link href="/schedule" className="hairline-link">Все даты <ArrowUpRight size={14}/></Link></div><TrainingFeed limit={1}/></section>
    <div className="quick-links"><Link href="/schedule"><CalendarDays size={18}/><span><strong>Расписание</strong><small>Выбрать дату и зал</small></span><ArrowUpRight size={17}/></Link><Link href="/bookings"><span className="ball-icon">○</span><span><strong>Мои записи</strong><small>Управлять участием</small></span><ArrowUpRight size={17}/></Link></div>
  </div>;
}
