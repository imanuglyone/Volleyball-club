'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Volleyball } from 'lucide-react';
import { TrainingFeed } from '@/components/app/TrainingFeed';
import { useTelegram } from '@/components/telegram/TelegramProvider';

export default function MiniAppHomePage() {
  const { profile } = useTelegram();
  const greeting = profile?.first_name ? `Привет, ${profile.first_name}` : 'Твоя следующая игра';

  return <div className="screen home-screen">
    <header className="home-intro"><div className="eyebrow">Волейбол в Ангарске</div><h1>{greeting}</h1><p>Вечерняя площадка, живая команда и место, которое уже ждёт тебя.</p></header>
    <section className="next-training-section"><div className="section-row"><div><span className="section-number">01</span><h2>Ближайшая<br/>тренировка</h2></div><Link href="/schedule" className="text-link">Все даты <ArrowUpRight size={15}/></Link></div><TrainingFeed limit={1}/></section>
    <section className="quick-actions" aria-label="Быстрые действия"><Link href="/schedule"><span><CalendarDays size={20}/></span><div><strong>Расписание</strong><small>Выбрать дату и зал</small></div><ArrowUpRight size={17}/></Link><Link href="/bookings"><span><Volleyball size={20}/></span><div><strong>Мои записи</strong><small>Управлять участием</small></div><ArrowUpRight size={17}/></Link></section>
  </div>;
}
