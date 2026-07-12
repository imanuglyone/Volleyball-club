'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Home, UserRound, Volleyball } from 'lucide-react';

const items = [
  { href: '/app', label: 'Главная', icon: Home }, { href: '/schedule', label: 'Расписание', icon: CalendarDays },
  { href: '/bookings', label: 'Мои записи', icon: Volleyball }, { href: '/profile', label: 'Профиль', icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/admin')) return <>{children}</>;
  return <div className="mini-app"><div className="ambient-grid" aria-hidden="true"><span className="ambient-orbit orbit-a"/><span className="ambient-orbit orbit-b"/><span className="ambient-ray ray-a"/><span className="ambient-ray ray-b"/><i className="star s1"/><i className="star s2"/><i className="star s3"/><i className="star s4"/><i className="star s5"/><i className="star s6"/><i className="star s7"/><i className="star s8"/></div><main className="app-content">{children}</main><nav className="bottom-nav" aria-label="Основная навигация">
    {items.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || (href !== '/app' && pathname.startsWith(href));
      return <Link key={href} href={href} className={active ? 'nav-item active' : 'nav-item'} aria-current={active ? 'page' : undefined}>
        <Icon size={20} strokeWidth={1.8}/><span>{label}</span>
      </Link>;
    })}
  </nav></div>;
}
