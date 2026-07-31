import { describe, expect, it } from 'vitest';
import { CURRENT_CONSENT_VERSION } from '@/lib/consent';
import { buildMiniAppBookingPayload } from './booking-payload';

describe('buildMiniAppBookingPayload', () => {
  it('always sends the accepted consent contract required by the Mini App API', () => {
    expect(buildMiniAppBookingPayload('b5f081c1-cd8d-4052-936f-6c3357bdcfd5', 'Иван', '+79001234567')).toEqual({
      training_id: 'b5f081c1-cd8d-4052-936f-6c3357bdcfd5',
      display_name: 'Иван',
      phone: '+79001234567',
      consent: true,
      consent_version: CURRENT_CONSENT_VERSION,
    });
  });
});
