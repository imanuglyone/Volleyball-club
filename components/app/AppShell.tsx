'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { BookingIcon, HomeIcon, ProfileIcon, ScheduleIcon } from '@/components/icons/AvangardIcons';

const items = [
  { href: '/app', label: 'Главная', icon: HomeIcon },
  { href: '/app/schedule', label: 'Расписание', icon: ScheduleIcon },
  { href: '/app/bookings', label: 'Записи', icon: BookingIcon },
  { href: '/app/profile', label: 'Профиль', icon: ProfileIcon },
];

export function AppShell({ children, v2Enabled = true }: { children: React.ReactNode; v2Enabled?: boolean }) {
  const pathname = usePathname();
  if (!pathname.startsWith('/app')) return <>{children}</>;

  return (
    <div className={v2Enabled ? 'mini-app mini-app--v2' : 'mini-app mini-app--compat'} data-surface-version={v2Enabled ? '2' : 'compat'}>
      <header className="app-header">
        <Link href="/app" aria-label="Авангард — главная"><AvangardWordmark compact/></Link>
        <span>Ангарск · UTC+8</span>
      </header>
      <main className="app-content">{children}</main>
      <nav className="bottom-nav" aria-label="Основная навигация">
        {items.map(({ href, label, icon: Icon }) => {
          const target = href;
          const active = pathname === target || (target !== '/app' && pathname.startsWith(target));
          return <Link key={href} href={target} className={active ? 'nav-item active' : 'nav-item'} aria-current={active ? 'page' : undefined}><Icon size={22}/><span>{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
