import { UserRound } from 'lucide-react';
import type { PublicBooking } from '@/lib/types';

export function ParticipantRoster({ bookings = [], capacity }: { bookings?: PublicBooking[]; capacity: number }) {
  const freeSlots = Math.max(0, capacity - bookings.length);
  return <section className="roster" aria-labelledby="roster-title"><div className="roster__head"><div><span className="section-number">02</span><h2 id="roster-title">Команда</h2></div><span>{bookings.length} / {capacity}</span></div>
    {bookings.length ? <ol className="roster__grid">{bookings.map((booking, index) => <li key={booking.id}><span className="roster__avatar">{booking.name.trim().charAt(0).toUpperCase()}</span><span><small>{String(index + 1).padStart(2, '0')}</small><strong>{booking.name}</strong></span></li>)}{freeSlots > 0 && <li className="roster__slot"><span className="roster__avatar">+{freeSlots}</span><span><small>FREE</small><strong>Свободно</strong></span></li>}</ol> : <div className="roster__empty"><span><UserRound size={24}/></span><div><strong>Собираем первую шестёрку</strong><p>Стань первым игроком в составе этой тренировки.</p></div></div>}
  </section>;
}
