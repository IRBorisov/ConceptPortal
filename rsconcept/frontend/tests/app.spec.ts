import { expect, test } from './setup';

test('should load the homepage and display login button', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Концепт Портал');

  await page.getByRole('button', { name: 'Перейти на страницу логина' }).click();
  await expect(page.getByText('Логин или email')).toBeVisible();
});
