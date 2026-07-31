import Link from 'next/link';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { ArrowIcon } from '@/components/icons/AvangardIcons';

const links = [
  { href: '#club', label: 'Клуб' },
  { href: '#format', label: 'Формат' },
  { href: '#schedule', label: 'Расписание' },
  { href: '#venue', label: 'Площадка' },
  { href: '#faq', label: 'FAQ' }
];

export function PublicHeader() {
  return (
    <header className="public-header">
      <Link className="public-header__brand" href="/" aria-label="Авангард — на главную">
        <AvangardWordmark/>
      </Link>
      <nav className="public-header__nav" aria-label="Навигация по сайту">
        {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>
      <a className="public-button public-button--small public-header__cta" href="#schedule">
        Выбрать тренировку <ArrowIcon size={17}/>
      </a>
      <details className="public-menu">
        <summary><span className="sr-only">Открыть меню</span><i/><i/></summary>
        <nav aria-label="Мобильная навигация">
          {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
          <Link href="/app">Открыть приложение <ArrowIcon size={17}/></Link>
        </nav>
      </details>
    </header>
  );
}
