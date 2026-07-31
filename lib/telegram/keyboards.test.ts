import { afterEach, describe, expect, it } from 'vitest';
import { appUrl, contactRequestKeyboard } from './keyboards';

describe('Telegram keyboards', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('always opens the Mini App namespace', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://club.example/';
    expect(appUrl()).toBe('https://club.example/app');
  });

  it('requests only the Telegram account owner contact', () => {
    expect(contactRequestKeyboard()).toMatchObject({
      keyboard: [[{ request_contact: true }]],
      one_time_keyboard: true
    });
  });
});

