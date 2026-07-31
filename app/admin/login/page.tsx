'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(null); setLoading(true); try { const { error: signInError } = await createSupabaseBrowserClient().auth.signInWithPassword({ email, password }); if (signInError) { setError('Неверный логин или пароль.'); return; } router.push('/admin'); router.refresh(); } finally { setLoading(false); } }

  return <div className="admin-login-card"><div className="admin-login-brand"><AvangardWordmark/><span><LockKeyhole size={15}/>SECURE CONTROL ROOM</span></div><span className="admin-eyebrow">АВАНГАРД / АНГАРСК</span><h1>Вход в управление</h1><p>Тренировки, участники и расписание клуба.</p><form onSubmit={handleSubmit}><label><div className="label">Email</div><input type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label><div className="label">Пароль</div><input type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <div className="admin-login-error" role="alert">{error}</div>}<button type="submit" className="admin-primary admin-submit" disabled={loading}><span>{loading ? 'Входим…' : 'Войти'}</span><ArrowRight size={18}/></button></form></div>;
}
