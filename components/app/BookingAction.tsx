'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Check, MapPin, Volleyball } from 'lucide-react';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { formatDate, formatTimeRange } from '@/lib/format';
import type { TrainingStats } from '@/lib/types';
import { isVisualPreview } from '@/lib/visual-preview';

type ApiError = { error?: string };

function calendarStamp(date: string, time: string) {
  return `${date.replaceAll('-', '')}T${time.slice(0, 5).replace(':', '')}00`;
}

export function BookingAction({ training, disabled }: { training: TrainingStats; disabled: boolean }) {
  const { profile, apiFetch, haptic, initData } = useTelegram();
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

  async function book() {
    if (!initData) { setError('Откройте приложение из Telegram-бота, чтобы записаться.'); haptic('error'); return; }
    setBusy(true); setError(null);
    const response = await apiFetch('/api/mini-app/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ training_id: training.id, display_name: name, phone }) });
    const data = await response.json().catch(() => ({})) as ApiError;
    setBusy(false);
    if (!response.ok) {
      const messages: Record<string, string> = { booking_duplicate: 'Вы уже записаны.', booking_full: 'Места только что закончились.', training_inactive: 'Запись на эту тренировку закрыта.', training_past: 'Эта тренировка уже прошла.', validation: 'Проверьте имя и телефон.', profile_required: 'Укажите имя и корректный телефон.' };
      setError(messages[data.error ?? ''] ?? 'Не удалось записаться. Попробуйте ещё раз.'); haptic('error'); return;
    }
    setSuccess(true); haptic('success'); window.dispatchEvent(new Event('booking:created')); router.refresh();
  }

  function addToCalendar() {
    const dates = `${calendarStamp(training.date, training.start_time)}/${calendarStamp(training.date, training.end_time)}`;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE'); url.searchParams.set('text', 'Волейбол · Авангард'); url.searchParams.set('dates', dates); url.searchParams.set('location', [training.location_name, training.address].filter(Boolean).join(', '));
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  if (success) return <section className="booking-success" aria-live="polite"><span className="booking-success__icon"><Check size={28}/></span><div className="eyebrow">Место в команде</div><h2>Ты в игре!</h2><p className="booking-success__date">{formatDate(training.date)} · {formatTimeRange(training.start_time, training.end_time)}</p><p className="booking-success__place"><MapPin size={17}/>{training.location_name}{training.address ? `, ${training.address}` : ''}</p><div className="booking-success__actions"><Button full onClick={() => router.push('/bookings')}><Volleyball size={18}/>Мои записи</Button><Button full variant="secondary" onClick={addToCalendar}><CalendarPlus size={18}/>Добавить в календарь</Button></div></section>;

  if ((profile?.display_name && profile.phone) || visualPreview) return <section className="booking-action booking-action--compact" aria-labelledby="booking-title"><div><span className="section-number">03</span><h2 id="booking-title">Занять место</h2></div><p>Данные сохранены — подтверди запись одним нажатием.</p>{error && <p className="form-error" role="alert">{error}</p>}<Button full size="lg" disabled={disabled} loading={busy} onClick={book}>{disabled ? 'Мест нет' : 'Записаться'}</Button></section>;

  return <section className="booking-action" aria-labelledby="booking-title"><div><span className="section-number">03</span><h2 id="booking-title">Занять место</h2></div><p>Подтверди данные — повторная запись займёт одно нажатие.</p><Field label="Имя" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ваше имя" autoComplete="name"/><Field label="Телефон" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 900 000-00-00" autoComplete="tel"/>{error && <p className="form-error" role="alert">{error}</p>}<Button full size="lg" disabled={disabled} loading={busy} onClick={book}>{disabled ? 'Мест нет' : 'Записаться'}</Button></section>;
}
