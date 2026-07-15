export type TrainingVisualStatus = 'available' | 'almost-full' | 'full' | 'cancelled' | 'booked' | 'completed';

const labels: Record<TrainingVisualStatus, string> = {
  available: 'Есть места',
  'almost-full': 'Мало мест',
  full: 'Мест нет',
  cancelled: 'Отменена',
  booked: 'Вы записаны',
  completed: 'Завершена'
};

export function StatusPill({ status, label }: { status: TrainingVisualStatus; label?: string }) {
  return <span className={`status-pill status-pill--${status}`}>{label ?? labels[status]}</span>;
}
