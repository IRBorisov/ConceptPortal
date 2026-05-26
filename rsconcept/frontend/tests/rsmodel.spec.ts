import { AccessPolicy, LibraryItemType } from '@rsconcept/domain/library';

import { authAdmin, authAnonymous } from './mocks/auth';
import { createRSFormMock, createRSModelMock, dataRSForms, dataRSModels, resetConceptMocks } from './mocks/concepts';
import { BACKEND_URL } from './mocks/constants';
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
});

test('RSModel page loads and renders model tabs', async ({ page }) => {
  const rsformID = 501;
  const modelID = 601;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Схема для модели'));
  dataRSModels.set(modelID, createRSModelMock(modelID, rsformID, 'Тестовая модель'));

  await page.goto(`/models/${modelID}`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Список' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Понятие' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Граф' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Данные' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Расчет' })).toBeVisible({ timeout: 15000 });
});

test('RSModel allows switching to data tab', async ({ page }) => {
  const rsformID = 502;
  const modelID = 602;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Схема переключения модели'));
  dataRSModels.set(modelID, createRSModelMock(modelID, rsformID, 'Модель переключения вкладок'));

  await page.goto(`/models/${modelID}`, { waitUntil: 'domcontentloaded' });

  const dataTab = page.getByRole('tab', { name: 'Данные' });
  await dataTab.click();

  await expect(dataTab).toHaveAttribute('aria-selected', 'true');
});

test('RSModel respects tab and active query parameters', async ({ page }) => {
  const rsformID = 503;
  const modelID = 603;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Схема query model'));
  dataRSModels.set(modelID, createRSModelMock(modelID, rsformID, 'Модель query tab'));

  await page.goto(`/models/${modelID}?tab=4&active=123`, { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(new RegExp(`/models/${modelID}\\?tab=4&active=123`));
});

test('RSModel shows 404 fallback when model is missing', async ({ page }) => {
  await page.goto('/models/999999', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('Концептуальная модель с указанным идентификатором отсутствует')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Библиотека' }).first()).toBeVisible();
});

test('RSModel card mutation saves model title', async ({ page }) => {
  const rsformID = 504;
  const modelID = 604;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Схема для сохранения'));
  dataRSModels.set(modelID, createRSModelMock(modelID, rsformID, 'Исходная модель'));

  await page.route(`${BACKEND_URL}/api/library/${modelID}`, async route => {
    if (route.request().method() !== 'PATCH') {
      await route.fallback();
      return;
    }
    const payload = route.request().postDataJSON() as { title: string; alias: string; description: string };
    const currentModel = dataRSModels.get(modelID);
    if (!currentModel) {
      await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      return;
    }
    const updatedModel = {
      ...currentModel,
      title: payload.title,
      alias: payload.alias,
      description: payload.description
    };
    dataRSModels.set(modelID, updatedModel);
    await route.fulfill({
      status: 200,
      json: {
        id: updatedModel.id,
        item_type: LibraryItemType.RSMODEL,
        alias: updatedModel.alias,
        title: updatedModel.title,
        description: updatedModel.description,
        visible: updatedModel.visible,
        read_only: updatedModel.read_only,
        location: updatedModel.location,
        access_policy: AccessPolicy.PUBLIC,
        time_create: updatedModel.time_create,
        time_update: updatedModel.time_update,
        owner: updatedModel.owner
      }
    });
  });

  await page.goto(`/models/${modelID}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#schema_title').fill('Модель после мутации');
  await page.getByRole('button', { name: 'Сохранить изменения' }).click();

  await expect(page.getByText('Изменения сохранены')).toBeVisible();
  await expect(page.locator('#schema_title')).toHaveValue('Модель после мутации');
});

test('RSModel menu navigates to linked schema', async ({ page }) => {
  const rsformID = 505;
  const modelID = 605;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Связанная схема'));
  dataRSModels.set(modelID, createRSModelMock(modelID, rsformID, 'Модель перехода'));

  await page.goto(`/models/${modelID}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Меню' }).click();
  await page.getByRole('button', { name: 'Перейти к схеме' }).click();

  // gotoRSForm preserves tab/active via buildModelToSchemaQuery → URL includes ?tab=…
  await expect(page).toHaveURL(new RegExp(`/rsforms/${rsformID}(?:\\?[^#]*)?$`));
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
});

test('RSModel card save shows error when update is rejected', async ({ page }) => {
  const rsformID = 506;
  const modelID = 606;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Схема для отклонённого сохранения'));
  dataRSModels.set(modelID, createRSModelMock(modelID, rsformID, 'Модель с ошибкой'));

  await page.route(`${BACKEND_URL}/api/library/${modelID}`, async route => {
    if (route.request().method() !== 'PATCH') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 400,
      json: { title: 'Недопустимое название модели' }
    });
  });

  await page.goto(`/models/${modelID}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#schema_title').fill('Запрещённое имя');
  await page.getByRole('button', { name: 'Сохранить изменения' }).click();

  await expect(page.getByText('title: Недопустимое название модели')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/models/${modelID}$`));
  await expect(page.locator('#schema_title')).toHaveValue('Запрещённое имя');
});
