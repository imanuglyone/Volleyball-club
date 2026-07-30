import { TrainingFeed } from '@/components/app/TrainingFeed';

export default function MiniAppHomePage() {
  return <div className="screen home-screen">
    <header className="home-intro"><div className="eyebrow">Следующая игра</div><h1>Ближайшая<br/>тренировка</h1></header>
    <section className="next-training-section" aria-label="Ближайшая тренировка"><TrainingFeed limit={1}/></section>
  </div>;
}
