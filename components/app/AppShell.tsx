'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Home, UserRound, Volleyball } from 'lucide-react';

const items = [
  { href: '/', label: 'Главная', icon: Home }, { href: '/schedule', label: 'Расписание', icon: CalendarDays },
  { href: '/bookings', label: 'Мои записи', icon: Volleyball }, { href: '/profile', label: 'Профиль', icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return <div className="mini-app"><main className="app-content">{children}</main><nav className="bottom-nav" aria-label="Основная навигация">
    {items.map(({ href, label, icon: Icon }) => {
      const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
      return <Link key={href} href={href} className={active ? 'nav-item active' : 'nav-item'} aria-current={active ? 'page' : undefined}>
        <Icon size={20} strokeWidth={1.8}/><span>{label}</span>
      </Link>;
    })}
  </nav></div>;
}
