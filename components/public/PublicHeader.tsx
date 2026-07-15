import Link from 'next/link';
import { ArrowUpRight, Menu } from 'lucide-react';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { buttonClassName } from '@/components/ui/Button';

const links = [
  { href: '#about', label: 'О клубе' },
  { href: '#format', label: 'Формат' },
  { href: '#schedule', label: 'Расписание' },
  { href: '#contacts', label: 'Контакты' }
];

export function PublicHeader() {
  return <header className="public-header">
    <Link href="/" aria-label="Авангард — на главную"><AvangardWordmark/></Link>
    <nav className="public-header__nav" aria-label="Навигация по сайту">{links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
    <Link href="/app" className={`${buttonClassName({ size: 'sm' })} public-header__cta`}>Открыть приложение <ArrowUpRight size={16}/></Link>
    <details className="public-menu">
      <summary aria-label="Открыть меню"><Menu size={21}/></summary>
      <nav aria-label="Мобильная навигация">{links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}<Link href="/app">Открыть приложение <ArrowUpRight size={16}/></Link></nav>
    </details>
  </header>;
}
