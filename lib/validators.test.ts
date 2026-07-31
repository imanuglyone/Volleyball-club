import { describe, expect, it } from 'vitest';
import { miniAppBookingSchema, normalizePhone, profileSchema } from './validators';

describe('phone normalization', () => {
  it('removes formatting and keeps country prefix', () => expect(normalizePhone('+7 (900) 123-45-67')).toBe('+79001234567'));
  it('canonicalizes the Russian domestic prefix', () => expect(normalizePhone('8 (900) 123-45-67')).toBe('+79001234567'));
  it('rejects invalid phone input', () => expect(profileSchema.safeParse({ display_name: 'Ира', phone: 'abc' }).success).toBe(false));
  it('requires consent evidence for Mini App booking', () => {
    const training_id = '00000000-0000-4000-8000-000000000001';
    expect(miniAppBookingSchema.safeParse({ training_id }).success).toBe(false);
    expect(miniAppBookingSchema.safeParse({
      training_id,
      consent: true,
      consent_version: '2026-07-31-v1'
    }).success).toBe(true);
  });
});
