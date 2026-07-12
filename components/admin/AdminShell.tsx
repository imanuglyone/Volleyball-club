'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, ExternalLink, LayoutDashboard, LogOut, Smartphone } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/admin/login') return <>{children}</>;

  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand"><span>AV</span><div><strong>Авангард</strong><small>CONTROL ROOM</small></div></Link>
      <nav aria-label="Навигация администратора"><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><LayoutDashboard size={19}/><span>Тренировки</span></Link><Link href="/admin/trainings/new" className={pathname.includes('/new') ? 'active' : ''}><CalendarDays size={19}/><span>Новая тренировка</span></Link></nav>
      <div className="admin-sidebar-bottom"><Link href="/app"><Smartphone size={18}/>Приложение</Link><Link href="/"><ExternalLink size={18}/>Сайт</Link><button type="button" onClick={logout}><LogOut size={18}/>Выйти</button></div>
    </aside>
    <header className="admin-mobile-header"><Link href="/admin" className="admin-brand"><span>AV</span><div><strong>Управление</strong><small>ADMIN</small></div></Link><Link href="/admin/trainings/new" className="admin-mobile-add">＋</Link></header>
    <main className="admin-main">{children}</main>
    <nav className="admin-mobile-nav" aria-label="Навигация администратора"><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><LayoutDashboard size={20}/><span>Тренировки</span></Link><Link href="/admin/trainings/new" className={pathname.includes('/new') ? 'active' : ''}><CalendarDays size={20}/><span>Создать</span></Link><Link href="/app"><Smartphone size={20}/><span>Приложение</span></Link><button type="button" onClick={logout}><LogOut size={20}/><span>Выйти</span></button></nav>
  </div>;
}
