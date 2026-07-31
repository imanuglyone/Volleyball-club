'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, PhoneIcon, ProfileIcon } from '@/components/icons/AvangardIcons';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { isVisualPreview } from '@/lib/visual-preview';

export function ProfileScreen() {
  const { profile, apiFetch, initData, haptic, refreshBootstrap } = useTelegram();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const preview = typeof window !== 'undefined' && isVisualPreview();

  useEffect(() => {
    setName(profile?.display_name ?? (preview ? 'Иван' : ''));
    setPhone(profile?.phone ?? (preview ? '+7 900 123-45-67' : ''));
  }, [profile, preview]);

  async function save() {
    setBusy(true);
    setSaved(false);
    setMessage(null);
    try {
      const response = await apiFetch('/api/mini-app/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name, phone }),
      });
      if (!response.ok) throw new Error('profile');
      setSaved(true);
      haptic('success');
      await refreshBootstrap();
    } catch {
      setMessage('Не удалось сохранить данные. Проверьте имя и телефон.');
      haptic('error');
    } finally {
      setBusy(false);
    }
  }

  async function verifyPhone() {
    setVerifying(true);
    setMessage(null);
    try {
      const response = await apiFetch('/api/mini-app/profile/request-contact', { method: 'POST' });
      if (!response.ok) throw new Error('contact');
      setMessage('Бот отправил кнопку в чат. Нажмите её, чтобы передать свой контакт.');
      haptic('success');
      setTimeout(() => void refreshBootstrap(), 1500);
    } catch {
      setMessage('Не удалось запросить подтверждение. Вернитесь в чат с ботом и попробуйте снова.');
      haptic('error');
    } finally {
      setVerifying(false);
    }
  }

  const verified = Boolean(profile?.phone_verified_at) || preview;
  return (
    <div className="screen profile-screen">
      <header className="screen-header"><div><div className="eyebrow">Игрок</div><h1>Профиль</h1></div></header>
      <section className="profile-identity">
        <div className="avatar">{profile?.photo_url ? <img src={profile.photo_url} alt=""/> : preview ? <span className="avatar__initial">И</span> : <ProfileIcon size={30}/>}</div>
        <div><strong>{profile?.display_name || profile?.first_name || (preview ? 'Иван' : 'Гость')}</strong><span>{profile?.telegram_username ? `@${profile.telegram_username}` : preview ? '@avangard_player' : initData ? 'Telegram' : 'Режим браузера'}</span></div>
      </section>
      <section className={verified ? 'verification-card verified' : 'verification-card'}>
        <span>{verified ? <CheckIcon size={22}/> : <PhoneIcon size={22}/>}</span>
        <div><strong>{verified ? 'Телефон подтверждён' : 'Подтвердите телефон'}</strong><p>{verified ? 'Запись доступна в одно нажатие.' : 'Telegram сверит контакт и защитит ваши записи.'}</p></div>
        {!verified && <Button variant="secondary" loading={verifying} disabled={!initData} onClick={verifyPhone}>Подтвердить</Button>}
      </section>
      <section className="profile-form" aria-labelledby="profile-data-title">
        <div><span className="section-number">01</span><h2 id="profile-data-title">Личные данные</h2></div>
        <Field label="Отображаемое имя" value={name} onChange={(event) => setName(event.target.value)} disabled={!initData}/>
        <Field label="Телефон" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={!initData}/>
        <p className="form-hint">Телефон виден только организатору клуба.</p>
        {saved && <p className="success-text" role="status">Изменения сохранены</p>}
        {message && <p className="form-message" role="status">{message}</p>}
        <Button full loading={busy} onClick={save} disabled={!initData}>Сохранить</Button>
      </section>
    </div>
  );
}
