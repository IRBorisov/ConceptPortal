import { AccessPolicy, LibraryItemType } from '@rsconcept/domain/library';

import { authAdmin, authAnonymous, authUser } from './mocks/auth';
import { BACKEND_URL } from './mocks/constants';
import { dataLibraryItems } from './mocks/library';
import { expect, test } from './setup';

function createLibraryItem(id: number, title: string) {
  return {
    id,
    item_type: LibraryItemType.RSFORM,
    alias: `KS_${id}`,
    title,
    description: `Описание ${title}`,
    visible: true,
    read_only: false,
    location: '/U',
    access_policy: AccessPolicy.PUBLIC,
    time_create: '2026-01-01T00:00:00+00:00',
    time_update: '2026-01-02T00:00:00+00:00',
    owner: 1
  };
}

test.beforeEach(() => {
  authAdmin();
  dataLibraryItems.splice(0, dataLibraryItems.length);
});

test.afterEach(() => {
  authAnonymous();
  dataLibraryItems.splice(0, dataLibraryItems.length);
});

test('library page shows empty state and create link', async ({ page }) => {
  await page.goto('/library');

  await expect(page.getByText('Список пуст')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Создать схему' })).toBeVisible();
});

test('library page renders mocked items and supports search', async ({ page }) => {
  dataLibraryItems.push(createLibraryItem(101, 'Схема тестового учета'));
  dataLibraryItems.push(createLibraryItem(102, 'Схема для фильтра'));

  await page.goto('/library');

  await expect(page.getByText('Схема тестового учета')).toBeVisible();
  await expect(page.getByText('Схема для фильтра')).toBeVisible();

  await page.locator('#library_search').fill('фильтра');

  await expect(page.getByText('Схема для фильтра')).toBeVisible();
  await expect(page.getByText('Схема тестового учета')).toHaveCount(0);
});

test('create page opens for authenticated user', async ({ page }) => {
  await page.goto('/library/create');

  await expect(page.getByRole('heading', { name: 'Концептуальная схема' })).toBeVisible();
  await expect(page.locator('#schema_title')).toBeVisible();
  await expect(page.locator('#schema_alias')).toBeVisible();
});

test('library page filters items by selected folder with subfolders toggle', async ({ page }) => {
  dataLibraryItems.push({ ...createLibraryItem(201, 'Корневая КС'), location: '/U/team' });
  dataLibraryItems.push({ ...createLibraryItem(202, 'Вложенная КС'), location: '/U/team/sub' });
  dataLibraryItems.push({ ...createLibraryItem(203, 'Другая папка'), location: '/U/other' });

  await page.addInitScript(() => {
    localStorage.setItem(
      'portal.library.search',
      JSON.stringify({
        state: { subfolders: false, location: '/U/team', selectorFilter: 'all', filterUser: null },
        version: 2
      })
    );
  });
  await page.goto('/library');

  await expect(page.getByText('Корневая КС')).toBeVisible();
  await expect(page.getByText('Вложенная КС')).toHaveCount(0);
  await expect(page.getByText('Другая папка')).toHaveCount(0);

  await page
    .locator('button[aria-label="Отображение вложенных папок"][data-tooltip-content^="Вложенные папки"]')
    .click();
  await expect(page.getByText('Вложенная КС')).toBeVisible();
});

test('library page applies visibility filter for hidden items', async ({ page }) => {
  dataLibraryItems.push(createLibraryItem(204, 'Публичная КС'));
  dataLibraryItems.push({ ...createLibraryItem(205, 'Скрытая КС'), visible: false });

  await page.goto('/library');
  await expect(page.getByText('Публичная КС')).toBeVisible();
  await expect(page.getByText('Скрытая КС')).toHaveCount(0);

  await page.getByText('Фильтр', { exact: true }).first().click();
  await page.getByRole('option', { name: 'Скрытые' }).click();

  await expect(page.getByText('Скрытая КС')).toBeVisible();
  await expect(page.getByText('Публичная КС')).toHaveCount(0);
});

test('library page uses active endpoint for regular user role', async ({ page }) => {
  authUser();
  dataLibraryItems.push(createLibraryItem(206, 'Доступная схема'));
  dataLibraryItems.push({ ...createLibraryItem(207, 'Скрытая для user'), visible: false });

  await page.route(`${BACKEND_URL}/api/library/active`, async route => {
    await route.fulfill({ json: dataLibraryItems.filter(item => item.visible) });
  });

  await page.goto('/library');

  await expect(page.getByText('Доступная схема')).toBeVisible();
  await expect(page.getByText('Скрытая для user')).toHaveCount(0);
});

test('library page renames current location and refreshes filtered items', async ({ page }) => {
  dataLibraryItems.push({ ...createLibraryItem(208, 'Схема в папке team'), location: '/U/team' });
  dataLibraryItems.push({ ...createLibraryItem(209, 'Схема в подпапке team'), location: '/U/team/sub' });

  await page.route(`${BACKEND_URL}/api/library/rename-location`, async route => {
    const body = route.request().postDataJSON() as { target: string; new_location: string };
    for (const item of dataLibraryItems) {
      if (item.location === body.target || item.location.startsWith(`${body.target}/`)) {
        item.location = item.location.replace(body.target, body.new_location);
      }
    }
    await route.fulfill({ status: 200, json: {} });
  });
  await page.addInitScript(() => {
    localStorage.setItem(
      'portal.library.search',
      JSON.stringify({
        state: { subfolders: true, location: '/U/team', selectorFilter: 'all', filterUser: null },
        version: 2
      })
    );
  });

  await page.goto('/library');
  await page.getByRole('button', { name: 'Редактирование расположения' }).click();
  await page.locator('#dlg_location').fill('team-renamed');
  await page.getByRole('button', { name: 'Переместить' }).click();

  await expect(page.getByText('Изменения сохранены')).toBeVisible();
  await expect(page.getByRole('button', { name: 'team-renamed' })).toBeVisible();
  await expect(page.getByText('Схема в папке team')).toBeVisible();
  await expect(page.getByText('Схема в подпапке team')).toBeVisible();
});
