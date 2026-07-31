import Link from 'next/link';
import { ArrowIcon, PhoneIcon, TeamIcon } from '@/components/icons/AvangardIcons';
import { SectionMarker } from './SectionMarker';
import { club } from './site-content';

export function ContactSection() {
  const telegramLabel = club.telegramUrl ? 'Написать в Telegram' : '';
  return (
    <section className="public-contact" id="contacts" aria-labelledby="contact-title">
      <div>
        <SectionMarker index="07">Контакты</SectionMarker>
        <h2 id="contact-title">Остался вопрос?<br/><em>Мы рядом.</em></h2>
      </div>
      <div className="public-contact__actions">
        {club.telegramUrl ? (
          <a href={club.telegramUrl} target="_blank" rel="noreferrer">
            <span><TeamIcon size={23}/></span><p><small>Telegram</small><strong>{telegramLabel}</strong></p><ArrowIcon size={20}/>
          </a>
        ) : null}
        {club.phone ? (
          <a href={`tel:${club.phone.replace(/[^\d+]/g, '')}`}>
            <span><PhoneIcon size={23}/></span><p><small>Телефон</small><strong>{club.phone}</strong></p><ArrowIcon size={20}/>
          </a>
        ) : null}
        {!club.telegramUrl && !club.phone ? (
          <Link href="/app">
            <span><TeamIcon size={23}/></span><p><small>Telegram Mini App</small><strong>Открыть приложение</strong></p><ArrowIcon size={20}/>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
