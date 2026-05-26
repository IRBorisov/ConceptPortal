import { AccessPolicy, LibraryItemType } from '@rsconcept/domain/library';
import { authAdmin, authAnonymous } from './mocks/auth';
import { createRSFormMock, dataRSForms, resetConceptMocks } from './mocks/concepts';
import { BACKEND_URL } from './mocks/constants';
import { dataLibraryItems } from './mocks/library';
import { expect, test } from './setup';

test.describe.configure({ mode: 'serial' });
test.setTimeout(90000);

test.beforeEach(() => {
  authAdmin();
  resetConceptMocks();
});

test.afterEach(() => {
  authAnonymous();
  resetConceptMocks();
  dataLibraryItems.splice(0, dataLibraryItems.length);
});

test('RSForm page loads and renders base tabs', async ({ page }) => {
  const rsformID = 301;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Тестовая КС'));

  await page.goto(`/rsforms/${rsformID}`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Список' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Понятие' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Граф' })).toBeVisible({ timeout: 15000 });
});

test('RSForm allows switching active tab', async ({ page }) => {
  const rsformID = 302;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'КС переключения вкладок'));

  await page.goto(`/rsforms/${rsformID}`, { waitUntil: 'domcontentloaded' });

  const graphTab = page.getByRole('tab', { name: 'Граф' });
  await graphTab.click();

  await expect(graphTab).toHaveAttribute('aria-selected', 'true');
});

test('RSForm respects tab query parameter', async ({ page }) => {
  const rsformID = 303;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'КС query tab'));

  await page.goto(`/rsforms/${rsformID}?tab=3`, { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(new RegExp(`/rsforms/${rsformID}\\?tab=3`));
});

test('RSForm keeps active query parameter in URL', async ({ page }) => {
  const rsformID = 305;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'КС query active'));

  await page.goto(`/rsforms/${rsformID}?tab=2&active=777`, { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(new RegExp(`/rsforms/${rsformID}\\?tab=2&active=777`));
});

test('RSForm opens version route when v query parameter is present', async ({ page }) => {
  const rsformID = 304;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'КС query version'));

  await page.goto(`/rsforms/${rsformID}?v=2`, { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(new RegExp(`/rsforms/${rsformID}\\?v=2`));
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible({ timeout: 15000 });
});

test('RSForm shows 404 fallback when schema is missing', async ({ page }) => {
  await page.goto('/rsforms/999999', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/отсутствует/i).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('link', { name: 'Библиотека' }).first()).toBeVisible();
});

