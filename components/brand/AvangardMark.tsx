type AvangardMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function AvangardMark({ size = 'md', className = '' }: AvangardMarkProps) {
  return <span className={`av-mark av-mark--${size} ${className}`.trim()} aria-hidden="true">AV</span>;
}
