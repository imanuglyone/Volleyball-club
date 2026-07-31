import { describe, expect, it } from 'vitest';
import { createManagementToken, hmacSha256Hex, sha256Hex } from './security';

describe('server security helpers', () => {
  it('creates a 256-bit base64url management token', () => {
    const token = createManagementToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(sha256Hex(token)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashes rate-limit identifiers without retaining input', () => {
    const digest = hmacSha256Hex('secret', '+79990000000');
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain('7999');
  });
});

