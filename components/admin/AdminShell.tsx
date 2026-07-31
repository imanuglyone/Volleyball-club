'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, ExternalLink, LayoutDashboard, LogOut, Plus, Smartphone } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';

export function AdminShell({ children, v2Enabled = true }: { children: React.ReactNode; v2Enabled?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/admin/login') return <>{children}</>;

  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className={v2Enabled ? 'admin-shell admin-shell--v2' : 'admin-shell admin-shell--compat'} data-surface-version={v2Enabled ? '2' : 'compat'}>
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><AvangardWordmark/><small>{v2Enabled ? 'ПАНЕЛЬ КЛУБА' : 'CONTROL ROOM'}</small></Link>
        <nav aria-label="Навигация администратора">
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><LayoutDashboard size={19}/><span>{v2Enabled ? 'Обзор' : 'Тренировки'}</span></Link>
          <Link href="/admin/trainings/new" className={pathname.includes('/new') ? 'active' : ''}><CalendarDays size={19}/><span>Новая тренировка</span></Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/app"><Smartphone size={18}/>Приложение</Link>
          <Link href="/"><ExternalLink size={18}/>Сайт</Link>
          <button type="button" onClick={logout}><LogOut size={18}/>Выйти</button>
        </div>
      </aside>
      <header className="admin-mobile-header">
        <Link href="/admin" className="admin-brand"><AvangardWordmark compact/></Link>
        <Link href="/admin/trainings/new" className="admin-mobile-add" aria-label="Создать тренировку"><Plus size={20}/></Link>
      </header>
      <main className="admin-main">{children}</main>
      <nav className="admin-mobile-nav" aria-label="Навигация администратора">
        <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><LayoutDashboard size={20}/><span>{v2Enabled ? 'Обзор' : 'Тренировки'}</span></Link>
        <Link href="/admin/trainings/new" className={pathname.includes('/new') ? 'active' : ''}><CalendarDays size={20}/><span>Создать</span></Link>
        <Link href="/app"><Smartphone size={20}/><span>Приложение</span></Link>
        <button type="button" onClick={logout}><LogOut size={20}/><span>Выйти</span></button>
      </nav>
    </div>
  );
}
