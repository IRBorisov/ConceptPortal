import { test as base } from '@playwright/test';

import { setupAuth } from './mocks/auth';
import { setupConcepts } from './mocks/concepts';
import { setupLibrary } from './mocks/library';
import { setupUsers } from './mocks/users';
export { expect } from '@playwright/test';

function seedDefaultLocale() {
  if (localStorage.getItem('portal.preferences')) {
    return;
  }
  localStorage.setItem('portal.preferences', JSON.stringify({ state: { locale: 'ru' }, version: 5 }));
}

/** API transport blocks POST/PATCH/DELETE without `csrftoken` in `document.cookie`. Real Django responses set it; Playwright route mocks do not. */
function seedE2eCsrfCookie() {
  if (document.cookie.split('; ').some(row => row.startsWith('csrftoken='))) {
    return;
  }
  document.cookie = 'csrftoken=e2e-playwright-csrf; path=/; SameSite=Lax';
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(seedDefaultLocale);
    await page.addInitScript(seedE2eCsrfCookie);
    await setupAuth(page);
    await setupUsers(page);
    await setupLibrary(page);
    await setupConcepts(page);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  }
});
