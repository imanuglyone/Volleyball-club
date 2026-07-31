'use client';

import { useMemo } from 'react';

const WEEKDAYS = ['\u041f\u043d', '\u0412\u0442', '\u0421\u0440', '\u0427\u0442', '\u041f\u0442', '\u0421\u0431', '\u0412\u0441'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function getMonthMeta(current: Date) {
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const firstWeekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstWeekday + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }
    return new Date(Date.UTC(year, month, dayNumber));
  });

  return { year, month, cells };
}

type CalendarProps = {
  month: Date;
  selectedDate: string;
  markedDates: Set<string>;
  onSelect: (date: string) => void;
  onMonthChange: (date: Date) => void;
};

export function Calendar({ month, selectedDate, markedDates, onSelect, onMonthChange }: CalendarProps) {
  const { year, month: monthIndex, cells } = useMemo(() => getMonthMeta(month), [month]);
  const title = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(month);

  return (
    <div className="card calendar-shell p-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => onMonthChange(new Date(Date.UTC(year, monthIndex - 1, 1)))}
        >
          {'\u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0438\u0439'}
        </button>
        <div className="text-lg font-semibold text-white">{title}</div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => onMonthChange(new Date(Date.UTC(year, monthIndex + 1, 1)))}
        >
          {'\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs font-semibold uppercase text-steel-300">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="h-10" />;
          }
          const key = formatDateKey(cell);
          const isSelected = key === selectedDate;
          const isMarked = markedDates.has(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`calendar-day h-10 border text-sm transition ${
                isSelected
                  ? 'border-ember-500 bg-ember-500 text-white shadow-glow'
                  : isMarked
                    ? 'border-ice-400/60 bg-night-800 text-white hover:border-ice-400'
                    : 'border-night-700 bg-night-900/70 text-steel-200 hover:border-ice-500'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                {cell.getUTCDate()}
                {isMarked ? <span className="h-1.5 w-1.5 rounded-full bg-ice-400 shadow-[0_0_8px_rgba(93,210,255,0.8)]" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
