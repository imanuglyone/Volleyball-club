import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Sparkles, Users } from 'lucide-react';

const features = [
  { number: '01', icon: CalendarDays, title: 'Живое расписание', text: 'Ближайшие тренировки, свободные места и вся информация о площадке в одном экране.' },
  { number: '02', icon: Users, title: 'Своя команда', text: 'Приходи один или с друзьями. Здесь легко найти людей, с которыми хочется играть снова.' },
  { number: '03', icon: Sparkles, title: 'Без лишних шагов', text: 'Открой приложение в Telegram, выбери тренировку и подтверди участие одним касанием.' }
];

export default function PublicHomePage() {
  return <main className="public-site">
    <div className="public-noise" aria-hidden="true" />
    <header className="public-header">
      <Link href="/" className="public-logo"><span>AV</span><strong>Авангард</strong></Link>
      <nav aria-label="Навигация по сайту"><a href="#about">О клубе</a><a href="#format">Формат</a><Link href="/schedule">Расписание</Link></nav>
      <Link className="public-header-cta" href="/app">Открыть приложение <ArrowRight size={16}/></Link>
    </header>

    <section className="public-hero">
      <div className="public-hero-orbit" aria-hidden="true"><i/><i/><i/><span>AV</span></div>
      <div className="public-hero-copy">
        <p className="public-kicker"><span/> Волейбол в Ангарске · 2026</p>
        <h1>Твоя игра.<br/><em>Твоя команда.</em></h1>
        <p className="public-lead">Тренировки, после которых хочется вернуться. Живой волейбол для тех, кто ценит движение, людей и атмосферу площадки.</p>
        <div className="public-actions"><Link href="/app">Выбрать тренировку <ArrowRight size={19}/></Link><Link href="/schedule">Смотреть расписание</Link></div>
      </div>
      <div className="public-hero-meta"><span>52°32′N / 103°53′E</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>

    <section className="public-manifesto" id="about">
      <div><span className="public-section-no">01 / МАНИФЕСТ</span><p>Мы создаём не просто расписание тренировок.</p></div>
      <h2>Место, где вечер<br/>становится <em>игрой</em>,<br/>а люди — командой.</h2>
    </section>

    <section className="public-features" id="format">
      <div className="public-section-heading"><span className="public-section-no">02 / КАК ЭТО РАБОТАЕТ</span><h2>Всё для игры.<br/><em>Ничего лишнего.</em></h2></div>
      <div className="public-feature-grid">{features.map(({ number, icon: Icon, title, text }) => <article key={number}><div><span>{number}</span><Icon size={22}/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="public-venue">
      <div className="public-venue-art" aria-hidden="true"><div className="court-lines"/><span>COURT<br/>IS<br/><em>READY</em></span></div>
      <div className="public-venue-copy"><span className="public-section-no">03 / ПЛОЩАДКА</span><MapPin size={26}/><h2>В центре<br/>движения</h2><p>Удобные залы, понятные адреса и актуальная вместимость. Ты заранее знаешь, куда идти и кто будет рядом.</p><Link href="/schedule">Найти свою тренировку <ArrowRight size={18}/></Link></div>
    </section>

    <section className="public-final"><span className="public-section-no">ТВОЙ СЛЕДУЮЩИЙ МАТЧ</span><h2>Увидимся<br/><em>на площадке.</em></h2><Link href="/app">Открыть приложение <ArrowRight size={21}/></Link></section>
    <footer className="public-footer"><div className="public-logo"><span>AV</span><strong>Авангард</strong></div><p>Волейбольный клуб · Ангарск</p><span>© 2026</span></footer>
  </main>;
}
