import type { Metadata } from 'next';
import Link from 'next/link';
import { AvangardWordmark } from '@/components/brand/AvangardWordmark';
import { ArrowIcon } from '@/components/icons/AvangardIcons';
import { PublicHeader } from '@/components/public/PublicHeader';
import { HeroSection } from '@/components/public/HeroSection';
import { ManifestoSection } from '@/components/public/ManifestoSection';
import { ExperienceSection } from '@/components/public/ExperienceSection';
import { ProcessSection } from '@/components/public/ProcessSection';
import { SchedulePreview } from '@/components/public/SchedulePreview';
import { VenueSection } from '@/components/public/VenueSection';
import { FaqSection } from '@/components/public/FaqSection';
import { ContactSection } from '@/components/public/ContactSection';
import { FinalCtaSection } from '@/components/public/FinalCtaSection';
import { LegacyPublicHome } from '@/components/public/LegacyPublicHome';
import { club } from '@/components/public/site-content';
import { getPublicTrainingsResult } from '@/lib/dal/trainings';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export const metadata: Metadata = {
  title: 'Авангард — волейбольный клуб в Ангарске',
  description: club.description,
  alternates: { canonical: club.canonicalUrl },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: club.canonicalUrl,
    siteName: 'Авангард',
    title: 'Авангард — волейбольный клуб в Ангарске',
    description: club.description,
    images: [{ url: '/images/v2/avangard-og-cobalt.webp', width: 1200, height: 630, alt: 'Вечерняя волейбольная площадка «Авангард»' }]
  }
};

export default async function PublicHomePage() {
  const flags = getSurfaceFeatureFlags();
  if (!flags.siteV2) return <LegacyPublicHome/>;

  const { trainings, failed: scheduleLoadFailed } = await getPublicTrainingsResult();
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsClub',
        '@id': `${club.canonicalUrl}/#club`,
        name: club.name,
        url: club.canonicalUrl,
        description: club.description,
        areaServed: { '@type': 'City', name: club.city },
        sport: 'Volleyball'
      },
      ...trainings.slice(0, 8).map((training) => ({
        '@type': 'SportsEvent',
        name: `Волейбольная тренировка «Авангард»`,
        startDate: `${training.date}T${training.start_time}+08:00`,
        endDate: `${training.date}T${training.end_time}+08:00`,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: training.location_name || 'Спортивный зал',
          address: training.address || club.city
        },
        offers: {
          '@type': 'Offer',
          price: training.price,
          priceCurrency: 'RUB',
          availability: training.remaining > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          url: `${club.canonicalUrl}/trainings/${training.id}`
        }
      }))
    ]
  };

  return (
    <main className="public-site">
      <a className="public-skip-link" href="#public-content">К содержанию</a>
      <PublicHeader/>
      <div id="public-content">
        <HeroSection/>
        <ManifestoSection/>
        <ExperienceSection/>
        <ProcessSection/>
        <SchedulePreview initialTrainings={trainings} initialError={scheduleLoadFailed}/>
        <VenueSection/>
        <FaqSection/>
        <ContactSection/>
        <FinalCtaSection/>
      </div>
      <footer className="public-footer">
        <AvangardWordmark/>
        <p>{club.tagline}<br/><span>Ангарск · 2026</span></p>
        <nav aria-label="Ссылки в подвале">
          <a href="#club">О клубе</a>
          <a href="#schedule">Расписание</a>
          <Link href="/app">Mini App <ArrowIcon size={15}/></Link>
        </nav>
        <small>© 2026 Авангард</small>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}/>
    </main>
  );
}
