import { AccessPolicy, LibraryItemType } from '@rsconcept/domain/library';

import { authAdmin, authAnonymous } from './mocks/auth';
import { createRSFormMock, dataRSForms } from './mocks/concepts';
import { BACKEND_URL } from './mocks/constants';
import { dataLibraryItems } from './mocks/library';
import { expect, test } from './setup';

test.describe.configure({ mode: 'serial' });
test.setTimeout(90000);

function createLibraryItem(id: number, title: string, alias: string) {
  return {
    id,
    item_type: LibraryItemType.RSFORM,
    alias,
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

test('create item page applies itemType=oss from query', async ({ page }) => {
  await page.goto('/library/create?itemType=oss', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Операционная схема' })).toBeVisible({ timeout: 15000 });
});

test('create item page applies itemType=rsmodel from query', async ({ page }) => {
  await page.goto('/library/create?itemType=rsmodel', { waitUntil: 'domcontentloaded', timeout: 60000 });

  await expect(page.getByRole('heading', { name: 'Концептуальная модель' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('main').getByRole('button', { name: 'Создать', exact: true })).toBeVisible();
});

test('create item page applies modelFrom parameter and pre-fills fields', async ({ page }) => {
  dataLibraryItems.push(createLibraryItem(901, 'Базовая схема', 'KS_BASE'));

  await page.goto('/library/create?modelFrom=901', { waitUntil: 'domcontentloaded', timeout: 60000 });

  await expect(page.getByRole('heading', { name: 'Концептуальная модель' })).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#schema_title')).toHaveValue('Модель Базовая схема');
  await expect(page.locator('#schema_alias')).toHaveValue('MKS_BASE');
});

test('create item page with unknown modelFrom still opens model form', async ({ page }) => {
  await page.goto('/library/create?modelFrom=9999', { waitUntil: 'domcontentloaded', timeout: 60000 });

  await expect(page.getByRole('heading', { name: 'Концептуальная модель' })).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#schema_title')).toHaveValue('');
  await expect(page.locator('#schema_alias')).toHaveValue('');
});

test('create item page validates required fields on submit', async ({ page }) => {
  await page.goto('/library/create?itemType=oss', { waitUntil: 'domcontentloaded' });

  await page.getByRole('main').getByRole('button', { name: 'Создать', exact: true }).click();

  await expect(page.getByText('Обязательное поле')).toHaveCount(2);
});

test('create item page submits RSForm and redirects to created item', async ({ page }) => {
  const createdID = 903;
  let requestPayload: Record<string, unknown> | null = null;

  dataRSForms.set(createdID, createRSFormMock(createdID, 'Созданная КС'));
  await page.route(`${BACKEND_URL}/api/library`, async route => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    requestPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      json: createLibraryItem(createdID, 'Созданная КС', 'KS_CREATED')
    });
  });

  await page.goto('/library/create', { waitUntil: 'domcontentloaded' });
  await page.locator('#schema_title').fill('Созданная КС');
  await page.locator('#schema_alias').fill('KS_CREATED');
  await page.getByRole('main').getByRole('button', { name: 'Создать', exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`/rsforms/${createdID}$`), { timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  expect(requestPayload).toMatchObject({
    item_type: LibraryItemType.RSFORM,
    title: 'Созданная КС',
    alias: 'KS_CREATED'
  });
});

test('create item page shows server error when create request fails', async ({ page }) => {
  await page.route(`${BACKEND_URL}/api/library`, async route => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 400,
      json: {
        detail: 'Схема с таким именем уже существует'
      }
    });
  });

  await page.goto('/library/create', { waitUntil: 'domcontentloaded' });
  await page.locator('#schema_title').fill('Конфликтная КС');
  await page.locator('#schema_alias').fill('KS_CONFLICT');
  await page.getByRole('main').getByRole('button', { name: 'Создать', exact: true }).click();

  await expect(page.getByText('detail: Схема с таким именем уже существует')).toBeVisible();
  await expect(page).toHaveURL(/\/library\/create$/);
});
