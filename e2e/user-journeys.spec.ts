import { expect, test, type Page } from '@playwright/test';

const trainingId = '00000000-0000-4000-8000-000000000101';
const bookingId = '00000000-0000-4000-8000-000000000201';

const training = {
  id: trainingId,
  date: '2099-12-29',
  start_time: '18:00:00',
  end_time: '20:00:00',
  price: 500,
  capacity: 18,
  location_name: 'Зал «Авангард»',
  address: 'Ангарск, тестовая площадка',
  remaining: 7,
  active_bookings: 11,
  is_active: true,
  public_bookings: [],
};

const profile = {
  id: '00000000-0000-4000-8000-000000000301',
  telegram_user_id: 123456789,
  display_name: 'Иван',
  phone: '+79001234567',
  phone_verified_at: '2099-12-01T10:00:00.000Z',
  created_at: '2099-12-01T10:00:00.000Z',
  updated_at: '2099-12-01T10:00:00.000Z',
};

async function installTelegram(page: Page) {
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    }),
  );
  await page.addInitScript(() => {
    const noOp = () => undefined;
    (window as typeof window & { Telegram?: unknown }).Telegram = {
      WebApp: {
        initData: 'query_id=e2e&user=%7B%22id%22%3A123456789%7D',
        ready: noOp,
        expand: noOp,
        themeParams: {},
        HapticFeedback: {
          notificationOccurred: noOp,
          impactOccurred: noOp,
        },
      },
    };
  });
}

test('web booking exposes a one-time management link and supports cancellation', async ({
  page,
}) => {
  await page.route('**/api/public/trainings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: 1, trainings: [training] }),
    }),
  );
  await page.route('**/api/public/bookings', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    expect(body).toMatchObject({
      version: 1,
      training_id: trainingId,
      consent: true,
      consent_version: '2026-07-31-v1',
    });
    expect(body.idempotency_key).toEqual(expect.any(String));
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        booking_id: bookingId,
        remaining: 6,
        manage_url: `/booking/${bookingId}#token=${'a'.repeat(64)}`,
      }),
    });
  });

  await page.goto('/');
  await page.locator('.public-schedule-state button').click();
  await expect(page.locator('.public-training-card')).toHaveCount(1);

  await page.locator('#public-booking-form input[name="name"]').fill('Иван');
  await page
    .locator('#public-booking-form input[name="phone"]')
    .fill('+7 900 123-45-67');
  await page.locator('#public-booking-form input[name="consent"]').check();
  await page.locator('#public-booking-form button[type="submit"]').click();

  const manageLink = page.locator(
    `a[href^="/booking/${bookingId}#token="]`,
  );
  await expect(manageLink).toBeVisible();

  await page.route(
    `**/api/public/bookings/${bookingId}/manage/exchange`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      }),
  );
  await page.route(
    `**/api/public/bookings/${bookingId}/manage/cancel`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ cancelled: true }),
      }),
  );
  await page.route(`**/api/public/bookings/${bookingId}/manage`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        booking: {
          id: bookingId,
          status: 'active',
          training_id: trainingId,
          training_date: training.date,
          start_time: training.start_time,
          end_time: training.end_time,
          location_name: training.location_name,
          address: training.address,
        },
      }),
    }),
  );

  await manageLink.click();
  await expect(page).toHaveURL(new RegExp(`/booking/${bookingId}$`));
  await expect(page.locator('.public-manage-card')).toBeVisible();
  await page.locator('.public-manage-card__cancel').click();
  await page.locator('.public-manage-card__confirm button').first().click();
  await expect(page.locator('.public-manage-card__status')).toContainText(
    'Запись отменена',
  );
});

test('Mini App bootstrap enables one-tap booking with consent evidence', async ({
  page,
}) => {
  await installTelegram(page);
  await page.route('**/api/mini-app/bootstrap', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile,
        next_training: training,
        active_booking: null,
        bookings: [],
        server_time: '2099-12-01T10:00:00.000Z',
      }),
    }),
  );
  await page.route(`**/api/mini-app/trainings/${trainingId}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ training }),
    }),
  );
  await page.route('**/api/mini-app/bookings', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    expect(body).toEqual({
      training_id: trainingId,
      display_name: profile.display_name,
      phone: profile.phone,
      consent: true,
      consent_version: '2026-07-31-v1',
    });
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  });

  await page.goto(`/app/trainings/${trainingId}`);
  await expect(page.locator('.booking-action button')).toBeVisible();
  await page.locator('.booking-action button').click();
  await expect(page.locator('.booking-success')).toBeVisible();
});

test('Mini App cancellation is optimistic and sends the stable booking id', async ({
  page,
}) => {
  await installTelegram(page);
  const activeBooking = {
    id: bookingId,
    training_id: trainingId,
    status: 'active',
    trainings: training,
  };
  await page.route('**/api/mini-app/bootstrap', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile,
        active_booking: activeBooking,
        bookings: [activeBooking],
        server_time: '2099-12-01T10:00:00.000Z',
      }),
    }),
  );
  await page.route('**/api/mini-app/bookings/cancel', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ booking_id: bookingId });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ cancelled: true }),
    });
  });

  await page.goto('/app/bookings');
  await expect(page.locator('.booking-card')).toHaveCount(1);
  await page.locator('.booking-card button').click();
  await page.locator('.dialog-actions button').first().click();
  await expect(page.locator('.inline-notice')).toBeVisible();
  await expect(page.locator('.booking-card')).toHaveCount(0);
});
