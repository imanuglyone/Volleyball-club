'use client';

import {
  BallIcon,
  CheckIcon,
  ClockIcon,
  CourtIcon,
  PinIcon,
  ScheduleIcon,
  TeamIcon
} from '@/components/icons/AvangardIcons';

const icons = {
  ball: BallIcon,
  booking: ScheduleIcon,
  check: CheckIcon,
  clock: ClockIcon,
  court: CourtIcon,
  pin: PinIcon,
  team: TeamIcon
};

const images: Record<keyof typeof icons, string> = {
  ball: '/images/v2/emblems/ball.webp',
  team: '/images/v2/emblems/community.webp',
  court: '/images/v2/emblems/court.webp',
  booking: '/images/v2/emblems/calendar.webp',
  check: '/images/v2/emblems/ticket-check.webp',
  clock: '/images/v2/emblems/clock.webp',
  pin: '/images/v2/emblems/location.webp'
};

export type EmblemVariant = keyof typeof icons;

export function Emblem({ variant, size = 'md', className = '', label }: { variant: EmblemVariant; size?: 'sm' | 'md' | 'lg'; className?: string; label?: string }) {
  const Icon = icons[variant];
  return (
    <span
      className={`public-emblem public-emblem--${size} public-emblem--${variant} ${className}`.trim()}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="public-emblem__orbit public-emblem__orbit--one"/>
      <span className="public-emblem__orbit public-emblem__orbit--two"/>
      <span className="public-emblem__core"><Icon size={size === 'lg' ? 52 : size === 'md' ? 40 : 28}/></span>
      <span className="public-emblem__dot"/>
      <img
        className="public-emblem__image"
        src={images[variant]}
        alt=""
        width="720"
        height="720"
        loading="lazy"
        decoding="async"
        onError={(event) => { event.currentTarget.hidden = true; }}
      />
    </span>
  );
}