test('RSForm menu opens create-model page with prefilled schema data', async ({ page }) => {
  const rsformID = 306;
  const schema = createRSFormMock(rsformID, 'Схема для создания модели');
  dataRSForms.set(rsformID, schema);
  dataLibraryItems.push({
    id: schema.id,
    item_type: LibraryItemType.RSFORM,
    alias: schema.alias,
    title: schema.title,
    description: schema.description,
    visible: schema.visible,
    read_only: schema.read_only,
    location: schema.location,
    access_policy: AccessPolicy.PUBLIC,
    time_create: schema.time_create,
    time_update: schema.time_update,
    owner: schema.owner
  });

  await page.goto(`/rsforms/${rsformID}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Меню' }).click();
  await page.getByRole('button', { name: 'Создать модель' }).click();

  await expect(page).toHaveURL(new RegExp(`/library/create\\?itemType=rsmodel&modelFrom=${rsformID}`));
  await expect(page.getByRole('heading', { name: 'Концептуальная модель' })).toBeVisible();
  await expect(page.locator('#schema_title')).toHaveValue(`Модель ${schema.title}`);
  await expect(page.locator('#schema_alias')).toHaveValue(`M${schema.alias}`);
});

test('RSForm flow creates model from schema and redirects to new model', async ({ page }) => {
  const rsformID = 307;
  const newModelID = 607;
  const schema = createRSFormMock(rsformID, 'Схема для мутации');
  dataRSForms.set(rsformID, schema);
  dataLibraryItems.push({
    id: schema.id,
    item_type: LibraryItemType.RSFORM,
    alias: schema.alias,
    title: schema.title,
    description: schema.description,
    visible: schema.visible,
    read_only: schema.read_only,
    location: schema.location,
    access_policy: AccessPolicy.PUBLIC,
    time_create: schema.time_create,
    time_update: schema.time_update,
    owner: schema.owner
  });
  await page.route(`${BACKEND_URL}/api/library`, async route => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      json: {
        id: newModelID,
        item_type: LibraryItemType.RSMODEL,
        alias: `M${schema.alias}`,
        title: `Модель ${schema.title}`,
        description: '',
        visible: true,
        read_only: false,
        location: schema.location,
        access_policy: AccessPolicy.PUBLIC,
        time_create: schema.time_create,
        time_update: schema.time_update,
        owner: 1
      }
    });
  });
  await page.route(`${BACKEND_URL}/api/models/${newModelID}/details`, async route => {
    await route.fulfill({
      status: 200,
      json: {
        id: newModelID,
        item_type: LibraryItemType.RSMODEL,
        alias: `M${schema.alias}`,
        title: `Модель ${schema.title}`,
        description: '',
        visible: true,
        read_only: false,
        location: schema.location,
        access_policy: AccessPolicy.PUBLIC,
        time_create: schema.time_create,
        time_update: schema.time_update,
        owner: 1,
        editors: [],
        schema: rsformID,
        items: []
      }
    });
  });

  await page.goto(`/rsforms/${rsformID}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Меню' }).click();
  await page.getByRole('button', { name: 'Создать модель' }).click();
  await page.getByRole('main').getByRole('button', { name: 'Создать', exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`/models/${newModelID}$`));
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
});

test('RSForm create-model flow shows error when API rejects creation', async ({ page }) => {
  const rsformID = 308;
  const schema = createRSFormMock(rsformID, 'Схема с ошибкой создания модели');
  dataRSForms.set(rsformID, schema);
  dataLibraryItems.push({
    id: schema.id,
    item_type: LibraryItemType.RSFORM,
    alias: schema.alias,
    title: schema.title,
    description: schema.description,
    visible: schema.visible,
    read_only: schema.read_only,
    location: schema.location,
    access_policy: AccessPolicy.PUBLIC,
    time_create: schema.time_create,
    time_update: schema.time_update,
    owner: schema.owner
  });

  await page.route(`${BACKEND_URL}/api/library`, async route => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 400,
      json: { detail: 'Создание модели запрещено для этой схемы' }
    });
  });

  await page.goto(`/rsforms/${rsformID}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Меню' }).click();
  await page.getByRole('button', { name: 'Создать модель' }).click();
  await page.getByRole('main').getByRole('button', { name: 'Создать', exact: true }).click();

  await expect(page.getByText('detail: Создание модели запрещено для этой схемы')).toBeVisible();
  await expect(page).toHaveURL(/\/library\/create/);
});

test('RSForm passport save shows error when update is rejected', async ({ page }) => {
  const rsformID = 309;
  const schema = createRSFormMock(rsformID, 'Схема с ошибкой сохранения');
  dataRSForms.set(rsformID, schema);

  await page.route(`${BACKEND_URL}/api/library/${rsformID}`, async route => {
    if (route.request().method() !== 'PATCH') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 400,
      json: { alias: 'Сокращение уже занято' }
    });
  });

  await page.goto(`/rsforms/${rsformID}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#schema_alias').fill('KS_CONFLICT');
  await page.getByRole('button', { name: 'Сохранить изменения' }).click();

  await expect(page.getByText('alias: Сокращение уже занято')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/rsforms/${rsformID}$`));
  await expect(page.locator('#schema_alias')).toHaveValue('KS_CONFLICT');
});
