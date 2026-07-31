export type BackgroundVariant = 'public' | 'app' | 'admin' | 'detail';

export function MidnightCourtBackground({ variant = 'app' }: { variant?: BackgroundVariant }) {
  return <div className={`midnight-bg midnight-bg--${variant}`} aria-hidden="true">
    <span className="midnight-bg__glow midnight-bg__glow--one"/>
    <span className="midnight-bg__glow midnight-bg__glow--two"/>
    <svg className="midnight-bg__court" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
      <path d="M-80 760 640 350l700 360"/>
      <path d="M125 900 660 405 1130 900"/>
      <path d="M360 900 685 470 900 900"/>
      <path d="M-40 730h1280"/>
      <path d="M210 610h820"/>
    </svg>
    <svg className="midnight-bg__trajectory" viewBox="0 0 1200 900" preserveAspectRatio="none">
      <path d="M80 640C280 90 760 40 1110 330"/>
      <path d="M260 810C510 300 910 210 1220 360"/>
      <circle cx="1084" cy="313" r="4"/>
    </svg>
    <span className="midnight-bg__beam"/>
    <span className="midnight-bg__grain"/>
    <span className="midnight-bg__shade"/>
  </div>;
}
