'use client';

import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export default function ProfilePage() {
  const { profile, apiFetch, initData, haptic } = useTelegram();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setName(profile?.display_name ?? ''); setPhone(profile?.phone ?? ''); }, [profile]);
  async function save() { setBusy(true); setSaved(false); const response = await apiFetch('/api/mini-app/profile', { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ display_name:name, phone }) }); setBusy(false); setSaved(response.ok); haptic(response.ok ? 'success' : 'error'); }

  return <div className="screen profile-screen"><header className="screen-header"><div className="eyebrow">Игрок</div><h1>Профиль</h1></header><section className="profile-identity"><div className="avatar">{profile?.photo_url ? <img src={profile.photo_url} alt=""/> : <UserRound size={32}/>}</div><div><strong>{profile?.display_name || profile?.first_name || 'Гость'}</strong><span>{profile?.telegram_username ? `@${profile.telegram_username}` : initData ? 'Telegram' : 'Режим браузера'}</span></div></section><section className="profile-form" aria-labelledby="profile-data-title"><div><span className="section-number">01</span><h2 id="profile-data-title">Личные данные</h2></div><Field label="Отображаемое имя" value={name} onChange={(event) => setName(event.target.value)} disabled={!initData}/><Field label="Телефон" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={!initData}/><p className="form-hint">Телефон виден только организатору клуба.</p>{saved && <p className="success-text" role="status">Изменения сохранены</p>}<Button full loading={busy} onClick={save} disabled={!initData}>Сохранить</Button></section><Link href="/admin" className="profile-admin-link"><ShieldCheck size={20}/><span><strong>Control room</strong><small>Тренировки и участники</small></span><ArrowUpRight size={17}/></Link></div>;
}
