import { expect, test } from '@playwright/test';

test('should load the homepage and display login button', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Концепт Портал');
  await expect(page.getByRole('heading', { name: 'Портал' })).toBeVisible();
  await page.click('.h-full > .mr-1');
  await expect(page.getByText('Логин или email')).toBeVisible();
});
