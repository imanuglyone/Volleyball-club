import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { Manrope } from 'next/font/google';
import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { AppShell } from '@/components/app/AppShell';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'Авангард — волейбольный клуб в Ангарске',
  description: 'Живые волейбольные тренировки в Ангарске. Выберите дату, займите место и выходите на площадку.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramProvider><AppShell>{children}</AppShell></TelegramProvider>
      </body>
    </html>
  );
}
