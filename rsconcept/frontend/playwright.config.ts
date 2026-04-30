import { defineConfig, devices } from '@playwright/test';

const runAllBrowsers = !!process.env.CI || process.env.PLAYWRIGHT_ALL_BROWSERS === '1';

export default defineConfig({
  testDir: 'tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  fullyParallel: true,
  projects: runAllBrowsers
    ? [
        {
          name: 'Desktop Chrome',
          use: { ...devices['Desktop Chrome'] }
        },
        {
          name: 'Desktop Firefox',
          use: { ...devices['Desktop Firefox'] }
        },
        {
          name: 'Desktop Safari',
          use: { ...devices['Desktop Safari'] }
        }
      ]
    : [
        {
          name: 'Desktop Chrome',
          use: { ...devices['Desktop Chrome'] }
        }
      ],
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
