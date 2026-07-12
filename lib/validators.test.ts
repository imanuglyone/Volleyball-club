import { describe, expect, it } from 'vitest';
import { normalizePhone, profileSchema } from './validators';

describe('phone normalization', () => {
  it('removes formatting and keeps country prefix', () => expect(normalizePhone('+7 (900) 123-45-67')).toBe('+79001234567'));
  it('rejects invalid phone input', () => expect(profileSchema.safeParse({ display_name: 'Ира', phone: 'abc' }).success).toBe(false));
});
