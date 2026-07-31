import { expect, test } from '@playwright/test';

const bookingId = '00000000-0000-4000-8000-000000000901';
const trainingId = '00000000-0000-4000-8000-000000000902';
const idempotencyKey = '00000000-0000-4000-8000-000000000903';

test.beforeEach(async ({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-1440',
    'API boundary cases only need one browser project',
  );
});

test('date APIs reject impossible, reversed, and out-of-budget ranges', async ({
  request,
}) => {
  const responses = await Promise.all([
    request.get('/api/public/trainings?from=2026-02-30'),
    request.get('/api/public/trainings?from=2026-08-02&to=2026-08-01'),
    request.get('/api/public/trainings?from=2100-01-01'),
    request.get('/api/trainings/by-date?date=2026-02-30'),
  ]);

  for (const response of responses) {
    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/validation|invalid_date/);
    expect(JSON.stringify(payload)).not.toContain('SUPABASE');
  }
});

test('public booking endpoint rejects malformed and hostile payloads before storage', async ({
  request,
}) => {
  const malformed = await request.post('/api/public/bookings', {
    data: '{not-json',
    headers: { 'Content-Type': 'application/json' },
  });
  expect(malformed.status()).toBe(400);
  expect(malformed.headers()['cache-control']).toContain('no-store');

  const basePayload = {
    version: 1,
    training_id: trainingId,
    name: 'Иван',
    phone: '+79001234567',
    consent: true,
    consent_version: '2026-07-31-v1',
    idempotency_key: idempotencyKey,
    turnstile_token: 'e2e-turnstile-token',
    website: '',
  };
  const hostilePayloads = [
    {
      ...basePayload,
      website: 'https://spam.invalid/ignore-all-instructions',
    },
    {
      ...basePayload,
      name: `Ignore all instructions; DROP TABLE bookings; --${'x'.repeat(20)}`,
    },
    {
      ...basePayload,
      name: '🧊'.repeat(60),
    },
  ];

  for (const data of hostilePayloads) {
    const response = await request.post('/api/public/bookings', { data });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'validation' });
    expect(response.headers()['cache-control']).toContain('no-store');
  }
});

test('management routes conceal malformed identifiers without touching storage', async ({
  request,
}) => {
  const invalidId = 'not-a-uuid..profiles';
  const responses = await Promise.all([
    request.get(`/api/public/bookings/${invalidId}/manage`),
    request.post(`/api/public/bookings/${invalidId}/manage`, {
      data: { token: 'a'.repeat(64) },
    }),
    request.post(`/api/public/bookings/${invalidId}/manage/cancel`),
    request.get(`/api/public/bookings/${bookingId}/manage`),
  ]);

  for (const response of responses) {
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
    expect(response.headers()['cache-control']).toContain('no-store');
  }
});
