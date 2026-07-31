import Link from 'next/link';
import { ArrowIcon, BallIcon, ClockIcon, TeamIcon } from '@/components/icons/AvangardIcons';
import { HeroVideo } from '@/components/public/HeroVideo';

const signals = [
  { icon: ClockIcon, value: '60 сек', label: 'на запись' },
  { icon: TeamIcon, value: 'Живой', label: 'состав игроков' },
  { icon: BallIcon, value: 'Каждую', label: 'неделю' }
];

export function HeroSection() {
  return (
    <section className="public-hero" aria-labelledby="public-hero-title">
      <div className="public-hero__media" aria-hidden="true">
        <picture>
          <source media="(max-width: 620px)" srcSet="/images/v2/avangard-hero-poster-cobalt-mobile.webp"/>
          <img
            src="/images/v2/avangard-hero-poster-cobalt.webp"
            alt=""
            width="1599"
            height="900"
            fetchPriority="high"
            className="public-hero__poster"
          />
        </picture>
        <HeroVideo />
        <div className="public-hero__media-shade"/>
        <div className="public-hero__trajectory"><i/><i/><i/></div>
      </div>
      <div className="public-hero__copy public-reveal">
        <p className="public-kicker"><span/> Волейбольный клуб · Ангарск</p>
        <h1 id="public-hero-title">Твоя<br/>игра —<br/><em>вперёд.</em></h1>
        <p className="public-hero__lead">Вечерние тренировки для тех, кто любит движение, команду и честную игру без лишней суеты.</p>
        <div className="public-hero__actions">
          <a className="public-button" href="#schedule">Выбрать тренировку <ArrowIcon size={19}/></a>
          <Link className="public-text-link" href="/app">Я уже в клубе <ArrowIcon size={18}/></Link>
        </div>
      </div>
      <div className="public-hero__signals" aria-label="О клубе в цифрах">
        {signals.map(({ icon: Icon, value, label }) => (
          <div key={value + label}>
            <Icon size={20}/>
            <p><strong>{value}</strong><span>{label}</span></p>
          </div>
        ))}
      </div>
      <p className="public-hero__scroll" aria-hidden="true">Листай к игре <span/></p>
    </section>
  );
}
