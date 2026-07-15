'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, ExternalLink, LayoutDashboard, LogOut, Plus, Smartphone } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { MidnightCourtBackground } from '@/components/visuals/MidnightCourtBackground';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/admin/login') return <>{children}</>;
  async function logout() { await createSupabaseBrowserClient().auth.signOut(); router.replace('/admin/login'); router.refresh(); }

  return <div className="admin-shell"><MidnightCourtBackground variant="admin"/><aside className="admin-sidebar"><Link href="/admin" className="admin-brand"><AvangardWordmark/><small>CONTROL ROOM</small></Link><nav aria-label="Навигация администратора"><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><LayoutDashboard size={19}/><span>Тренировки</span></Link><Link href="/admin/trainings/new" className={pathname.includes('/new') ? 'active' : ''}><CalendarDays size={19}/><span>Новая тренировка</span></Link></nav><div className="admin-sidebar-bottom"><Link href="/app"><Smartphone size={18}/>Приложение</Link><Link href="/"><ExternalLink size={18}/>Сайт</Link><button type="button" onClick={logout}><LogOut size={18}/>Выйти</button></div></aside><header className="admin-mobile-header"><Link href="/admin" className="admin-brand"><AvangardWordmark compact/></Link><Link href="/admin/trainings/new" className="admin-mobile-add" aria-label="Создать тренировку"><Plus size={20}/></Link></header><main className="admin-main">{children}</main><nav className="admin-mobile-nav" aria-label="Навигация администратора"><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><LayoutDashboard size={20}/><span>Тренировки</span></Link><Link href="/admin/trainings/new" className={pathname.includes('/new') ? 'active' : ''}><CalendarDays size={20}/><span>Создать</span></Link><Link href="/app"><Smartphone size={20}/><span>Приложение</span></Link><button type="button" onClick={logout}><LogOut size={20}/><span>Выйти</span></button></nav></div>;
}
