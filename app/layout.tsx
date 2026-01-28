import type { Metadata } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body'
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display'
});

export const metadata: Metadata = {
  title: '\u0412\u043e\u043b\u0435\u0439\u0431\u043e\u043b\u044c\u043d\u044b\u0439 \u043a\u043b\u0443\u0431',
  description: '\u0417\u0430\u043f\u0438\u0441\u044c \u043d\u0430 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043e\u043b\u0435\u0439\u0431\u043e\u043b\u044c\u043d\u043e\u0433\u043e \u043a\u043b\u0443\u0431\u0430'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body>
        <div className="spotlight" />
        <div className="spotlight right" />
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
