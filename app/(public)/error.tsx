'use client';

import { useEffect } from 'react';
import { ClockIcon } from '@/components/icons/AvangardIcons';

export default function PublicSurfaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public surface render failed', {
      kind: error.name || 'unknown',
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="public-site public-subpage">
      <section className="public-subpage__hero" role="alert">
        <ClockIcon size={32}/>
        <p>Авангард · временная ошибка</p>
        <h1>Страница не<br/><em>загрузилась.</em></h1>
        <span>Попробуйте ещё раз. Если соединение восстановилось, данные появятся без повторной записи.</span>
        <button className="public-button" type="button" onClick={reset}>
          Повторить
        </button>
      </section>
    </main>
  );
}
