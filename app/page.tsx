'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { TrainingFeed } from '@/components/app/TrainingFeed';
import { useTelegram } from '@/components/telegram/TelegramProvider';

export default function HomePage() {
  const { profile } = useTelegram();
  return <div className="screen"><header className="screen-header"><div className="eyebrow">Волейбольный клуб</div><h1>{profile?.first_name ? `Привет, ${profile.first_name}` : 'Ближайшая игра'}</h1><p>Выберите тренировку и забронируйте место за пару касаний.</p></header><TrainingFeed limit={1}/><div className="quick-links"><Link href="/schedule"><CalendarDays size={20}/><span><strong>Расписание</strong><small>Все будущие тренировки</small></span><ArrowRight size={18}/></Link><Link href="/bookings"><span className="ball-icon">○</span><span><strong>Мои записи</strong><small>Предстоящие и прошедшие</small></span><ArrowRight size={18}/></Link></div></div>;
}
