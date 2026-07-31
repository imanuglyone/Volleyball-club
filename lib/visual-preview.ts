import type { TrainingStats } from './types';

export const visualTrainingFixtures: TrainingStats[] = [
  { id: 'visual-training-1', date: '2026-07-19', start_time: '20:00:00', end_time: '22:00:00', price: 500, capacity: 20, location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8', is_active: true, created_at: '2026-07-01T00:00:00Z', active_bookings: 12, total_bookings: 12, remaining: 8, public_bookings: [{ id: 'p1', name: 'Иван' }, { id: 'p2', name: 'Анна' }, { id: 'p3', name: 'Максим' }, { id: 'p4', name: 'Света' }, { id: 'p5', name: 'Даниил' }] },
  { id: 'visual-training-2', date: '2026-07-22', start_time: '20:00:00', end_time: '22:00:00', price: 500, capacity: 20, location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8', is_active: true, created_at: '2026-07-01T00:00:00Z', active_bookings: 17, total_bookings: 17, remaining: 3 },
  { id: 'visual-training-3', date: '2026-07-26', start_time: '20:00:00', end_time: '22:00:00', price: 500, capacity: 20, location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8', is_active: true, created_at: '2026-07-01T00:00:00Z', active_bookings: 20, total_bookings: 20, remaining: 0 },
  { id: 'visual-training-4', date: '2026-07-29', start_time: '20:00:00', end_time: '22:00:00', price: 500, capacity: 20, location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8', is_active: true, created_at: '2026-07-01T00:00:00Z', active_bookings: 5, total_bookings: 5, remaining: 15 }
];

export const visualBookingFixtures = [
  { id: 'visual-booking-1', status: 'active' as const, trainings: { date: '2026-07-19', start_time: '20:00:00', end_time: '22:00:00', location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8' } },
  { id: 'visual-booking-2', status: 'active' as const, trainings: { date: '2026-07-22', start_time: '20:00:00', end_time: '22:00:00', location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8' } },
  { id: 'visual-booking-3', status: 'active' as const, trainings: { date: '2026-07-26', start_time: '20:00:00', end_time: '22:00:00', location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8' } },
  { id: 'visual-booking-4', status: 'cancelled' as const, trainings: { date: '2026-07-10', start_time: '20:00:00', end_time: '22:00:00', location_name: 'Зал «Ермак»', address: 'ул. Олега Кошевого, 8' } }
];

export function isVisualPreview() {
  return process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('visual') === '1';
}
