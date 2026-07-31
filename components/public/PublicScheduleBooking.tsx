'use client';

import Script from 'next/script';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { ArrowIcon, CheckIcon, ClockIcon, PinIcon } from '@/components/icons/AvangardIcons';
import { club } from './site-content';
import type { PublicTrainingView } from './public-types';

type PublicTrainingsPayload = { version?: number; trainings?: PublicTrainingView[] } | PublicTrainingView[];
type BookingResult = { booking_id: string; remaining: number; manage_url: string };

const errorMessages: Record<string, string> = {
  validation: 'Проверьте имя, телефон и выбранную тренировку.',
  unauthorized: 'Не удалось подтвердить защиту формы. Обновите страницу и попробуйте снова.',
  booking_duplicate: 'На этот телефон уже есть активная запись.',
  booking_full: 'Последнее место только что заняли. Обновите расписание.',
  training_inactive: 'Эта тренировка больше недоступна.',
  rate_limited: 'Слишком много попыток. Подождите немного и попробуйте снова.',
  conflict: 'Данные изменились. Обновите расписание и повторите.',
  server_error: 'Не удалось создать запись. Попробуйте ещё раз.'
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })
    .format(new Date(`${value}T12:00:00`));
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function unwrapTrainings(payload: PublicTrainingsPayload) {
  return Array.isArray(payload) ? payload : payload.trainings ?? [];
}

