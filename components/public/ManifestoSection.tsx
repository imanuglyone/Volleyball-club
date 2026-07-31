import { Emblem } from './Emblem';
import { SectionMarker } from './SectionMarker';

const principles = [
  ['Без отбора', 'Не нужно доказывать, что ты достаточно хорош. Найдём подходящий ритм и состав.'],
  ['Живые люди', 'Ты заранее видишь тренировку и имена команды, а не безликую заявку.'],
  ['Честные места', 'Вместимость обновляется после каждой записи. Последнее место нельзя продать дважды.']
];

export function ManifestoSection() {
  return (
    <section className="public-manifesto" id="club" aria-labelledby="manifesto-title">
      <div className="public-manifesto__intro">
        <SectionMarker index="01">Зачем мы здесь</SectionMarker>
        <p>Не спортивная секция и не закрытая команда. Это место, куда хочется возвращаться после работы.</p>
      </div>
      <div className="public-manifesto__statement">
        <Emblem variant="ball" size="lg" label="Волейбольный мяч на орбите — символ движения клуба"/>
        <h2 id="manifesto-title">Вечер становится<br/><em>игрой.</em> Люди —<br/>командой.</h2>
      </div>
      <div className="public-manifesto__principles">
        {principles.map(([title, text], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
