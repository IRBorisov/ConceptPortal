import { defineConfig, devices } from '@playwright/test';

const runAllBrowsers = !!process.env.CI || process.env.PLAYWRIGHT_ALL_BROWSERS === '1';

/** Presets include `locale: en-US`, which wins over top-level `use` and yields English UI; specs assert Russian. */
const chrome = { ...devices['Desktop Chrome'], locale: 'ru-RU' as const };
const firefox = { ...devices['Desktop Firefox'], locale: 'ru-RU' as const };
const safari = { ...devices['Desktop Safari'], locale: 'ru-RU' as const };

export default defineConfig({
  testDir: 'tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  /** Vite `webServer` is one process; many parallel tabs cause flaky navigations and Russian copy assertions to miss. */
  workers: process.env.CI ? 2 : 2,
  fullyParallel: true,
  projects: runAllBrowsers
    ? [
        { name: 'Desktop Chrome', use: chrome },
        { name: 'Desktop Firefox', use: firefox },
        { name: 'Desktop Safari', use: safari }
      ]
    : [{ name: 'Desktop Chrome', use: chrome }],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
