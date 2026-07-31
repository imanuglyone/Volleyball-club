'use client';

import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function HeroVideo() {
  const [canPlayMotion, setCanPlayMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const syncPreference = () => setCanPlayMotion(!mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);

    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  if (!canPlayMotion) return null;

  return (
    <video
      className="public-hero__video"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster="/images/v2/avangard-hero-poster-cobalt.webp"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    >
      <source src="/videos/avangard-hero-cobalt.mp4" type="video/mp4" />
    </video>
  );
}
