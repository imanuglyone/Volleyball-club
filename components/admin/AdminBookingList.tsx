'use client';

import { useMemo, useState } from 'react';
import { Phone, Search, ShieldX, UserRound, UserX } from 'lucide-react';
import { anonymizeProfile, cancelBooking } from '@/app/admin/actions';
import { AdminConfirmSubmit } from './AdminConfirmSubmit';

type AdminBookingItem = {
  id: string;
  name: string;
  phone: string;
  status: string;
  created_at: string;
  profile_id: string | null;
};

export function AdminBookingList({
  bookings,
  v2Enabled,
}: {
  bookings: AdminBookingItem[];
  v2Enabled: boolean;
}) {
  const [tab, setTab] = useState<'active' | 'cancelled'>('active');
  const [query, setQuery] = useState('');
  const active = useMemo(
    () => bookings.filter((item) => item.status === 'active'),
    [bookings],
  );
  const cancelled = useMemo(
    () => bookings.filter((item) => item.status === 'cancelled'),
    [bookings],
  );
  const visible = useMemo(() => {
    const source = v2Enabled
      ? tab === 'active' ? active : cancelled
      : bookings;
    const normalized = query.trim().toLocaleLowerCase('ru-RU');
    if (!v2Enabled || !normalized) return source;
    const digits = normalized.replace(/\D/g, '');
    return source.filter((item) =>
      item.name.toLocaleLowerCase('ru-RU').includes(normalized) ||
      (digits.length > 0 && item.phone.replace(/\D/g, '').includes(digits))
    );
  }, [active, bookings, cancelled, query, tab, v2Enabled]);

  return (
    <>
      {v2Enabled && (
        <section className="admin-bookings-toolbar">
          <nav aria-label="Статус записей">
            <button type="button" className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>
              Активные <span>{active.length}</span>
            </button>
            <button type="button" className={tab === 'cancelled' ? 'active' : ''} onClick={() => setTab('cancelled')}>
              Отменённые <span>{cancelled.length}</span>
            </button>
          </nav>
          <label>
            <Search size={16}/>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя или телефон"
              aria-label="Поиск по имени или телефону"
            />
          </label>
        </section>
      )}
      <div className="admin-list-head">
        <h2>{v2Enabled ? (tab === 'active' ? 'Активные записи' : 'История отмен') : 'Список участников'}</h2>
        <span>{v2Enabled ? `${visible.length} показано` : `${active.length} активных`}</span>
      </div>
      {visible.length ? (
        <section className="admin-booking-list">
          {visible.map((booking, index) => (
            <article key={booking.id} className={booking.status === 'active' ? 'admin-booking-card' : 'admin-booking-card cancelled'}>
              <span className="admin-person-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="admin-person-avatar"><UserRound size={19}/></div>
              <div className="admin-person-data">
                <strong>{booking.name}</strong>
                <a href={`tel:${booking.phone}`}><Phone size={13}/>{booking.phone}</a>
                <small>{new Intl.DateTimeFormat('ru-RU', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                  timeZone: 'Asia/Irkutsk',
                }).format(new Date(booking.created_at))}</small>
              </div>
              <span className="admin-booking-status">{booking.status === 'active' ? 'Активна' : 'Отменена'}</span>
              {booking.status === 'active' && (
                <form action={cancelBooking.bind(null, booking.id)}>
                  <AdminConfirmSubmit
                    className="admin-cancel-person"
                    ariaLabel={`Отменить запись ${booking.name}`}
                    title="Отменить запись игрока?"
                    description={`Место ${booking.name} освободится, а запись останется в истории.`}
                    confirmLabel="Отменить запись"
                  >
                    <UserX size={18}/><span>Отменить</span>
                  </AdminConfirmSubmit>
                </form>
              )}
              {booking.status === 'cancelled' && booking.profile_id && (
                <form action={anonymizeProfile.bind(null, booking.profile_id)}>
                  <AdminConfirmSubmit
                    className="admin-cancel-person"
                    ariaLabel={`Анонимизировать профиль ${booking.name}`}
                    title="Удалить профиль и персональные данные?"
                    description="Действие необратимо. Оно будет отклонено, если у игрока остались активные записи."
                    confirmLabel="Анонимизировать"
                  >
                    <ShieldX size={18}/><span>Удалить данные</span>
                  </AdminConfirmSubmit>
                </form>
              )}
            </article>
          ))}
        </section>
      ) : (
        <div className="admin-empty">
          <UserRound size={30}/>
          <h2>{query ? 'Ничего не найдено' : tab === 'active' ? 'Пока никто не записался' : 'Нет отменённых записей'}</h2>
          <p>{query ? 'Измените запрос или очистите поиск.' : 'Список обновляется автоматически после каждой записи.'}</p>
        </div>
      )}
    </>
  );
}
