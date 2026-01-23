'use client';

import { useEffect, useState } from 'react';
import type { TrainingStats } from '@/lib/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { phoneRegex } from '@/lib/validators';

type BookingModalProps = {
  open: boolean;
  training: TrainingStats | null;
  onClose: () => void;
  onBooked: () => void;
};

export function BookingModal({ open, training, onClose, onBooked }: BookingModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setPhone('');
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  if (!open || !training) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setError('\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043c\u044f (\u043c\u0438\u043d\u0438\u043c\u0443\u043c 2 \u0441\u0438\u043c\u0432\u043e\u043b\u0430).');
      return;
    }
    if (!phoneRegex.test(trimmedPhone)) {
      setError('\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 \u0442\u0435\u043b\u0435\u0444\u043e\u043d.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          training_id: training.id,
          name: trimmedName,
          phone: trimmedPhone
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          if (payload?.error === 'booking_full') {
            setError('\u041c\u0435\u0441\u0442 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0442.');
          } else if (payload?.error === 'booking_duplicate') {
            setError('\u0412\u044b \u0443\u0436\u0435 \u0437\u0430\u043f\u0438\u0441\u0430\u043d\u044b \u043d\u0430 \u044d\u0442\u0443 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0443.');
          } else {
            setError('\u0417\u0430\u043f\u0438\u0441\u044c \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430.');
          }
        } else if (response.status === 429) {
          setError('\u0421\u043b\u0438\u0448\u043a\u043e\u043c \u043c\u043d\u043e\u0433\u043e \u0437\u0430\u043f\u0440\u043e\u0441\u043e\u0432. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435.');
        } else {
          setError('\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0437\u0430\u043f\u0438\u0441\u0438. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.');
        }
        return;
      }

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
          <div className="text-lg font-semibold text-white">{'\u0417\u0430\u043f\u0438\u0441\u044c \u043d\u0430 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0443'}</div>
          <button type="button" className="btn-ghost" onClick={onClose}>
            {'\u0417\u0430\u043a\u0440\u044b\u0442\u044c'}
          </button>
        </div>

        <div className="mt-4 text-sm text-steel-200">
          {formatDate(training.date)} · {formatTimeRange(training.start_time, training.end_time)}
        </div>

        {success ? (
          <div className="mt-6 rounded-xl border border-ice-500/30 bg-night-900/60 p-4 text-sm text-steel-200">
            <div className="text-base font-semibold text-white">{'\u0412\u044b \u0437\u0430\u043f\u0438\u0441\u0430\u043d\u044b!'}</div>
            <div className="mt-1">
              {'\u0415\u0441\u043b\u0438 \u043f\u043b\u0430\u043d\u044b \u0438\u0437\u043c\u0435\u043d\u0438\u043b\u0438\u0441\u044c \u2014 \u043d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0443.'}
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <div className="label">{'\u0418\u043c\u044f'}</div>
              <input
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={'\u0412\u0430\u0448\u0435 \u0438\u043c\u044f'}
                required
              />
            </label>

            <label className="block">
              <div className="label">{'\u0422\u0435\u043b\u0435\u0444\u043e\u043d'}</div>
              <input
                className="input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 900 000-00-00"
                required
              />
            </label>

            {error ? <div className="text-sm text-red-400">{error}</div> : null}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c...' : '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
