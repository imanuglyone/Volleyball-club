import { Emblem, type EmblemVariant } from './Emblem';
import { SectionMarker } from './SectionMarker';

const formats: Array<{ number: string; emblem: EmblemVariant; title: string; text: string }> = [
  { number: '01', emblem: 'team', title: 'Разный уровень', text: 'Любители играют с любителями. Без неловкого первого шага и закрытого состава.' },
  { number: '02', emblem: 'court', title: 'Полноценный зал', text: 'Разминка, команды, игровое время и понятная организация каждой встречи.' },
  { number: '03', emblem: 'clock', title: 'Вечером', text: 'Удобно после работы: заранее видны дата, время, площадка и свободные места.' }
];

export function ExperienceSection() {
  return (
    <section className="public-experience" id="format" aria-labelledby="format-title">
      <header>
        <SectionMarker index="02">Формат клуба</SectionMarker>
        <div><p>Игра для обычной недели</p><h2 id="format-title">Серьёзно к игре.<br/><em>Легко к себе.</em></h2></div>
      </header>
      <div className="public-experience__grid">
        {formats.map((item) => (
          <article key={item.number}>
            <span className="public-experience__number">{item.number}</span>
            <Emblem variant={item.emblem} size="md" label={`${item.title}: визуальная эмблема раздела`}/>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
