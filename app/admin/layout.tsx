import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-night-950">
      <header className="border-b border-night-800 bg-night-900/60 backdrop-blur">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="text-lg font-semibold text-white">{'\u0410\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u044c'}</div>
          <nav className="flex items-center gap-4 text-sm text-steel-200">
            <Link className="hover:text-white" href="/admin">
              {'\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438'}
            </Link>
            <Link className="hover:text-white" href="/">
              {'\u041d\u0430 \u0441\u0430\u0439\u0442'}
            </Link>
          </nav>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
