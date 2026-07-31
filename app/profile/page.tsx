import { redirect } from 'next/navigation';
import Script from 'next/script';
import { LegacyProfileScreen } from '@/components/app/legacy/LegacyProfileScreen';
import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { getPersonalRouteMode } from '@/lib/feature-flags';

export default function LegacyProfilePage() {
  if (getPersonalRouteMode() === 'redirect-to-app') redirect('/app/profile');
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <TelegramProvider><LegacyProfileScreen /></TelegramProvider>
    </>
  );
}
