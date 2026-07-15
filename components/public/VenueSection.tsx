import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

export function VenueSection() {
  return <section className="public-venue">
    <div className="public-venue__media" aria-hidden="true"><div className="public-court-lines"/><span>COURT<br/><em>IS READY</em></span></div>
    <div className="public-venue__copy"><SectionLabel>04 / Площадка</SectionLabel><MapPin size={27}/><h2>В центре<br/>движения</h2><p>Удобные залы, понятные адреса и актуальная вместимость. Ты заранее знаешь, куда идти и кто будет рядом.</p><Link href="/schedule">Найти тренировку <ArrowUpRight size={17}/></Link></div>
  </section>;
}
