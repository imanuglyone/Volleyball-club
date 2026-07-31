import type { Metadata } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const applicationUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(applicationUrl),
  title: 'Авангард — волейбольный клуб в Ангарске',
  description:
    'Живые волейбольные тренировки в Ангарске. Выберите дату, займите место и выходите на площадку.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
