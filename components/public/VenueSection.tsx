import { ArrowIcon, PinIcon } from '@/components/icons/AvangardIcons';
import { Emblem } from './Emblem';
import { SectionMarker } from './SectionMarker';

export function VenueSection() {
  return (
    <section className="public-venue" id="venue" aria-labelledby="venue-title">
      <div className="public-venue__scene" aria-hidden="true">
        <div className="public-venue__light"/>
        <div className="public-venue__court"><i/><i/><i/></div>
        <Emblem variant="pin" size="lg" label="Метка площадки с волейбольным кортом"/>
        <p>ANGARSK<br/><em>COURT</em></p>
      </div>
      <div className="public-venue__copy">
        <SectionMarker index="05">Площадка</SectionMarker>
        <PinIcon size={30}/>
        <h2 id="venue-title">Ты знаешь,<br/>куда <em>идти.</em></h2>
        <p>Название зала и точный адрес указаны в каждой тренировке. Нажми на адрес — маршрут откроется в картах.</p>
        <a className="public-text-link" href="#schedule">Смотреть площадки <ArrowIcon size={18}/></a>
      </div>
    </section>
  );
}
