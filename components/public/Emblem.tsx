const images = {
  ball: '/images/v2/emblems/ball.webp',
  team: '/images/v2/emblems/community.webp',
  court: '/images/v2/emblems/court.webp',
  booking: '/images/v2/emblems/calendar.webp',
  check: '/images/v2/emblems/ticket-check.webp',
  clock: '/images/v2/emblems/clock.webp',
  pin: '/images/v2/emblems/location.webp'
} as const;

export type EmblemVariant = keyof typeof images;

export function Emblem({ variant, size = 'md', className = '', label }: { variant: EmblemVariant; size?: 'sm' | 'md' | 'lg'; className?: string; label?: string }) {
  return (
    <span
      className={`public-emblem public-emblem--${size} public-emblem--${variant} ${className}`.trim()}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <img
        className="public-emblem__image"
        src={images[variant]}
        alt=""
        width="720"
        height="720"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
