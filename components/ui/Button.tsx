import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function Button({ variant = 'primary', size = 'md', full = false, loading = false, className = '', disabled, children, ...props }: ButtonProps) {
  const classes = ['ui-button', `ui-button--${variant}`, `ui-button--${size}`, full ? 'ui-button--full' : '', className].filter(Boolean).join(' ');
  return <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <span className="ui-spinner" aria-hidden="true"/>}
    {children}
  </button>;
}

export function buttonClassName({ variant = 'primary', size = 'md', full = false }: { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; full?: boolean } = {}) {
  return ['ui-button', `ui-button--${variant}`, `ui-button--${size}`, full ? 'ui-button--full' : ''].filter(Boolean).join(' ');
}
