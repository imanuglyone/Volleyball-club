import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroVolleyball } from '@/components/visuals/HeroVolleyball';
import { buttonClassName } from '@/components/ui/Button';

export function FinalCtaSection() {
  return <section className="public-final"><HeroVolleyball compact/><p>Твой следующий матч</p><h2>Увидимся<br/><em>на площадке.</em></h2><Link href="/app" className={buttonClassName({ size: 'lg' })}>Открыть приложение <ArrowRight size={19}/></Link></section>;
}
