import { type Locator, type Page } from '@playwright/test';

import { E2E_TIMEOUTS } from './timeouts';

export function waitForAppURL(page: Page, url: RegExp | string) {
  return page.waitForURL(url, { timeout: E2E_TIMEOUTS.navigation });
}

/** Client-router navigations are flaky on WebKit unless the URL wait races the click. */
export async function clickAndWaitForURL(page: Page, locator: Locator, url: RegExp | string) {
  await Promise.all([waitForAppURL(page, url), locator.click()]);
}
