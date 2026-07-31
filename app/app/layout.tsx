import Script from 'next/script';
import { AppShell } from '@/components/app/AppShell';
import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  const { miniAppV2 } = getSurfaceFeatureFlags();
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <TelegramProvider>
        <AppShell v2Enabled={miniAppV2}>{children}</AppShell>
      </TelegramProvider>
    </>
  );
}
