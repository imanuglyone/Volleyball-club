import { describe, expect, it } from 'vitest';
import { buildVerifiedProfilePatch } from './profile-update';

describe('buildVerifiedProfilePatch', () => {
  it('preserves verification when only formatting or display name changes', () => {
    expect(buildVerifiedProfilePatch(
      { phone: '+7 900 123-45-67', phone_verified_at: '2026-07-31T00:00:00Z' },
      { display_name: 'Ирина', phone: '8 (900) 123-45-67' },
    )).toMatchObject({
      phone: '+79001234567',
      phone_verified_at: '2026-07-31T00:00:00Z',
    });
  });

  it('clears verification when the normalized phone changes', () => {
    expect(buildVerifiedProfilePatch(
      { phone: '+79001234567', phone_verified_at: '2026-07-31T00:00:00Z' },
      { display_name: 'Ирина', phone: '+79007654321' },
    )).toMatchObject({
      phone: '+79007654321',
      phone_verified_at: null,
    });
  });
});
