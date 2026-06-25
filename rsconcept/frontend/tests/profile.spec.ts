import { type UserProfile } from '../src/features/users/backend/types';
import { authAdmin, authAnonymous } from './mocks/auth';
import { BACKEND_URL } from './mocks/constants';
import { clickAndWaitForApi, waitForApiResponse } from './navigation';
import { expect, test } from './setup';

test.beforeEach(() => {
  authAdmin();
});

test.afterEach(() => {
  authAnonymous();
});

test('profile page saves name and shows success toast', async ({ page }) => {
  let profile: UserProfile = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'Admin'
  };

  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: profile });
      return;
    }
    if (route.request().method() === 'PATCH') {
      profile = { ...profile, ...(route.request().postDataJSON() as Partial<UserProfile>) };
      await route.fulfill({ json: profile });
      return;
    }
    await route.fallback();
  });

  await page.goto('/profile');

  await page.locator('#first_name').fill('НовоеИмя');
  await Promise.all([
    waitForApiResponse(page, { url: `${BACKEND_URL}/users/api/profile`, method: 'PATCH' }),
    page.getByRole('button', { name: 'Сохранить изменения' }).click()
  ]);

  await expect(page.getByText('Изменения сохранены')).toBeVisible();
  await expect(page.locator('#first_name')).toHaveValue('НовоеИмя');
});

test('profile page shows server error when email is rejected', async ({ page }) => {
  const profile: UserProfile = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'Admin'
  };

  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: profile });
      return;
    }
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 400,
        json: { email: 'Этот адрес уже используется' }
      });
      return;
    }
    await route.fallback();
  });

  await page.goto('/profile');

  await page.locator('#email').fill('taken@example.com');
  await clickAndWaitForApi(page, page.getByRole('button', { name: 'Сохранить изменения' }), {
    url: `${BACKEND_URL}/users/api/profile`,
    method: 'PATCH',
    ok: false
  });

  await expect(page.getByText('Этот адрес уже используется.')).toBeVisible();
});

test('profile page shows error when old password is wrong', async ({ page }) => {
  const profile: UserProfile = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'Admin'
  };

  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    await route.fulfill({ json: profile });
  });

  await page.route(`${BACKEND_URL}/users/api/change-password`, async route => {
    await route.fulfill({ status: 400, json: { old_password: ['Wrong password.'] } });
  });

  await page.goto('/profile');

  await page.locator('#old_password').fill('wrong');
  await page.locator('#new_password').fill('newpass1');
  await page.locator('#new_password2').fill('newpass1');
  await clickAndWaitForApi(page, page.getByRole('button', { name: 'Установить пароль' }), {
    url: `${BACKEND_URL}/users/api/change-password`,
    method: 'PATCH',
    ok: false
  });

  await expect(page.getByText('Неверный пароль')).toBeVisible();
});

test('profile page redirects to login after successful password change', async ({ page }) => {
  let afterPasswordChange = false;

  const profile: UserProfile = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'Admin'
  };

  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    await route.fulfill({ json: profile });
  });

  await page.route(`${BACKEND_URL}/users/api/change-password`, async route => {
    afterPasswordChange = true;
    await route.fulfill({ status: 200, json: {} });
  });

  await page.route(`${BACKEND_URL}/users/api/auth`, async route => {
    if (afterPasswordChange) {
      await route.fulfill({
        json: { id: null, username: '', is_staff: false, editor: [] }
      });
      return;
    }
    await route.fallback();
  });

  await page.goto('/profile');

  await page.locator('#old_password').fill('password');
  await page.locator('#new_password').fill('newpass1');
  await page.locator('#new_password2').fill('newpass1');
  await page.getByRole('button', { name: 'Установить пароль' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
});
