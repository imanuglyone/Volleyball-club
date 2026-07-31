import { describe, expect, it, vi } from 'vitest';
import {
  canonicalPublicBookingHash,
  checkPublicBookingIngressRateLimit,
  releasePublicBookingRequest,
  reservePublicBookingRequest,
  type PublicBookingInput,
} from './public-bookings';

const input: PublicBookingInput = {
  trainingId: '00000000-0000-4000-8000-000000000001',
  name: ' Ирина ',
  phone: '+79001234567',
  phoneNormalized: '+79001234567',
  consentVersion: '2026-07-31-v1',
  idempotencyKey: '00000000-0000-4000-8000-000000000002',
};

describe('public booking idempotency reservation', () => {
  it('uses the canonical request hash without retaining presentation formatting', () => {
    const hash = canonicalPublicBookingHash(input);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(canonicalPublicBookingHash({
      ...input,
      name: 'Ирина',
      phone: '8 (900) 123-45-67',
    }));
  });

  it.each(['owner', 'pending', 'replay', 'rate_limited'] as const)(
    'returns the atomic %s reservation state',
    async (state) => {
      process.env.RATE_LIMIT_HMAC_SECRET = 'test-secret';
      const rpc = vi.fn().mockResolvedValue({
        data: [{
          reservation_status: state,
          reservation_owner_token: state === 'owner'
            ? '00000000-0000-4000-8000-000000000003'
            : null,
          limited_bucket: state === 'rate_limited' ? 'phone_training' : null,
          retry_after: state === 'rate_limited' ? 42 : 0,
        }],
        error: null,
      });
      await expect(
        reservePublicBookingRequest({ rpc } as never, input, { ip: '127.0.0.1' }),
      ).resolves.toMatchObject({
        status: state,
        limitedBucket: state === 'rate_limited' ? 'phone_training' : null,
        retryAfter: state === 'rate_limited' ? 42 : 0,
      });
      expect(rpc).toHaveBeenCalledWith('reserve_public_booking_request', {
        p_idempotency_key: input.idempotencyKey,
        p_request_hash: canonicalPublicBookingHash(input),
        p_owner_token: expect.any(String),
        p_ip_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        p_phone_training_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      });
    },
  );

  it('releases only the matching pending owner reservation', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const ownerToken = '00000000-0000-4000-8000-000000000003';
    await expect(
      releasePublicBookingRequest({ rpc } as never, input, ownerToken),
    ).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith('release_public_booking_request', {
      p_idempotency_key: input.idempotencyKey,
      p_request_hash: canonicalPublicBookingHash(input),
      p_owner_token: ownerToken,
    });
  });

  it('checks the distributed ingress bucket before idempotency work', async () => {
    process.env.RATE_LIMIT_HMAC_SECRET = 'test-secret';
    const rpc = vi.fn().mockResolvedValue({
      data: [{ allowed: false, retry_after: 17 }],
      error: null,
    });
    await expect(
      checkPublicBookingIngressRateLimit({ rpc } as never, '127.0.0.1'),
    ).resolves.toEqual({ allowed: false, retryAfter: 17 });
    expect(rpc).toHaveBeenCalledWith('check_booking_ingress_rate_limit', {
      p_ip_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });
});
