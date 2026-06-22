const isCI = !!process.env.CI;

/** Shared Playwright timing budget for E2E. CI gets longer waits for WebKit under load. */
export const E2E_TIMEOUTS = {
  expect: isCI ? 30_000 : 15_000,
  navigation: 60_000,
  action: isCI ? 30_000 : 15_000,
  test: isCI ? 120_000 : 90_000
} as const;
