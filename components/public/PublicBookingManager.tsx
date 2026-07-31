'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowIcon, CheckIcon, ClockIcon, PinIcon } from '@/components/icons/AvangardIcons';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';

type ManagedBooking = {
  id: string;
  status: 'active' | 'cancelled';
  training_id: string;
  training_date: string;
  start_time: string;
  end_time: string;
  location_name: string | null;
  address: string | null;
};

function shortTime(value: string) { return value.slice(0, 5); }
function readableDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${value}T12:00:00`));
}

export function PublicBookingManager({ bookingId, compact = false }: { bookingId: string; compact?: boolean }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'cancelling' | 'cancelled'>('loading');
  const [booking, setBooking] = useState<ManagedBooking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/public/bookings/${bookingId}/manage`, {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('not_found');
    const payload = await response.json() as { booking: ManagedBooking };
    setBooking(payload.booking);
    setState(payload.booking.status === 'cancelled' ? 'cancelled' : 'ready');
  }, [bookingId]);

  useEffect(() => {
    let active = true;
    async function exchangeAndLoad() {
      try {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const token = fragment.get('token');
        if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
        if (token) {
          const response = await fetch(`/api/public/bookings/${bookingId}/manage/exchange`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ token })
          });
          if (!response.ok) throw new Error('exchange');
        }
        if (active) await load();
      } catch {
        if (active) setState('error');
      }
    }
    void exchangeAndLoad();
    return () => { active = false; };
  }, [bookingId, load]);

  async function cancel() {
    setState('cancelling');
    try {
      const response = await fetch(`/api/public/bookings/${bookingId}/manage/cancel`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('cancel');
      setState('cancelled');
      setBooking((current) => current ? { ...current, status: 'cancelled' } : current);
    } catch {
      setState('error');
    }
  }

  return (
    <main className={`public-manage-page${compact ? ' public-manage-page--compact' : ''}`}>
      <header><Link href="/"><AvangardWordmark compact/></Link><Link href="/schedule">Расписание <ArrowIcon size={16}/></Link></header>
      <section aria-live="polite">
        {state === 'loading' ? (
          <div className="public-manage-state"><span className="public-manage-spinner"/><h1>Проверяем ссылку</h1><p>Это займёт несколько секунд.</p></div>
        ) : state === 'error' || !booking ? (
          <div className="public-manage-state public-manage-state--error"><ClockIcon size={34}/><h1>Ссылка не сработала</h1><p>Она могла истечь или уже быть использована. Откройте новую ссылку либо свяжитесь с организатором.</p><Link className="public-button" href="/schedule">К расписанию <ArrowIcon size={18}/></Link></div>
        ) : (
          <div className="public-manage-card">
            <span className={`public-manage-card__status${state === 'cancelled' ? ' is-cancelled' : ''}`}><CheckIcon size={18}/>{state === 'cancelled' ? 'Запись отменена' : 'Место подтверждено'}</span>
            <p>{readableDate(booking.training_date)}</p>
            <h1>{shortTime(booking.start_time)}–{shortTime(booking.end_time)}</h1>
            <div><PinIcon size={21}/><p><strong>{booking.location_name || 'Спортивный зал'}</strong>{booking.address ? <span>{booking.address}</span> : null}</p></div>
            {state === 'cancelled' ? (
              <Link className="public-button" href="/schedule">Выбрать другую тренировку <ArrowIcon size={18}/></Link>
            ) : confirmCancel ? (
              <div className="public-manage-card__confirm" role="group" aria-label="Подтверждение отмены">
                <p>Место сразу вернётся в расписание.</p>
                <button type="button" onClick={cancel} disabled={state === 'cancelling'}>{state === 'cancelling' ? 'Отменяем…' : 'Да, отменить'}</button>
                <button type="button" onClick={() => setConfirmCancel(false)} disabled={state === 'cancelling'}>Оставить запись</button>
              </div>
            ) : (
              <button className="public-manage-card__cancel" type="button" onClick={() => setConfirmCancel(true)}>
                Отменить запись
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
