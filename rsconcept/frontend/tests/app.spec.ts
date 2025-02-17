import { expect, test } from '@playwright/test';

import { authAnonymous } from './mocks/auth';

test('should load the homepage and display login button', async ({ page }) => {
  await authAnonymous(page);

  await page.goto('/');
  await page.waitForSelector('.h-full > .mr-1');
  await expect(page).toHaveTitle('Концепт Портал');

  await page.click('.h-full > .mr-1');
  await expect(page.getByText('Логин или email')).toBeVisible();
});
