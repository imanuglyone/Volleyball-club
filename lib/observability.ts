export type OperationalEvent =
  | 'booking_create'
  | 'booking_cancel'
  | 'booking_claim'
  | 'mini_app_bootstrap'
  | 'cache_invalidation'
  | 'feature_flag_evaluation'
  | 'migration_reconciliation'
  | 'api_result';

export type OperationalEventData = {
  surface: 'web' | 'telegram' | 'admin' | 'system';
  outcome: 'started' | 'success' | 'error' | 'blocked' | 'clear';
  code?: string;
  latency_ms?: number;
  count?: number;
};

export function recordOperationalEvent(
  event: OperationalEvent,
  data: OperationalEventData,
) {
  console.info('avangard_event', {
    event,
    surface: data.surface,
    outcome: data.outcome,
    ...(data.code ? { code: data.code } : {}),
    ...(typeof data.latency_ms === 'number'
      ? { latency_ms: Math.max(0, Math.round(data.latency_ms)) }
      : {}),
    ...(typeof data.count === 'number'
      ? { count: Math.max(0, Math.round(data.count)) }
      : {}),
  });
}
