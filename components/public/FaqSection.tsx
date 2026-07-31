import { faq } from './site-content';
import { SectionMarker } from './SectionMarker';

export function FaqSection() {
  return (
    <section className="public-faq" id="faq" aria-labelledby="faq-title">
      <header>
        <SectionMarker index="06">Коротко о важном</SectionMarker>
        <h2 id="faq-title">До игры<br/><em>всё понятно.</em></h2>
      </header>
      <div className="public-faq__list">
        {faq.map((item, index) => (
          <details key={item.question}>
            <summary><span>0{index + 1}</span><strong>{item.question}</strong><i aria-hidden="true"/></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
