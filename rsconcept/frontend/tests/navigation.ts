import { type Locator, type Page, type Response } from '@playwright/test';

import { E2E_TIMEOUTS } from './timeouts';

export function waitForAppURL(page: Page, url: RegExp | string) {
  // `commit` suits SPA client-router navigations better than the default `load`.
  return page.waitForURL(url, { timeout: E2E_TIMEOUTS.navigation, waitUntil: 'commit' });
}

/** Client-router navigations are flaky on WebKit unless the URL wait races the click. */
export async function clickAndWaitForURL(page: Page, locator: Locator, url: RegExp | string) {
  await Promise.all([waitForAppURL(page, url), locator.click()]);
}

interface ApiResponseWaitOptions {
  url: string | RegExp;
  method?: string;
  ok?: boolean;
}

export function waitForApiResponse(page: Page, options: ApiResponseWaitOptions): Promise<Response> {
  const { url, method, ok = true } = options;
  return page.waitForResponse(
    response => {
      const urlMatches = typeof url === 'string' ? response.url().includes(url) : url.test(response.url());
      const methodMatches = !method || response.request().method() === method;
      const okMatches = !ok || response.ok();
      return urlMatches && methodMatches && okMatches;
    },
    { timeout: E2E_TIMEOUTS.navigation }
  );
}

/** Race submit click with API completion and client-router navigation (stable on WebKit). */
export async function submitAndWaitForURL(
  page: Page,
  locator: Locator,
  options: {
    url: RegExp | string;
    api: ApiResponseWaitOptions;
    pageApi?: ApiResponseWaitOptions;
  }
) {
  const waits: Promise<unknown>[] = [
    waitForApiResponse(page, options.api),
    waitForAppURL(page, options.url),
    locator.click()
  ];
  if (options.pageApi) {
    waits.push(waitForApiResponse(page, options.pageApi));
  }
  await Promise.all(waits);
}
