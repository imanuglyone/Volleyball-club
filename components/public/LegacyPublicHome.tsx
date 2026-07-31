import Link from 'next/link';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { ArrowIcon, BallIcon, ClockIcon, PinIcon } from '@/components/icons/AvangardIcons';

export function LegacyPublicHome() {
  return (
    <main className="legacy-public">
      <header>
        <Link href="/" aria-label="Авангард — на главную"><AvangardWordmark/></Link>
        <Link href="/app">Открыть приложение <ArrowIcon size={17}/></Link>
      </header>
      <section>
        <div>
          <p>Волейбольный клуб · Ангарск</p>
          <h1>Твоя игра.<br/><em>Твоя команда.</em></h1>
          <p>Актуальные тренировки, свободные места и простая запись в приложении клуба.</p>
          <div><Link href="/app">Открыть приложение <ArrowIcon size={18}/></Link><Link href="/schedule">Расписание</Link></div>
        </div>
        <div className="legacy-public__ball" aria-hidden="true"><BallIcon size={72}/><i/><i/></div>
      </section>
      <footer>
        <span><ClockIcon size={18}/> Актуальное расписание</span>
        <span><PinIcon size={18}/> Ангарск</span>
        <span><BallIcon size={18}/> Любительский волейбол</span>
      </footer>
    </main>
  );
}
