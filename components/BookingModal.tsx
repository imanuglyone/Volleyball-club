'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { TrainingStats } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { phoneRegex } from '@/lib/validators';
import { club } from '@/components/public/site-content';

type BookingModalProps = {
  open: boolean;
  training: TrainingStats | null;
  onClose: () => void;
  onBooked: () => void;
};

export function BookingModal({ open, training, onClose, onBooked }: BookingModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [manageUrl, setManageUrl] = useState('');
  const idempotencyRef = useRef('');
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const turnstileMockToken =
    process.env.NEXT_PUBLIC_TURNSTILE_MOCK_TOKEN || '';

  useEffect(() => {
    if (open) {
      setName('');
      setPhone('');
      setConsent(false);
      setError(null);
      setSuccess(false);
      setManageUrl('');
      idempotencyRef.current = '';
    }
  }, [open]);

  if (!open || !training) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!training) return;

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      setError('Введите имя — минимум 2 символа.');
      return;
    }
    if (!phoneRegex.test(trimmedPhone)) {
      setError('Введите корректный телефон.');
      return;
    }
    if (!consent) {
      setError('Подтвердите согласие на обработку контакта.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const idempotencyKey = idempotencyRef.current || crypto.randomUUID();
    idempotencyRef.current = idempotencyKey;
    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          version: 1,
          training_id: training.id,
          name: trimmedName,
          phone: trimmedPhone,
          consent: true,
          consent_version: club.consentVersion,
          idempotency_key: idempotencyKey,
          turnstile_token: String(
            formData.get('cf-turnstile-response') || turnstileMockToken,
          ),
          website: String(formData.get('website') || '')
        })
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; manage_url?: string };
      if (!response.ok) {
        if (payload.error === 'booking_full') setError('Свободных мест больше нет.');
        else if (payload.error === 'booking_duplicate') setError('На этот телефон уже есть активная запись.');
        else if (payload.error === 'rate_limited') setError('Слишком много попыток. Попробуйте немного позже.');
        else if (payload.error === 'unauthorized') setError('Не удалось подтвердить защиту формы. Обновите страницу.');
        else setError('Запись не создана. Проверьте данные и попробуйте ещё раз.');
        return;
      }
      idempotencyRef.current = '';
      setManageUrl(payload.manage_url || '');
      setSuccess(true);
      onBooked();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-white">Запись на тренировку</div>
          <button type="button" className="btn-ghost" onClick={onClose}>Закрыть</button>
        </div>
        <div className="mt-4 text-sm text-steel-200">
          {formatDate(training.date)} · {formatTimeRange(training.start_time, training.end_time)}
        </div>

        {success ? (
          <div className="mt-6 rounded-xl border border-ice-500/30 bg-night-900/60 p-4 text-sm text-steel-200">
            <div className="text-base font-semibold text-white">Вы записаны!</div>
            <div className="mt-1">Сохраните личную ссылку: через неё можно проверить или отменить запись.</div>
            {manageUrl ? <a className="btn-primary mt-4 inline-flex" href={manageUrl}>Открыть мою запись</a> : null}
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit} onChange={() => { idempotencyRef.current = ''; }}>
            <label className="block">
              <div className="label">Имя</div>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ваше имя" autoComplete="name" required/>
            </label>
            <label className="block">
              <div className="label">Телефон</div>
              <input className="input" type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 900 000-00-00" autoComplete="tel" required/>
            </label>
            <label className="flex items-start gap-3 text-xs text-steel-200">
              <input className="mt-0.5 h-4 w-4 accent-signal" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required/>
              <span>Согласен на обработку контакта для организации тренировки и управления записью.</span>
            </label>
            <label className="sr-only" aria-hidden="true">Сайт<input name="website" tabIndex={-1} autoComplete="off"/></label>
            {turnstileSiteKey ? (
              <>
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload"/>
                <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="dark"/>
              </>
            ) : null}
            {error ? <div className="text-sm text-red-400" role="alert">{error}</div> : null}
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Проверяем место…' : 'Подтвердить запись'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
