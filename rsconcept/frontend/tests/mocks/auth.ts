import { type Page } from '@playwright/test';

import { BACKEND_URL } from '../constants';

export async function authAnonymous(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/auth`, async route => {
    await route.fulfill({ json: { id: null } });
  });
}
