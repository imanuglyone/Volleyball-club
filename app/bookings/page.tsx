import { redirect } from 'next/navigation';
import Script from 'next/script';
import { LegacyBookingsScreen } from '@/components/app/legacy/LegacyBookingsScreen';
import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { getPersonalRouteMode } from '@/lib/feature-flags';

export default function LegacyBookingsPage() {
  if (getPersonalRouteMode() === 'redirect-to-app') redirect('/app/bookings');
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <TelegramProvider><LegacyBookingsScreen /></TelegramProvider>
    </>
  );
}
