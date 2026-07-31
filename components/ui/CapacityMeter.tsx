type CapacityMeterProps = {
  booked: number;
  capacity: number;
  remaining: number;
  compact?: boolean;
};

export function CapacityMeter({ booked, capacity, remaining, compact = false }: CapacityMeterProps) {
  const percent = capacity > 0 ? Math.min(100, Math.max(0, booked / capacity * 100)) : 0;
  return <div className={`capacity-meter${compact ? ' capacity-meter--compact' : ''}`} aria-label={`Записано ${booked} из ${capacity}, свободно ${remaining}`}>
    <div className="capacity-meter__meta"><span><strong>{booked}</strong> игроков</span><span><strong>{remaining}</strong> свободно</span></div>
    <div className="capacity-meter__track" aria-hidden="true"><i className="capacity-meter__fill" style={{ width: `${percent}%` }}/></div>
  </div>;
}
