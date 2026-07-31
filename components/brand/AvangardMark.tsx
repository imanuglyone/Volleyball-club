type AvangardMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
};

export function AvangardMark({ size = 'md', className = '', title }: AvangardMarkProps) {
  return (
    <span className={`av-mark av-mark--${size} ${className}`.trim()}>
      <svg
        className="av-mark__svg"
        viewBox="0 0 64 64"
        role={title ? 'img' : undefined}
        aria-hidden={title ? undefined : true}
      >
        {title ? <title>{title}</title> : null}
        <path className="av-mark__frame" d="M6 53 27.8 9.5h8.4L58 53" />
        <path className="av-mark__drive" d="M18.5 39.5h31L39 20.8" />
        <path className="av-mark__court" d="M12.5 51.5h39M27.1 31.5h15.8" />
        <path className="av-mark__arc" d="M11 29.5C17.5 14 31 4.8 48.5 8.2" />
        <circle className="av-mark__ball" cx="49.5" cy="8.5" r="4.2" />
      </svg>
    </span>
  );
}
