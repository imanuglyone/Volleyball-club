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
      <div className="boarding-pass" aria-hidden="true"><div className="pass-head"><span>BOARDING PASS</span><i>AV · 01</i></div><div className="pass-route"><div><small>FROM</small><strong>HOME</strong></div><b>→</b><div><small>TO</small><strong>COURT</strong></div></div><div className="pass-message">Your next<br/><em>game</em></div><div className="pass-meta"><span>IRK</span><span>VOLLEYBALL</span><span>2026</span></div><div className="barcode"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
      <div className="hero-index"><span>ИРКУТСК</span><span>52°17′N</span></div>
    </section>
    <section className="next-section"><div className="section-heading"><div><span className="section-number">01</span><h2>Ближайшая<br/><em>тренировка</em></h2></div><Link href="/schedule" className="hairline-link">Все даты <ArrowUpRight size={14}/></Link></div><TrainingFeed limit={1}/></section>
    <div className="quick-links"><Link href="/schedule"><CalendarDays size={18}/><span><strong>Расписание</strong><small>Выбрать дату и зал</small></span><ArrowUpRight size={17}/></Link><Link href="/bookings"><span className="ball-icon">○</span><span><strong>Мои записи</strong><small>Управлять участием</small></span><ArrowUpRight size={17}/></Link></div>
  </div>;
}
