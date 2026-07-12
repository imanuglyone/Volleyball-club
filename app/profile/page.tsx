'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTelegram } from '@/components/telegram/TelegramProvider';

export default function ProfilePage() {
  const { profile, apiFetch, initData, haptic } = useTelegram();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => { setName(profile?.display_name ?? ''); setPhone(profile?.phone ?? ''); }, [profile]);
  async function save() { const response = await apiFetch('/api/mini-app/profile', { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ display_name:name, phone }) }); setSaved(response.ok); haptic(response.ok ? 'success' : 'error'); }

  return <div className="screen"><header className="screen-header"><div className="eyebrow">Аккаунт</div><h1>Профиль</h1></header><section className="profile-card"><div className="avatar">{profile?.photo_url ? <img src={profile.photo_url} alt=""/> : (profile?.first_name?.[0] ?? 'V')}</div><div><strong>{profile?.display_name ?? 'Гость'}</strong><span>{profile?.telegram_username ? `@${profile.telegram_username}` : initData ? 'Telegram' : 'Режим браузера'}</span></div></section><div className="booking-action"><label>Отображаемое имя<input value={name} onChange={(event) => setName(event.target.value)} disabled={!initData}/></label><label>Телефон<input inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={!initData}/></label>{saved && <p className="success-text">Сохранено</p>}<button className="button-primary" onClick={save} disabled={!initData}>Сохранить</button></div><Link href="/admin" className="profile-admin-link"><ShieldCheck size={19}/><span><strong>Управление клубом</strong><small>Тренировки и участники</small></span></Link></div>;
}
