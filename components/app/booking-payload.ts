import { CURRENT_CONSENT_VERSION } from '@/lib/consent';

export function buildMiniAppBookingPayload(trainingId: string, displayName: string, phone: string) {
  return {
    training_id: trainingId,
    display_name: displayName,
    phone,
    consent: true as const,
    consent_version: CURRENT_CONSENT_VERSION,
  };
}
