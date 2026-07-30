import { TrainingFeed } from '@/components/app/TrainingFeed';

export default function SchedulePage() {
  return <div className="screen schedule-screen"><header className="screen-header"><div><div className="eyebrow">Ближайшие даты</div><h1>Расписание</h1></div><p>Выбери тренировку и займи место.</p></header><TrainingFeed/></div>;
}
