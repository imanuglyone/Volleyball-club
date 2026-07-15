import { AvangardMark } from './AvangardMark';

type AvangardWordmarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function AvangardWordmark({ compact = false, inverse = false }: AvangardWordmarkProps) {
  return <span className={`av-wordmark${compact ? ' av-wordmark--compact' : ''}${inverse ? ' av-wordmark--inverse' : ''}`}>
    <AvangardMark size={compact ? 'sm' : 'md'}/>
    <span><strong>Авангард</strong>{!compact && <small>Волейбольный клуб</small>}</span>
  </span>;
}
