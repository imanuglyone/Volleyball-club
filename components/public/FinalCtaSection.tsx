import { ArrowIcon } from '@/components/icons/AvangardIcons';
import { AvangardMark } from '@/components/brand/AvangardMark';

export function FinalCtaSection() {
  return (
    <section className="public-final" id="final" aria-labelledby="final-title">
      <div className="public-final__rings" aria-hidden="true"><i/><i/><i/></div>
      <AvangardMark size="lg"/>
      <p>Следующая подача — твоя</p>
      <h2 id="final-title">Увидимся<br/><em>на площадке.</em></h2>
      <a className="public-button" href="#schedule">Занять место <ArrowIcon size={19}/></a>
    </section>
  );
}
