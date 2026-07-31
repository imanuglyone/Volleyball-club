'use client';

import { TrainingFeed } from '@/components/app/TrainingFeed';

export function LegacyScheduleScreen() {
  return (
    <div className="screen schedule-screen">
      <header className="screen-header">
        <div className="eyebrow">Ближайшие игры</div>
        <h1>Расписание</h1>
      </header>
      <TrainingFeed />
    </div>
  );
}
