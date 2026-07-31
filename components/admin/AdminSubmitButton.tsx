'use client';

import { useFormStatus } from 'react-dom';

export function AdminSubmitButton({ label, pendingLabel = 'Сохраняем…' }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="admin-primary admin-submit" disabled={pending} aria-disabled={pending}>{pending ? pendingLabel : label}</button>;
}
