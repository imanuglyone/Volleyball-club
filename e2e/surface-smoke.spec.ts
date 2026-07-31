import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/schedule'];
const miniAppRoutes = ['/app', '/app/schedule', '/app/bookings', '/app/profile'];

test.beforeEach(async ({ page }) => {
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    }),
  );
});

for (const route of [...publicRoutes, ...miniAppRoutes]) {
  test(`${route} renders without critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(horizontalOverflow).toBe(false);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    const blocking = results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? ''),
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test('legacy personal routes move to the Mini App namespace', async ({ page }) => {
  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/app\/bookings$/);

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/app\/profile$/);
});

test('public pages do not expose participant phone links', async ({ page }) => {
  await page.goto('/schedule');
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
});

test('reduced motion keeps the public hero usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.locator('video[autoplay]')).toHaveCount(0);
});
