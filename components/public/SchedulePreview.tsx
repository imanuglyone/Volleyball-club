import { SectionMarker } from './SectionMarker';
import { PublicScheduleBooking } from './PublicScheduleBooking';
import type { PublicTrainingView } from './public-types';

export function SchedulePreview({
  initialTrainings = [],
  initialError = false,
}: {
  initialTrainings?: PublicTrainingView[];
  initialError?: boolean;
}) {
  return (
    <section className="public-schedule" id="schedule" aria-labelledby="schedule-title">
      <header>
        <SectionMarker index="04">Живое расписание</SectionMarker>
        <div><p>Места обновляются после каждой записи</p><h2 id="schedule-title">Выбери вечер.<br/><em>Остальное — за нами.</em></h2></div>
      </header>
      <PublicScheduleBooking initialTrainings={initialTrainings} initialError={initialError}/>
    </section>
  );
}
