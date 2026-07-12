import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { AppShell } from '@/components/app/AppShell';

export const metadata: Metadata = {
  title: '\u0412\u043e\u043b\u0435\u0439\u0431\u043e\u043b\u044c\u043d\u044b\u0439 \u043a\u043b\u0443\u0431',
  description: '\u0417\u0430\u043f\u0438\u0441\u044c \u043d\u0430 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043e\u043b\u0435\u0439\u0431\u043e\u043b\u044c\u043d\u043e\u0433\u043e \u043a\u043b\u0443\u0431\u0430'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramProvider><AppShell>{children}</AppShell></TelegramProvider>
      </body>
    </html>
  );
}
