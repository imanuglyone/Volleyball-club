'use client';

import Link from 'next/link';
import { ArrowIcon, BookingIcon, PinIcon, ScheduleIcon } from '@/components/icons/AvangardIcons';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { formatDate, formatTimeRange } from '@/lib/format';
import { isVisualPreview, visualTrainingFixtures } from '@/lib/visual-preview';
import { ErrorState, LoadingState } from './States';

export function MiniAppHome() {
  const { bootstrap, loading, error, initData, refreshBootstrap } = useTelegram();
  const preview = typeof window !== 'undefined' && isVisualPreview();
  const activeBooking = bootstrap?.active_booking ?? bootstrap?.bookings?.find((item) => item.status === 'active');
  const nextTraining = bootstrap?.next_training ?? bootstrap?.nearest_training ?? (preview ? visualTrainingFixtures[0] : null);
  const training = activeBooking?.trainings ?? nextTraining;
  const remaining = training && 'remaining' in training && typeof training.remaining === 'number' ? training.remaining : null;
  const capacity = training && typeof training.capacity === 'number' ? training.capacity : null;
  const price = training && typeof training.price === 'number' ? training.price : null;

  if (loading) return <div className="screen home-screen"><LoadingState /></div>;
  if (error) return <div className="screen home-screen"><ErrorState retry={() => void refreshBootstrap()} /></div>;

  return (
    <div className="screen home-screen">
      <header className="home-intro">
        <div>
          <div className="eyebrow">{activeBooking ? 'Вы в составе' : 'Ближайшая игра'}</div>
          <h1>{activeBooking ? 'Место за вами' : 'Выйти на площадку'}</h1>
        </div>
        <span className="home-intro__status">{initData ? 'LIVE' : 'PREVIEW'}</span>
      </header>

      {training ? (
        <article className="next-training-card">
          <div className="next-training-card__signal" aria-hidden="true"><i /><i /><i /></div>
          <div className="next-training-card__date">{formatDate(training.date)}</div>
          <strong className="next-training-card__time">{formatTimeRange(training.start_time, training.end_time)}</strong>
          <p><PinIcon size={18}/><span>{training.location_name || 'Спортивный зал'}<small>{training.address || 'Ангарск'}</small></span></p>
          <dl>
            {remaining !== null && capacity !== null && <div><dt>Свободно</dt><dd>{remaining} / {capacity}</dd></div>}
            {price !== null && <div><dt>Стоимость</dt><dd>{price} ₽</dd></div>}
          </dl>
          <Link className="app-main-cta" href={activeBooking ? '/app/bookings' : `/app/trainings/${training.id}`}>
            <span>{activeBooking ? 'Открыть запись' : 'Занять место'}</span><ArrowIcon size={20}/>
          </Link>
        </article>
      ) : (
        <section className="home-empty">
          <ScheduleIcon size={30}/>
          <h2>Новые даты скоро</h2>
          <p>Расписание обновляется организатором клуба.</p>
        </section>
      )}

      <nav className="home-quick-actions" aria-label="Быстрые действия">
        <Link href="/app/schedule"><ScheduleIcon size={21}/><span><strong>Расписание</strong><small>Все ближайшие даты</small></span><ArrowIcon size={16}/></Link>
        <Link href="/app/bookings"><BookingIcon size={21}/><span><strong>Мои записи</strong><small>Активные и история</small></span><ArrowIcon size={16}/></Link>
      </nav>
    </div>
  );
}
