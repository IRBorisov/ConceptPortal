/// <reference types="node" />

import { defineConfig, devices } from '@playwright/test';

import { E2E_TIMEOUTS } from './tests/timeouts';

const runAllBrowsers = !!process.env.CI || process.env.PLAYWRIGHT_ALL_BROWSERS === '1';

/** Presets include `locale: en-US`, which wins over top-level `use` and yields English UI; specs assert Russian. */
const chrome = { ...devices['Desktop Chrome'], locale: 'ru-RU' as const };
const firefox = { ...devices['Desktop Firefox'], locale: 'ru-RU' as const };
const safari = { ...devices['Desktop Safari'], locale: 'ru-RU' as const };

export default defineConfig({
  testDir: 'tests',
  timeout: E2E_TIMEOUTS.test,
  expect: {
    timeout: E2E_TIMEOUTS.expect
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  /** Vite `webServer` is one process; parallel tabs cause flaky navigations, especially on WebKit in CI. */
  workers: process.env.CI ? 1 : 2,
  fullyParallel: true,
  projects: runAllBrowsers
    ? [
        { name: 'Desktop Chrome', use: chrome },
        { name: 'Desktop Firefox', use: firefox },
        { name: 'Desktop Safari', use: safari }
      ]
    : [{ name: 'Desktop Chrome', use: chrome }],
  use: {
    actionTimeout: E2E_TIMEOUTS.action,
    baseURL: 'http://localhost:3000',
    navigationTimeout: E2E_TIMEOUTS.navigation,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
