import { PublicBooking } from '@/components/PublicBooking';

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />
        <div className="hero-net" />
        <div className="container-page pb-8 pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-6">
              <div className="hero-kicker animate-fade-up">{'\u0410\u0432\u0430\u043d\u0433\u0430\u0440\u0434'}</div>
              <h1 className="heading text-4xl font-semibold text-white md:text-5xl animate-fade-up animate-delay-1">
                {'\u0417\u0430\u043f\u0438\u0441\u044c \u043d\u0430 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438'}
              </h1>
              <p className="max-w-xl text-base text-steel-200 animate-fade-up animate-delay-2">
                {'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0434\u043e\u0431\u043d\u0443\u044e \u0434\u0430\u0442\u0443, \u043f\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0438 \u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0443. \u0411\u0435\u0437 \u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u044b \u2014 \u043f\u0440\u043e\u0441\u0442\u043e \u0438\u043c\u044f \u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-steel-200">
                <span className="pill">{'\u0411\u0435\u0437 \u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u044b'}</span>
                <span className="pill">{'\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0432 Telegram'}</span>
                <span className="pill">{'\u041c\u0435\u0441\u0442\u0430 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u044b'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="card card-soft p-6 text-sm text-steel-200 animate-fade-up animate-delay-2">
                <div className="text-xs uppercase tracking-[0.3em] text-steel-300">{'\u041f\u0440\u0430\u0432\u0438\u043b\u0430'}</div>
                <ul className="mt-4 space-y-3">
                  <li>{'\u041f\u0440\u0438\u0445\u043e\u0434\u0438\u0442\u0435 \u0437\u0430 10 \u043c\u0438\u043d\u0443\u0442 \u0434\u043e \u043d\u0430\u0447\u0430\u043b\u0430.'}</li>
                  <li>{'\u041e\u043f\u043b\u0430\u0442\u0430 \u043d\u0430 \u043c\u0435\u0441\u0442\u0435, \u0431\u0435\u0437 \u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442.'}</li>
                  <li>{'\u041e\u0442\u043c\u0435\u043d\u0430 \u2014 \u043d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0430\u0434\u043c\u0438\u043d\u0443.'}</li>
                </ul>
              </div>
              <div className="card card-soft p-6 text-sm text-steel-200 animate-fade-up animate-delay-2">
                <div className="text-xs uppercase tracking-[0.3em] text-steel-300">{'\u041b\u043e\u043a\u0430\u0446\u0438\u0438'}</div>
                <p className="mt-4">{'\u0410\u0434\u0440\u0435\u0441 \u0438 \u0437\u0430\u043b \u0443\u043a\u0430\u0437\u0430\u043d\u044b \u0432 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438. \u0422\u0430\u043c \u0436\u0435 \u043c\u043e\u0436\u043d\u043e \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u0430\u0440\u0442\u0443.'}</p>
                <p className="mt-2 text-xs text-steel-300">
                  {'\u0415\u0441\u043b\u0438 \u0430\u0434\u0440\u0435\u0441 \u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f \u2014 \u043c\u044b \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u0438\u043c \u0441\u043f\u0438\u0441\u043e\u043a.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <PublicBooking />
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="card p-6">
            <h2 className="heading text-2xl font-semibold text-white">{'\u041e\u0442\u0432\u0435\u0442\u044b \u043d\u0430 \u0432\u043e\u043f\u0440\u043e\u0441\u044b'}</h2>
            <div className="mt-6 space-y-4 text-sm text-steel-200">
              <div>
                <div className="text-white">{'\u041d\u0443\u0436\u043d\u0430 \u043b\u0438 \u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u0430?'}</div>
                <p className="text-steel-300">
                  {'\u041d\u0435\u0442, \u043e\u043f\u043b\u0430\u0442\u0430 \u043f\u0440\u043e\u0438\u0441\u0445\u043e\u0434\u0438\u0442 \u043d\u0430 \u043c\u0435\u0441\u0442\u0435 \u043f\u0435\u0440\u0435\u0434 \u043d\u0430\u0447\u0430\u043b\u043e\u043c \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438.'}
                </p>
              </div>
              <div>
                <div className="text-white">{'\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c?'}</div>
                <p className="text-steel-300">
                  {'\u0414\u0430, \u043d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0443, \u0438 \u043c\u044b \u0441\u043d\u0438\u043c\u0435\u043c \u0432\u0430\u0448\u0443 \u0437\u0430\u044f\u0432\u043a\u0443.'}
                </p>
              </div>
              <div>
                <div className="text-white">{'\u0421\u043a\u043e\u043b\u044c\u043a\u043e \u043c\u0435\u0441\u0442 \u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c?'}</div>
                <p className="text-steel-300">
                  {'\u041c\u044b \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u043c \u0430\u043a\u0442\u0443\u0430\u043b\u044c\u043d\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u0432 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c \u0432\u0440\u0435\u043c\u0435\u043d\u0438. \u041f\u0440\u0438 \u0437\u0430\u043f\u0438\u0441\u0438 \u043c\u0435\u0441\u0442\u0430 \u0431\u0440\u043e\u043d\u0438\u0440\u0443\u044e\u0442\u0441\u044f \u043c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u043e.'}
                </p>
              </div>
            </div>
          </div>
          <div className="card card-soft p-6">
            <h2 className="heading text-2xl font-semibold text-white">{'\u041f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430'}</h2>
            <p className="mt-4 text-sm text-steel-200">
              {'\u0415\u0441\u043b\u0438 \u043d\u0443\u0436\u043d\u043e \u0431\u044b\u0441\u0442\u0440\u043e \u043d\u0430\u0439\u0442\u0438 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0443 \u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0438\u043b\u044c\u0442\u0440 \u00ab\u0422\u043e\u043b\u044c\u043a\u043e \u0441 \u043c\u0435\u0441\u0442\u0430\u043c\u0438\u00bb \u0438 \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0443\u044e \u0434\u0430\u0442\u0443.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-steel-300">
              <span className="pill">{'\u0411\u044b\u0441\u0442\u0440\u044b\u0439 \u043f\u043e\u0438\u0441\u043a'}</span>
              <span className="pill">{'\u0421\u043f\u0438\u0441\u043e\u043a \u0437\u0430\u043f\u0438\u0441\u0430\u0432\u0448\u0438\u0445\u0441\u044f'}</span>
              <span className="pill">{'\u0410\u043a\u0442\u0443\u0430\u043b\u044c\u043d\u044b\u0439 \u043b\u0438\u043c\u0438\u0442'}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
