import type { HTMLAttributes, ReactNode } from 'react';

type GlassPanelProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'section' | 'div';
  children: ReactNode;
};

export function GlassPanel({ as: Component = 'div', className = '', children, ...props }: GlassPanelProps) {
  return <Component className={`glass-panel ${className}`.trim()} {...props}>{children}</Component>;
}
