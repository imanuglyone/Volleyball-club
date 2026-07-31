import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicScheduleBooking } from '@/components/public/PublicScheduleBooking';
import { LegacyTrainingDetail } from '@/components/public/LegacyTrainingDetail';
import { ArrowIcon, ClockIcon, PinIcon, TeamIcon } from '@/components/icons/AvangardIcons';
import { getPublicTrainings } from '@/lib/dal/trainings';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

type Props = { params: Promise<{ id: string }> };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${value}T12:00:00`));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const training = (await getPublicTrainings().catch(() => [])).find((item) => item.id === id);
  if (!training) return { title: 'Тренировка — Авангард' };
  return {
    title: `${formatDate(training.date)}, ${training.start_time.slice(0, 5)} — Авангард`,
    description: `Волейбольная тренировка в Ангарске. ${training.location_name || 'Спортивный зал'}, ${training.price} ₽, свободно ${training.remaining} мест.`
  };
}

export default async function TrainingPage({ params }: Props) {
  const { id } = await params;
  const flags = getSurfaceFeatureFlags();
  if (!flags.siteV2) return <LegacyTrainingDetail id={id}/>;
  const training = (await getPublicTrainings()).find((item) => item.id === id);
  if (!training) notFound();

  return (
    <main className="public-site public-training-page">
      <PublicHeader/>
      <section className="public-training-page__hero">
        <Link href="/schedule"><ArrowIcon size={17}/> Все тренировки</Link>
        <div className="public-training-page__date"><span>{formatDate(training.date)}</span><h1>{training.start_time.slice(0, 5)}–{training.end_time.slice(0, 5)}</h1></div>
        <div className="public-training-page__facts">
          <div><PinIcon size={22}/><p><small>Площадка</small><strong>{training.location_name || 'Спортивный зал'}</strong>{training.address ? <span>{training.address}</span> : null}</p></div>
          <div><ClockIcon size={22}/><p><small>Стоимость</small><strong>{training.price} ₽</strong><span>Оплата на месте</span></p></div>
          <div><TeamIcon size={22}/><p><small>Свободно</small><strong>{training.remaining} из {training.capacity}</strong><span>Места проверяются при записи</span></p></div>
        </div>
      </section>
      <section className="public-training-page__booking" aria-labelledby="training-booking-title">
        <div><p>Один шаг до игры</p><h2 id="training-booking-title">Займи своё<br/><em>место.</em></h2><span>Форма отправит контакт организатору и выдаст личную ссылку управления записью.</span></div>
        <PublicScheduleBooking initialTrainings={[training]}/>
      </section>
    </main>
  );
}
