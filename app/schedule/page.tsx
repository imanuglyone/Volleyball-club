import { TrainingFeed } from '@/components/app/TrainingFeed';

export default function SchedulePage() {
  return <div className="screen schedule-screen"><header className="screen-header"><div className="eyebrow">Расписание</div><h1>Будущие<br/>тренировки</h1><p>Выбери ближайшую дату или посмотри весь список.</p></header><TrainingFeed/></div>;
}
