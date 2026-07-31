import { ArrowIcon } from '@/components/icons/AvangardIcons';
import { Emblem, type EmblemVariant } from './Emblem';
import { SectionMarker } from './SectionMarker';

const steps: Array<{ label: string; title: string; text: string; emblem: EmblemVariant }> = [
  { label: 'Выбирай', title: 'Найди дату', text: 'Расписание, стоимость и остаток мест видны сразу.', emblem: 'booking' },
  { label: 'Записывайся', title: 'Займи место', text: 'Имя и телефон нужны только организатору встречи.', emblem: 'check' },
  { label: 'Играй', title: 'Будь вовремя', text: 'Ссылка управления записью останется у тебя.', emblem: 'clock' }
];

export function ProcessSection() {
  return (
    <section className="public-process" aria-labelledby="process-title">
      <div className="public-process__head">
        <SectionMarker index="03">Как всё устроено</SectionMarker>
        <h2 id="process-title">От выбора даты<br/>до первого <em>касания.</em></h2>
      </div>
      <div className="public-process__track">
        {steps.map((step, index) => (
          <article key={step.label}>
            <span className="public-process__step">{index + 1}</span>
            <Emblem variant={step.emblem} size="sm" label={`${step.title}: эмблема шага`}/>
            <p>{step.label}</p>
            <h3>{step.title}</h3>
            <small>{step.text}</small>
            {index < steps.length - 1 ? <ArrowIcon className="public-process__arrow" size={26}/> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
