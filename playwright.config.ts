import { defineConfig, devices } from '@playwright/test';

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    colorScheme: 'dark',
    locale: 'ru-RU',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_URL: baseURL,
      MINI_APP_V2_ENABLED: 'true',
      SITE_V2_ENABLED: 'true',
      ADMIN_V2_ENABLED: 'true',
      NEXT_PUBLIC_TELEGRAM_DEV_MODE: 'true',
      ALLOW_TURNSTILE_MOCK: 'true',
      TURNSTILE_MOCK_TOKEN: 'e2e-turnstile-token',
      NEXT_PUBLIC_TURNSTILE_MOCK_TOKEN: 'e2e-turnstile-token',
    },
  },
  projects: [
    {
      name: 'mobile-390',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'mobile-375',
      use: {
        ...devices['iPhone 13 mini'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'tablet-768',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
