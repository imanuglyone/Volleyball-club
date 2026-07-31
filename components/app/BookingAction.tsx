'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarPlus, Check, MapPin, Volleyball } from 'lucide-react';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { formatDate, formatTimeRange } from '@/lib/format';
import type { TrainingSummary } from '@/lib/types';
import { isVisualPreview } from '@/lib/visual-preview';
import { buildMiniAppBookingPayload } from './booking-payload';

type ApiError = { error?: string };

function calendarStamp(date: string, time: string) {
  return `${date.replaceAll('-', '')}T${time.slice(0, 5).replace(':', '')}00`;
}

export function BookingAction({ training, disabled, booked = false }: { training: TrainingSummary; disabled: boolean; booked?: boolean }) {
  const { profile, apiFetch, haptic, initData, refreshBootstrap } = useTelegram();
  const router = useRouter();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [visualPreview, setVisualPreview] = useState(false);

  useEffect(() => {
    const preview = isVisualPreview();
    setVisualPreview(preview);
    if (preview) { setName('Иван'); setPhone('+7 900 123-45-67'); }
    if (process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).get('success') === '1') setSuccess(true);
  }, []);

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
    if (profile?.phone) setPhone(profile.phone);
  }, [profile?.display_name, profile?.phone]);

  async function book() {
    if (!initData) { setError('Откройте приложение из Telegram-бота, чтобы записаться.'); haptic('error'); return; }
    setBusy(true); setError(null);
    const response = await apiFetch('/api/mini-app/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildMiniAppBookingPayload(training.id, name, phone)),
    });
    const data = await response.json().catch(() => ({})) as ApiError;
    setBusy(false);
    if (!response.ok) {
      const messages: Record<string, string> = {
        booking_duplicate: 'Вы уже записаны.',
        booking_full: 'Места только что закончились.',
        training_inactive: 'Запись на эту тренировку закрыта.',
        training_past: 'Эта тренировка уже прошла.',
        training_not_found: 'Тренировка больше недоступна.',
        validation: 'Не удалось подтвердить данные и согласие. Обновите экран и попробуйте снова.',
        profile_required: 'Укажите имя и корректный телефон.',
        phone_not_verified: 'Сначала подтвердите телефон в профиле через Telegram.',
      };
      setError(messages[data.error ?? ''] ?? 'Не удалось записаться. Попробуйте ещё раз.'); haptic('error'); return;
    }
    setSuccess(true); haptic('success'); window.dispatchEvent(new Event('booking:created')); void refreshBootstrap(); router.refresh();
  }

  function addToCalendar() {
    const dates = `${calendarStamp(training.date, training.start_time)}/${calendarStamp(training.date, training.end_time)}`;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE'); url.searchParams.set('text', 'Волейбол · Авангард'); url.searchParams.set('dates', dates); url.searchParams.set('location', [training.location_name, training.address].filter(Boolean).join(', '));
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  if (booked) return <section className="booking-action booking-action--sticky booking-action--booked"><div><Check size={20}/><span><strong>Вы уже записаны</strong><small>Место закреплено за вами</small></span></div><Link href="/app/bookings" className="app-secondary-cta">Открыть запись</Link></section>;

  if (success) return <section className="booking-success" aria-live="polite"><span className="booking-success__icon"><Check size={28}/></span><div className="eyebrow">Место в команде</div><h2>Ты в игре!</h2><p className="booking-success__date">{formatDate(training.date)} · {formatTimeRange(training.start_time, training.end_time)}</p><p className="booking-success__place"><MapPin size={17}/>{training.location_name}{training.address ? `, ${training.address}` : ''}</p><div className="booking-success__actions"><Button full onClick={() => router.push('/app/bookings')}><Volleyball size={18}/>Мои записи</Button><Button full variant="secondary" onClick={addToCalendar}><CalendarPlus size={18}/>Добавить в календарь</Button></div></section>;

  const profileComplete = Boolean(profile?.display_name && profile.phone);
  const verificationSupported = Boolean(profile && Object.prototype.hasOwnProperty.call(profile, 'phone_verified_at'));
  const phoneVerified = !verificationSupported || Boolean(profile?.phone_verified_at) || visualPreview;

  if ((profileComplete && phoneVerified) || visualPreview) return <section className="booking-action booking-action--compact booking-action--sticky" aria-labelledby="booking-title"><div><span className="section-number">03</span><h2 id="booking-title">Занять место</h2></div><p>Профиль подтверждён — запись займёт одно нажатие.</p>{error && <p className="form-error" role="alert">{error}</p>}<Button full size="lg" disabled={disabled} loading={busy} onClick={book}>{disabled ? 'Мест нет' : 'Записаться'}</Button><small className="booking-consent">Нажимая «Записаться», вы соглашаетесь на обработку данных для организации тренировки.</small></section>;

  if (profileComplete && !phoneVerified) return <section className="booking-action booking-action--compact booking-action--sticky" aria-labelledby="booking-title"><div><span className="section-number">03</span><h2 id="booking-title">Подтвердите телефон</h2></div><p>Telegram должен подтвердить контакт перед записью.</p><Link href="/app/profile" className="app-main-cta">Перейти в профиль</Link></section>;

  return <section className="booking-action booking-action--sticky" aria-labelledby="booking-title"><div><span className="section-number">03</span><h2 id="booking-title">Занять место</h2></div><p>Заполните профиль один раз — дальше запись займёт одно нажатие.</p><Field label="Имя" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ваше имя" autoComplete="name"/><Field label="Телефон" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 900 000-00-00" autoComplete="tel"/>{error && <p className="form-error" role="alert">{error}</p>}<Button full size="lg" disabled={disabled} loading={busy} onClick={book}>{disabled ? 'Мест нет' : 'Сохранить и записаться'}</Button><small className="booking-consent">Нажимая кнопку, вы соглашаетесь на обработку данных для организации тренировки.</small></section>;
}
