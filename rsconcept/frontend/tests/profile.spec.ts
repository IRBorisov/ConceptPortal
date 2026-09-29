import { type UserProfile } from '../src/features/users/backend/types';
import { authAdmin, authAnonymous, setupLogout } from './mocks/auth';
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
  const profile: UserProfile = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'Admin'
  };

  await setupLogout(page);

  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    await route.fulfill({ json: profile });
  });

  await page.route(`${BACKEND_URL}/users/api/change-password`, async route => {
    await route.fulfill({ status: 200, json: {} });
  });

  await page.goto('/profile');

  await page.locator('#old_password').fill('password');
  await page.locator('#new_password').fill('newpass1');
  await page.locator('#new_password2').fill('newpass1');
  await page.getByRole('button', { name: 'Установить пароль' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
});

test('profile tabs stay centered without shifting the page', async ({ page }) => {
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
  await page.route(`${BACKEND_URL}/api/agents/keys`, async route => {
    await route.fulfill({ json: [] });
  });
  await page.route(`${BACKEND_URL}/api/agents/logs**`, async route => {
    await route.fulfill({
      json: {
        count: 1,
        results: [
          {
            id: 1,
            api_key: 1,
            key_label: 'local',
            key_prefix: 'abcd',
            action: 'rsform.update',
            item_id: 12,
            item_alias: 'S1',
            item_title: 'Schema title that is long enough to widen a shrink-wrapped page',
            status_code: 200,
            summary: 'updated constituent definition',
            request_text: 'X1 := ' + 'very-long-token '.repeat(40),
            created_at: '2026-01-01T00:00:00Z'
          }
        ]
      }
    });
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/profile');
  await expect(page.getByRole('tab', { name: 'Аккаунт' })).toBeVisible();

  async function tabMetrics() {
    return page.evaluate(() => {
      const list = document.querySelector('[role="tablist"]');
      if (!(list instanceof HTMLElement)) {
        throw new Error('tablist missing');
      }
      const rect = list.getBoundingClientRect();
      const main = document.querySelector('main');
      const scroller = main?.parentElement;
      return {
        left: rect.left,
        center: rect.left + rect.width / 2,
        mainScroll: main instanceof HTMLElement ? main.scrollTop : 0,
        overflowX: scroller instanceof HTMLElement ? scroller.scrollWidth > scroller.clientWidth + 1 : false
      };
    });
  }

  const account = await tabMetrics();
  expect(Math.abs(account.center - 640)).toBeLessThan(2);
  expect(account.overflowX).toBe(false);

  await page.getByRole('tab', { name: 'API-ключи' }).click();
  await expect(page.getByRole('heading', { name: 'Ваши ключи' })).toBeVisible();
  const keys = await tabMetrics();

  await page.getByRole('tab', { name: 'Действия агентов' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  const activity = await tabMetrics();

  expect(Math.abs(keys.left - account.left)).toBeLessThan(1);
  expect(Math.abs(activity.left - account.left)).toBeLessThan(1);
  expect(keys.mainScroll).toBe(0);
  expect(activity.mainScroll).toBe(0);
  expect(keys.overflowX).toBe(false);
  expect(activity.overflowX).toBe(false);
});
