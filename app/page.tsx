import { PublicBooking } from '@/components/PublicBooking';

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="container-page pb-8 pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-6">
              <div className="badge w-fit animate-fade-up">{'\u0412\u043e\u043b\u0435\u0439\u0431\u043e\u043b\u044c\u043d\u044b\u0439 \u043a\u043b\u0443\u0431'}</div>
              <h1 className="heading text-4xl font-semibold text-white md:text-5xl animate-fade-up animate-delay-1">
                {'\u0417\u0430\u043f\u0438\u0441\u044c \u043d\u0430 \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438'}
              </h1>
              <p className="max-w-xl text-base text-steel-200 animate-fade-up animate-delay-2">
                {'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0434\u043e\u0431\u043d\u0443\u044e \u0434\u0430\u0442\u0443, \u043f\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0438 \u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0443. \u0411\u0435\u0437 \u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u044b \u2014 \u043f\u0440\u043e\u0441\u0442\u043e \u0438\u043c\u044f \u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d.'}
              </p>
            </div>
            <div className="card card-soft p-6 text-sm text-steel-200 animate-fade-up animate-delay-2">
              <div className="text-xs uppercase tracking-[0.3em] text-steel-300">{'\u041f\u0440\u0430\u0432\u0438\u043b\u0430'}</div>
              <ul className="mt-4 space-y-3">
                <li>{'\u041f\u0440\u0438\u0445\u043e\u0434\u0438\u0442\u0435 \u0437\u0430 10 \u043c\u0438\u043d\u0443\u0442 \u0434\u043e \u043d\u0430\u0447\u0430\u043b\u0430.'}</li>
                <li>{'\u041e\u043f\u043b\u0430\u0442\u0430 \u043d\u0430 \u043c\u0435\u0441\u0442\u0435, \u0431\u0435\u0437 \u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442.'}</li>
                <li>{'\u041e\u0442\u043c\u0435\u043d\u0430 \u2014 \u043d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0430\u0434\u043c\u0438\u043d\u0443.'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <PublicBooking />
      </section>
    </main>
  );
}
