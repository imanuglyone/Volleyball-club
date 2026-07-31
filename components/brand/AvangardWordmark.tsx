import { AvangardMark } from './AvangardMark';

type AvangardWordmarkProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function AvangardWordmark({ compact = false, inverse = false, className = '' }: AvangardWordmarkProps) {
  return <span className={`av-wordmark${compact ? ' av-wordmark--compact' : ''}${inverse ? ' av-wordmark--inverse' : ''} ${className}`.trim()}>
    <AvangardMark size={compact ? 'sm' : 'md'}/>
    <span className="av-wordmark__type"><strong>АВАНГАРД</strong>{!compact && <small>Волейбольный клуб · Ангарск</small>}</span>
  </span>;
}
