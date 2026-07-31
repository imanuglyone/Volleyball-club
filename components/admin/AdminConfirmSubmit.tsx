'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
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
  const { pending } = useFormStatus();
  function confirm() { setOpen(false); triggerRef.current?.form?.requestSubmit(); }
  return <><button ref={triggerRef} type="button" className={className} aria-label={ariaLabel} disabled={pending} onClick={() => setOpen(true)}>{children}</button><Dialog open={open} onClose={() => setOpen(false)} title={title}><p>{description}</p><div className="dialog-actions"><Button variant="danger" full loading={pending} onClick={confirm}>{confirmLabel}</Button><Button variant="secondary" full disabled={pending} onClick={() => setOpen(false)}>Отмена</Button></div></Dialog></>;
}
