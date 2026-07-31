'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, formatDateKey } from '@/components/Calendar';
import { formatDate, formatTimeRange } from '@/lib/format';
import { clubDateString, clubLocalDateTimeKey } from '@/lib/club-time';
import type { TrainingStats } from '@/lib/types';
import { BookingModal } from '@/components/BookingModal';

function getMonthRange(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return { start, end };
}

function toDateKey(date: Date) {
  return formatDateKey(date);
}

export function PublicBooking() {
  const [month, setMonth] = useState(() => new Date(`${clubDateString()}T12:00:00Z`));
  const [selectedDate, setSelectedDate] = useState(() => clubDateString());
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [monthTrainings, setMonthTrainings] = useState<TrainingStats[]>([]);
  const [trainings, setTrainings] = useState<TrainingStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingStats | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const readableSelectedDate = useMemo(() => formatDate(selectedDate), [selectedDate]);
  const visibleTrainings = useMemo(
    () => (onlyAvailable ? trainings.filter((training) => training.remaining > 0) : trainings),
    [onlyAvailable, trainings]
  );

  const nearestTrainingId = useMemo(() => {
    if (trainings.length === 0) return null;
    const sorted = [...trainings].sort((a, b) => a.start_time.localeCompare(b.start_time));
    if (selectedDate === clubDateString()) {
      const [, clubTime = '00:00:00'] = clubLocalDateTimeKey().split('T');
      const [currentHours, currentMinutes] = clubTime.split(':').map(Number);
      const nowMinutes = currentHours * 60 + currentMinutes;
      const next = sorted.find((item) => {
        const [hours, minutes] = item.start_time.split(':').map((value) => Number(value));
        return hours * 60 + minutes >= nowMinutes;
      });
      return (next ?? sorted[0]).id;
    }
    return sorted[0].id;
  }, [selectedDate, trainings]);

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
    setMonthTrainings(data);
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
    const filtered = onlyAvailable
      ? monthTrainings.filter((item) => item.remaining > 0)
      : monthTrainings;
    setMarkedDates(new Set(filtered.map((item) => item.date)));
  }, [monthTrainings, onlyAvailable]);

  useEffect(() => {
    loadTrainings(selectedDate);
  }, [selectedDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="heading text-xl font-semibold">{'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443'}</h2>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-steel-300">
            <input
              type="checkbox"
              className="h-4 w-4 accent-amber-500"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
            />
            {'\u0422\u043e\u043b\u044c\u043a\u043e \u0441 \u043c\u0435\u0441\u0442\u0430\u043c\u0438'}
          </label>
        </div>
        <Calendar
          month={month}
          selectedDate={selectedDate}
          markedDates={markedDates}
          onSelect={setSelectedDate}
          onMonthChange={setMonth}
        />
        <div className="text-xs text-steel-300">
          {onlyAvailable
            ? '\u041f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u044b \u0434\u0430\u0442\u044b, \u0433\u0434\u0435 \u0435\u0441\u0442\u044c \u043c\u0435\u0441\u0442\u0430.'
            : '\u041f\u043e\u043a\u0430\u0437\u0430\u043d\u044b \u0432\u0441\u0435 \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0434\u0430\u0442\u044b.'}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="heading text-xl font-semibold">
            {'\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438 \u043d\u0430'} {readableSelectedDate}
          </h2>
          <div className="text-xs text-steel-300">
            {visibleTrainings.length}/{trainings.length} {'\u0432 \u0441\u043f\u0438\u0441\u043a\u0435'}
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="card p-4 text-sm text-steel-200">{'\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435...'} </div>
          ) : visibleTrainings.length === 0 ? (
            <div className="card p-4 text-sm text-steel-200">
              {onlyAvailable && trainings.length > 0
                ? '\u041d\u0430 \u044d\u0442\u0443 \u0434\u0430\u0442\u0443 \u0432\u0441\u0435 \u043c\u0435\u0441\u0442\u0430 \u0437\u0430\u043d\u044f\u0442\u044b.'
                : '\u041d\u0430 \u044d\u0442\u0443 \u0434\u0430\u0442\u0443 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442.'}
            </div>
          ) : (
            visibleTrainings.map((training, index) => {
              const isNearest = training.id === nearestTrainingId;
              const isLow = training.remaining > 0 && training.remaining <= 3;
              const isFull = training.remaining <= 0;
              const mapUrl = training.address
                ? `https://yandex.ru/maps/?text=${encodeURIComponent(training.address)}`
                : null;

              return (
                <div
                  key={training.id}
                  className={`card p-5 animate-fade-up ${index === 0 ? 'animate-delay-1' : 'animate-delay-2'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold text-white">
                          {formatTimeRange(training.start_time, training.end_time)}
                        </div>
                        {isNearest ? (
                          <span className="badge badge-ember">{'\u0411\u043b\u0438\u0436\u0430\u0439\u0448\u0430\u044f'}</span>
                        ) : null}
                        {isLow ? (
                          <span className="badge badge-warn">{'\u041f\u043e\u0447\u0442\u0438 \u043f\u043e\u043b\u043d\u043e'}</span>
                        ) : null}
                        {isFull ? (
                          <span className="badge badge-muted">{'\u041d\u0435\u0442 \u043c\u0435\u0441\u0442'}</span>
                        ) : null}
                      </div>
                      {training.location_name ? (
                        <div className="text-sm text-steel-200">
                          {'\u0417\u0430\u043b: '} {training.location_name}
                        </div>
                      ) : null}
                      {training.address ? (
                        <div className="text-sm text-steel-300">{training.address}</div>
                      ) : null}
                      {mapUrl ? (
                        <a
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-ice-400"
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {'\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u0430 \u043a\u0430\u0440\u0442\u0435'}
                        </a>
                      ) : null}
                      <div className="text-sm text-steel-200">
                        {'\u0426\u0435\u043d\u0430: '} {training.price} {'\u20bd'}
                      </div>
                      <div className="text-sm text-steel-200">
                        {'\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c \u043c\u0435\u0441\u0442: '} {training.remaining}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn-primary ${training.remaining > 0 ? 'btn-pulse' : ''}`}
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
              );
            })
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
