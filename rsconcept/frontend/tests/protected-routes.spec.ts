import { authAdmin, authAnonymous } from './mocks/auth';
import { BACKEND_URL } from './mocks/constants';
import { expect, test } from './setup';

test.describe.configure({ mode: 'serial' });

test.beforeEach(() => {
  authAnonymous();
});

test.afterEach(() => {
  authAnonymous();
});

test('anonymous user is prompted to login on protected routes', async ({ page }) => {
  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    await route.fulfill({
      status: 200,
      json: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'Admin'
      }
    });
  });
  await page.route(`${BACKEND_URL}/api/prompts/available/`, async route => {
    await route.fulfill({ status: 200, json: [] });
  });

  await page.goto('/library/create');
  await expect(page.getByText('Доступно только зарегистрированным пользователям')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти в Портал' })).toBeVisible();

  await page.goto('/profile');
  await expect(page.getByText('Доступно только зарегистрированным пользователям')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Зарегистрироваться' })).toBeVisible();

  await page.goto('/prompt-templates');
  await expect(page.getByText('Доступно только зарегистрированным пользователям')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Начальная страница' })).toBeVisible();
});

test('authenticated user can open protected pages', async ({ page }) => {
  authAdmin();
  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    await route.fulfill({
      status: 200,
      json: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'Admin'
      }
    });
  });
  await page.route(`${BACKEND_URL}/api/prompts/available/`, async route => {
    await route.fulfill({
      status: 200,
      json: [
        {
          id: 11,
          owner: 1,
          label: 'Базовый шаблон',
          description: 'Тестовый шаблон',
          is_shared: false
        }
      ]
    });
  });

  await page.goto('/library/create');
  await expect(page.getByRole('heading', { name: 'Концептуальная схема' })).toBeVisible();

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Профиль пользователя' })).toBeVisible();

  await page.goto('/prompt-templates');
  await expect(page.getByRole('button', { name: 'Создать', exact: true })).toBeVisible();
  await expect(page.getByText('Базовый шаблон')).toBeVisible();
});
