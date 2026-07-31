import { formatDate, formatTimeRange } from '@/lib/format';

export const startMessage = (name?: string) =>
  `${name ? `${name}, д` : 'Д'}обро пожаловать в «Авангард»! 👋\n\nЖивой волейбол в Ангарске: выберите тренировку, займите место и управляйте своими записями в приложении.`;

export const helpMessage = [
  'Откройте приложение кнопкой ниже, чтобы записаться или отменить конкретную запись.',
  '', '/next — ближайшая тренировка', '/list YYYY-MM-DD — список участников',
  '/stats YYYY-MM-DD — заполненность', '/help — справка'
].join('\n');

export function trainingSummary(training: {
  date: string; start_time: string; end_time: string; location_name?: string | null;
  active_bookings: number; capacity: number;
}) {
  return [
    `${formatDate(training.date)}, ${formatTimeRange(training.start_time, training.end_time)}`,
    training.location_name ? `Зал: ${training.location_name}` : null,
    `Занято ${training.active_bookings} из ${training.capacity}`
  ].filter(Boolean).join('\n');
}
