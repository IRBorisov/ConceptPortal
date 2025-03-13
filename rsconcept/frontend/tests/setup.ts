import { test as base } from '@playwright/test';

import { setupAuth } from './mocks/auth';
import { setupLibrary } from './mocks/library';
import { setupUsers } from './mocks/users';
export { expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await setupAuth(page);
    await setupUsers(page);
    await setupLibrary(page);

    await use(page);
  }
});
