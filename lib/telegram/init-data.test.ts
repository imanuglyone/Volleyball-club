import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { validateTelegramInitData } from './init-data';

function signed(token: string, entries: Record<string, string>) {
  const params = new URLSearchParams(entries);
  const check = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  params.set('hash', createHmac('sha256', secret).update(check).digest('hex'));
  return params.toString();
}

describe('Telegram initData validation', () => {
  it('accepts a valid signed payload', () => {
    const data = signed('token', { auth_date: '1000', user: JSON.stringify({ id: 42, first_name: 'Ира' }) });
    expect(validateTelegramInitData(data, 'token', 100, 1050).user.id).toBe(42);
  });
  it('rejects tampering and expired payloads', () => {
    const data = signed('token', { auth_date: '1000', user: JSON.stringify({ id: 42, first_name: 'Ира' }) });
    const tampered = new URLSearchParams(data);
    tampered.set('user', JSON.stringify({ id: 42, first_name: 'Олег' }));
    expect(() => validateTelegramInitData(tampered.toString(), 'token', 100, 1050)).toThrow();
    expect(() => validateTelegramInitData(data, 'token', 10, 1050)).toThrow('telegram_auth_expired');
  });
});
