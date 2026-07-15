import Link from 'next/link';
import { TelegramEntryRedirect } from '@/components/telegram/TelegramEntryRedirect';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { MidnightCourtBackground } from '@/components/visuals/MidnightCourtBackground';
import { PublicHeader } from '@/components/public/PublicHeader';
import { HeroSection } from '@/components/public/HeroSection';
import { ManifestoSection } from '@/components/public/ManifestoSection';
import { ExperienceSection } from '@/components/public/ExperienceSection';
import { SchedulePreview } from '@/components/public/SchedulePreview';
import { VenueSection } from '@/components/public/VenueSection';
import { FinalCtaSection } from '@/components/public/FinalCtaSection';

export default function PublicHomePage() {
  return <main className="public-site mc-page">
    <TelegramEntryRedirect/>
    <MidnightCourtBackground variant="public"/>
    <div className="mc-content">
      <PublicHeader/>
      <HeroSection/>
      <ManifestoSection/>
      <ExperienceSection/>
      <SchedulePreview/>
      <VenueSection/>
      <FinalCtaSection/>
      <footer className="public-footer" id="contacts"><AvangardWordmark/><p>Волейбольный клуб · Ангарск</p><nav><Link href="/schedule">Расписание</Link><Link href="/app">Приложение</Link></nav><span>© 2026</span></footer>
    </div>
  </main>;
}
