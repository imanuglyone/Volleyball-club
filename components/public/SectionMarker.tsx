import type { ReactNode } from 'react';

export function SectionMarker({ index, children }: { index: string; children: ReactNode }) {
  return <div className="public-section-marker"><span>{index}</span><p>{children}</p></div>;
}

