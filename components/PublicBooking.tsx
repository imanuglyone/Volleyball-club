'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, formatDateKey } from '@/components/Calendar';
import { formatDate, formatTimeRange, todayDateString } from '@/lib/format';
import type { TrainingStats } from '@/lib/types';
import { BookingModal } from '@/components/BookingModal';

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

function toDateKey(date: Date) {
  return formatDateKey(date);
}

export function PublicBooking() {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => todayDateString());
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [trainings, setTrainings] = useState<TrainingStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingStats | null>(null);

  const readableSelectedDate = useMemo(() => formatDate(selectedDate), [selectedDate]);

  async function loadMonth(date: Date) {
    const { start, end } = getMonthRange(date);
    const from = toDateKey(start);
    const to = toDateKey(end);
    const response = await fetch(`/api/trainings?from=${from}&to=${to}`);
    if (!response.ok) {
      console.error('Failed to fetch trainings for month');
      return;
    }
    const data = (await response.json()) as TrainingStats[];
    setMarkedDates(new Set(data.map((item) => item.date)));
  }

  async function loadTrainings(date: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/trainings/by-date?date=${date}`);
      if (!response.ok) {
        console.error('Failed to fetch trainings');
        setTrainings([]);
        return;
      }
      const data = (await response.json()) as TrainingStats[];
      setTrainings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMonth(month);
  }, [month]);

  useEffect(() => {
    loadTrainings(selectedDate);
  }, [selectedDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div className="space-y-4">
        <h2 className="heading text-xl font-semibold">{'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443'}</h2>
        <Calendar
          month={month}
          selectedDate={selectedDate}
          markedDates={markedDates}
          onSelect={setSelectedDate}
          onMonthChange={setMonth}
        />
      </div>

      <div>
        <h2 className="heading text-xl font-semibold">
          {'\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438 \u043d\u0430'} {readableSelectedDate}
        </h2>
        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="card p-4 text-sm text-steel-200">{'\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435...'} </div>
          ) : trainings.length === 0 ? (
            <div className="card p-4 text-sm text-steel-200">{'\u041d\u0430 \u044d\u0442\u0443 \u0434\u0430\u0442\u0443 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442.'}</div>
          ) : (
            trainings.map((training, index) => (
              <div key={training.id} className={`card p-5 animate-fade-up ${index === 0 ? 'animate-delay-1' : 'animate-delay-2'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-white">
                      {formatTimeRange(training.start_time, training.end_time)}
                    </div>
                    <div className="text-sm text-steel-200">
                      {'\u0426\u0435\u043d\u0430: '} {training.price} {'\u20bd'}
                    </div>
                    <div className="text-sm text-steel-200">
                      {'\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c \u043c\u0435\u0441\u0442: '} {training.remaining}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setSelectedTraining(training)}
                    disabled={training.remaining <= 0}
                  >
                    {'\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f'}
                  </button>
                </div>
                <div className="mt-4 border-t border-night-700 pt-4 text-sm text-steel-200">
                  <div className="text-xs uppercase tracking-[0.2em] text-steel-300">
                    {'\u0423\u0436\u0435 \u0437\u0430\u043f\u0438\u0441\u0430\u043d\u044b'}
                  </div>
                  {training.public_bookings && training.public_bookings.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {training.public_bookings.map((booking) => (
                        <span key={booking.id} className="badge">
                          {booking.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-steel-300">
                      {'\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0437\u0430\u043f\u0438\u0441\u0430\u0432\u0448\u0438\u0445\u0441\u044f.'}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BookingModal
        open={Boolean(selectedTraining)}
        training={selectedTraining}
        onClose={() => setSelectedTraining(null)}
        onBooked={() => {
          loadTrainings(selectedDate);
          loadMonth(month);
        }}
      />
    </div>
  );
}
