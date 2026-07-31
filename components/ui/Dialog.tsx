'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  initialFocus?: 'first' | 'last';
};

const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, initialFocus = 'first' }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    const target = initialFocus === 'last' ? focusables?.[focusables.length - 1] : focusables?.[0];
    target?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previous?.focus();
    };
  }, [initialFocus, onClose, open]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(<div className="dialog-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div ref={panelRef} className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <span className="dialog-handle" aria-hidden="true"/>
      <h2 id={titleId}>{title}</h2>
      {children}
    </div>
  </div>, document.body);
}
