import { setupLogin } from './mocks/auth';
import { expect, test } from './setup';

test('should display error message when login with wrong credentials', async ({ page }) => {
  await setupLogin(page);

  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Логин или email' }).fill('123');
  await page.getByRole('textbox', { name: 'Пароль' }).fill('123');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByText('На Портале отсутствует такое сочетание имени пользователя и пароля')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Войти' })).toBeEnabled();
});

test('should login as admin successfully', async ({ page }) => {
  await setupLogin(page);

  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Логин или email' }).fill('admin');
  await page.getByRole('textbox', { name: 'Пароль' }).fill('password');
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page.getByText('Вы вошли в систему как admin')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Войти' })).toHaveCount(0);
});
