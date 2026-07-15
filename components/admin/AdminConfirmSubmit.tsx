'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

type AdminConfirmSubmitProps = {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  className?: string;
  ariaLabel?: string;
};

export function AdminConfirmSubmit({ children, title, description, confirmLabel, className, ariaLabel }: AdminConfirmSubmitProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  function confirm() { setOpen(false); triggerRef.current?.form?.requestSubmit(); }
  return <><button ref={triggerRef} type="button" className={className} aria-label={ariaLabel} onClick={() => setOpen(true)}>{children}</button><Dialog open={open} onClose={() => setOpen(false)} title={title}><p>{description}</p><div className="dialog-actions"><Button variant="danger" full onClick={confirm}>{confirmLabel}</Button><Button variant="secondary" full onClick={() => setOpen(false)}>Отмена</Button></div></Dialog></>;
}