export function PublicScheduleBooking({
  initialTrainings,
  initialError = false,
}: {
  initialTrainings: PublicTrainingView[];
  initialError?: boolean;
}) {
  const [trainings, setTrainings] = useState(initialTrainings);
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState(initialTrainings.find((item) => item.remaining > 0)?.id ?? '');
  const [scheduleState, setScheduleState] = useState<'ready' | 'loading' | 'error'>(
    initialError ? 'error' : 'ready',
  );
  const [bookingState, setBookingState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [bookingError, setBookingError] = useState('');
  const [manageUrl, setManageUrl] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyRef = useRef('');
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const turnstileMockToken =
    process.env.NEXT_PUBLIC_TURNSTILE_MOCK_TOKEN || '';

  const visible = useMemo(() => (showAll ? trainings : trainings.slice(0, 6)), [showAll, trainings]);
  const selected = trainings.find((item) => item.id === selectedId);

  async function reload() {
    setScheduleState('loading');
    try {
      const response = await fetch('/api/public/trainings', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('schedule');
      const next = unwrapTrainings(await response.json() as PublicTrainingsPayload);
      setTrainings(next);
      setSelectedId((current) => next.some((item) => item.id === current)
        ? current
        : next.find((item) => item.remaining > 0)?.id ?? '');
      setScheduleState('ready');
    } catch {
      setScheduleState('error');
    }
  }

  function chooseTraining(id: string) {
    setSelectedId(id);
    setBookingState('idle');
    setBookingError('');
    requestAnimationFrame(() => document.getElementById('public-booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setBookingError('');
    if (!selectedId) {
      setBookingError('Сначала выберите тренировку.');
      return;
    }
    setBookingState('submitting');
    try {
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          version: 1,
          training_id: selectedId,
          name: String(formData.get('name') || ''),
          phone: String(formData.get('phone') || ''),
          consent: formData.get('consent') === 'on',
          consent_version: club.consentVersion,
          idempotency_key: idempotencyRef.current || (idempotencyRef.current = crypto.randomUUID()),
          turnstile_token: String(
            formData.get('cf-turnstile-response') || turnstileMockToken,
          ),
          website: String(formData.get('website') || '')
        })
      });
      const result = await response.json().catch(() => ({})) as BookingResult & { error?: string; code?: string };
      if (!response.ok) {
        const code = result.code || result.error || 'server_error';
        throw new Error(code);
      }
      setManageUrl(result.manage_url);
      setBookingState('success');
      idempotencyRef.current = '';
      setTrainings((items) => items.map((item) => item.id === selectedId
        ? { ...item, remaining: Math.max(0, result.remaining), active_bookings: item.capacity - Math.max(0, result.remaining) }
        : item));
      form.reset();
    } catch (error) {
      const code = error instanceof Error ? error.message : 'server_error';
      setBookingError(errorMessages[code] || errorMessages.server_error);
      setBookingState('idle');
    }
  }

  return (
    <div className="public-schedule-booking">
      <div className="public-schedule-list" aria-live="polite">
        {scheduleState === 'loading' ? (
          <div className="public-schedule-state public-schedule-state--loading" aria-label="Загружаем расписание">
            <i/><i/><i/>
          </div>
        ) : scheduleState === 'error' ? (
          <div className="public-schedule-state">
            <ClockIcon size={28}/><h3>Расписание не загрузилось</h3><p>Проверьте соединение и попробуйте снова.</p>
            <button type="button" onClick={reload}>Повторить</button>
          </div>
        ) : trainings.length === 0 ? (
          <div className="public-schedule-state">
            <ClockIcon size={28}/><h3>Новые даты скоро</h3><p>Мы готовим следующее расписание. Загляните чуть позже.</p>
            <button type="button" onClick={reload}>Обновить</button>
          </div>
        ) : (
          <>
            <div className="public-schedule-list__grid">
              {visible.map((training, index) => {
                const full = training.remaining <= 0 || training.is_active === false;
                const almostFull = training.remaining > 0 && training.remaining <= 3;
                return (
                  <article className={`public-training-card${selectedId === training.id ? ' is-selected' : ''}`} key={training.id}>
                    <div className="public-training-card__index">#{String(index + 1).padStart(2, '0')}</div>
                    <div className="public-training-card__date"><span>{formatDate(training.date)}</span><strong>{formatTime(training.start_time)}–{formatTime(training.end_time)}</strong></div>
                    <div className="public-training-card__place">
                      <PinIcon size={18}/><p><strong>{training.location_name || 'Спортивный зал'}</strong>{training.address ? <span>{training.address}</span> : null}</p>
                    </div>
                    <div className="public-training-card__meta">
                      <p><small>Стоимость</small><strong>{training.price} ₽</strong></p>
                      <p><small>Свободно</small><strong>{Math.max(0, training.remaining)} / {training.capacity}</strong></p>
                    </div>
                    <span className={`public-status${full ? ' public-status--full' : almostFull ? ' public-status--almost' : ''}`}>
                      {full ? 'Мест нет' : almostFull ? 'Мало мест' : 'Есть места'}
                    </span>
                    <button type="button" onClick={() => chooseTraining(training.id)} disabled={full}>
                      {full ? 'Посмотреть позже' : selectedId === training.id ? 'Выбрано' : 'Выбрать'} <ArrowIcon size={17}/>
                    </button>
                  </article>
                );
              })}
            </div>
            {trainings.length > 6 ? (
              <button className="public-schedule-list__more" type="button" onClick={() => setShowAll((value) => !value)}>
                {showAll ? 'Свернуть расписание' : `Показать ещё ${trainings.length - 6}`}
              </button>
            ) : null}
          </>
        )}
      </div>

      <aside className="public-booking-card" id="public-booking-form">
        {bookingState === 'success' ? (
          <div className="public-booking-success" role="status">
            <span><CheckIcon size={34}/></span>
            <p>Место за тобой</p>
            <h3>Запись создана</h3>
            <small>Сохрани личную ссылку — через неё можно проверить или отменить запись.</small>
            {manageUrl ? <a className="public-button" href={manageUrl}>Открыть мою запись <ArrowIcon size={18}/></a> : null}
            <button type="button" onClick={() => { setBookingState('idle'); setManageUrl(''); }}>Записать ещё игрока</button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submitBooking} onChange={() => { idempotencyRef.current = ''; }} noValidate>
            <div className="public-booking-card__head">
              <span>Веб-запись</span>
              <h3>Займи место</h3>
              <p>{selected ? `${formatDate(selected.date)}, ${formatTime(selected.start_time)} · ${selected.price} ₽` : 'Выбери тренировку слева'}</p>
            </div>
            <label>
              <span>Тренировка</span>
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required>
                <option value="">Выберите дату и время</option>
                {trainings.filter((item) => item.remaining > 0 && item.is_active !== false).map((item) => (
                  <option key={item.id} value={item.id}>{formatDate(item.date)} · {formatTime(item.start_time)} · {item.price} ₽</option>
                ))}
              </select>
            </label>
            <label>
              <span>Имя</span>
              <input name="name" autoComplete="name" minLength={2} maxLength={80} placeholder="Как к тебе обращаться" required/>
            </label>
            <label>
              <span>Телефон</span>
              <input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7 900 000-00-00" required/>
            </label>
            <label className="public-booking-card__honeypot" aria-hidden="true">
              <span>Сайт</span><input name="website" tabIndex={-1} autoComplete="off"/>
            </label>
            <label className="public-booking-card__consent">
              <input name="consent" type="checkbox" required/>
              <span>Согласен на обработку контакта для организации тренировки и управления записью.</span>
            </label>
            {turnstileSiteKey ? (
              <>
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload"/>
                <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="dark"/>
              </>
            ) : null}
            {bookingError ? <p className="public-booking-card__error" role="alert">{bookingError}</p> : null}
            <button className="public-button" type="submit" disabled={bookingState === 'submitting' || !selectedId}>
              {bookingState === 'submitting' ? 'Проверяем место…' : 'Записаться'} <ArrowIcon size={18}/>
            </button>
            <small>Телефон видит только организатор. Оплата — на месте.</small>
          </form>
        )}
      </aside>
    </div>
  );
}
