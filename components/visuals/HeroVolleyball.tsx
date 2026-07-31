export function HeroVolleyball({ compact = false }: { compact?: boolean }) {
  return <div className={`hero-volleyball${compact ? ' hero-volleyball--compact' : ''}`} aria-hidden="true">
    <span className="hero-volleyball__orbit hero-volleyball__orbit--one"/>
    <span className="hero-volleyball__orbit hero-volleyball__orbit--two"/>
    <div className="hero-volleyball__ball">
      <span className="hero-volleyball__panel hero-volleyball__panel--one"/>
      <span className="hero-volleyball__panel hero-volleyball__panel--two"/>
      <span className="hero-volleyball__panel hero-volleyball__panel--three"/>
      <span className="hero-volleyball__seam hero-volleyball__seam--one"/>
      <span className="hero-volleyball__seam hero-volleyball__seam--two"/>
    </div>
  </div>;
}
