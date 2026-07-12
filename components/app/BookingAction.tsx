'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/components/telegram/TelegramProvider';

export function BookingAction({ trainingId, disabled }: { trainingId: string; disabled: boolean }) {
  const { profile, apiFetch, haptic, initData } = useTelegram(); const router = useRouter();
  const [name, setName] = useState(profile?.display_name ?? ''); const [phone, setPhone] = useState(profile?.phone ?? '');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState(false);
  async function book() {
    if (!initData) { setError('Откройте приложение из Telegram-бота, чтобы записаться.'); haptic('error'); return; }
    setBusy(true); setError(null);
    const response = await apiFetch('/api/mini-app/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ training_id: trainingId, display_name: name, phone }) });
    const data = await response.json().catch(() => ({})); setBusy(false);
    if (!response.ok) {
      const messages: Record<string, string> = {
        booking_duplicate: 'Вы уже записаны.', booking_full: 'Места только что закончились.',
        training_inactive: 'Запись на эту тренировку закрыта.', training_past: 'Эта тренировка уже прошла.',
        validation: 'Проверьте имя и телефон.', profile_required: 'Укажите имя и корректный телефон.'
      };
      setError(messages[data.error] ?? 'Не удалось записаться. Попробуйте ещё раз.'); haptic('error'); return;
    }
    setSuccess(true); haptic('success'); router.refresh();
  }
  if (success) return <div className="success-card"><strong>Вы записаны!</strong><p>Запись появилась в разделе «Мои записи».</p><button className="button-primary" onClick={() => router.push('/bookings')}>Мои записи</button></div>;
  return <div className="booking-action"><label>Имя<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя"/></label><label>Телефон<input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00"/></label>{error && <p className="form-error">{error}</p>}<button className="button-primary" disabled={disabled || busy} onClick={book}>{busy ? 'Записываем…' : disabled ? 'Мест нет' : 'Записаться'}</button></div>;
}
