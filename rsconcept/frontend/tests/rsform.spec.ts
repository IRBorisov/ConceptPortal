import { AccessPolicy, CstType, LibraryItemType } from '@rsconcept/domain/library';

import { type RSFormDTO, type UpdateConstituentaDTO } from '../src/features/rsform/backend/types';
import { authAdmin, authAnonymous } from './mocks/auth';
import { createRSFormMock, dataRSForms, resetConceptMocks } from './mocks/concepts';
import { BACKEND_URL } from './mocks/constants';
import { dataLibraryItems } from './mocks/library';
import { clickAndWaitForApi, clickAndWaitForURL, submitAndWaitForURL } from './navigation';
import { expect, test } from './setup';

test.describe.configure({ mode: 'serial' });

test.beforeEach(() => {
  authAdmin();
  resetConceptMocks();
});

test.afterEach(() => {
  authAnonymous();
  resetConceptMocks();
  dataLibraryItems.splice(0, dataLibraryItems.length);
});

test('RSForm page loads, switches tabs, and shows 404 for missing schema', async ({ page }) => {
  const rsformID = 301;
  dataRSForms.set(rsformID, createRSFormMock(rsformID, 'Тестовая КС'));

  await page.goto(`/rsforms/${rsformID}`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Список' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Понятие' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Граф' })).toBeVisible();

  const graphTab = page.getByRole('tab', { name: 'Граф' });
  await graphTab.click();
  await expect(graphTab).toHaveAttribute('aria-selected', 'true');

  await page.goto('/rsforms/999999', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/отсутствует/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Библиотека' }).first()).toBeVisible();
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
  const createModel = page.getByRole('button', { name: 'Создать модель' });
  await expect(createModel).toBeVisible();
  await clickAndWaitForURL(page, createModel, /\/library\/create/);
  await expect(page.getByRole('heading', { name: 'Концептуальная модель' })).toBeVisible();
  await expect(page.locator('#schema_title')).toHaveValue(`Модель ${schema.title}`);
  await expect(page.locator('#schema_alias')).toHaveValue(`M${schema.alias}`);
  await submitAndWaitForURL(page, page.getByRole('main').getByRole('button', { name: 'Создать', exact: true }), {
    url: new RegExp(`/models/${newModelID}$`),
    api: { url: `${BACKEND_URL}/api/library`, method: 'POST' },
    pageApi: { url: new RegExp(`${BACKEND_URL}/api/models/${newModelID}/details`), method: 'GET' }
  });
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
  const createModel = page.getByRole('button', { name: 'Создать модель' });
  await expect(createModel).toBeVisible();
  await clickAndWaitForURL(page, createModel, /\/library\/create/);
  await clickAndWaitForApi(page, page.getByRole('main').getByRole('button', { name: 'Создать', exact: true }), {
    url: `${BACKEND_URL}/api/library`,
    method: 'POST',
    ok: false
  });

  await expect(page.getByText('Создание модели запрещено для этой схемы', { exact: true })).toBeVisible();
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
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await page.locator('#schema_alias').fill('KS_CONFLICT');
  await clickAndWaitForApi(page, page.getByRole('button', { name: 'Сохранить изменения' }), {
    url: new RegExp(`${BACKEND_URL}/api/library/${rsformID}$`),
    method: 'PATCH',
    ok: false
  });

  await expect(page.getByText('alias: Сокращение уже занято')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/rsforms/${rsformID}$`));
  await expect(page.locator('#schema_alias')).toHaveValue('KS_CONFLICT');
});

function createCstMock(
  id: number,
  alias: string,
  cst_type: CstType,
  definition_formal = ''
): RSFormDTO['items'][number] {
  return {
    id,
    alias,
    cst_type,
    convention: '',
    crucial: false,
    term_raw: '',
    term_resolved: '',
    term_forms: [],
    definition_formal,
    definition_raw: '',
    definition_resolved: '',
    typification_manual: '',
    value_is_property: false
  };
}

test('RSForm keeps unsaved expression when another user saved the schema first', async ({ page }) => {
  const rsformID = 310;
  const schema = createRSFormMock(rsformID, 'Схема с параллельным редактированием');
  schema.items = [
    createCstMock(3101, 'X1', CstType.BASE),
    createCstMock(3102, 'S1', CstType.STRUCTURED, 'ℬ(X1)'),
    createCstMock(3103, 'D1', CstType.TERM, 'X1')
  ];
  dataRSForms.set(rsformID, schema);

  const patchBodies: UpdateConstituentaDTO[] = [];
  await page.route(`${BACKEND_URL}/api/rsforms/${rsformID}/update-cst`, async route => {
    const current = dataRSForms.get(rsformID)!;
    if ((await route.request().headerValue('X-Expected-Time-Update')) !== current.time_update) {
      await route.fulfill({ status: 409, json: { detail: 'Схема была изменена другим пользователем' } });
      return;
    }
    const body = route.request().postDataJSON() as UpdateConstituentaDTO;
    patchBodies.push(body);
    const updated = {
      ...current,
      time_update: '2026-01-04T00:00:00+00:00',
      items: current.items.map(cst => (cst.id === body.target ? { ...cst, ...body.item_data } : cst))
    };
    dataRSForms.set(rsformID, updated);
    await route.fulfill({ json: updated });
  });

  await page.goto(`/rsforms/${rsformID}?tab=2&active=3103`, { waitUntil: 'domcontentloaded' });
  const expression = page.locator('#cst_expression .cm-content');
  await expect(expression).toHaveText('X1');

  // Another user edits a different constituenta in the same schema.
  dataRSForms.set(rsformID, {
    ...schema,
    time_update: '2026-01-03T00:00:00+00:00',
    items: schema.items.map(cst => (cst.id === 3102 ? { ...cst, convention: 'Комментарий коллеги' } : cst))
  });

  await expression.click();
  await page.keyboard.press('End');
  await page.keyboard.insertText('∪X1');
  await expect(expression).toHaveText('X1∪X1');

  await Promise.all([
    page.waitForResponse(
      response => response.url().endsWith(`/api/rsforms/${rsformID}/update-cst`) && response.status() === 409
    ),
    page.keyboard.press('Control+s')
  ]);
  const conflictDialog = page.getByRole('alertdialog');
  await expect(conflictDialog.getByText('Элемент был изменён в другом месте')).toBeVisible();
  await conflictDialog.getByRole('button', { name: 'Закрыть' }).click();
  // The conflict refetches the newer server state; the colleague's edit shows up in the list...
  await expect(page.getByRole('cell', { name: 'Комментарий коллеги' })).toBeVisible();
  // ...while the local draft survives.
  await expect(expression).toHaveText('X1∪X1');

  const saveButton = page.getByRole('button', { name: 'Сохранить изменения' });
  await expect(saveButton).toBeEnabled();
  await clickAndWaitForApi(page, saveButton, {
    url: `${BACKEND_URL}/api/rsforms/${rsformID}/update-cst`,
    method: 'PATCH'
  });
  expect(patchBodies).toHaveLength(1);
  expect(patchBodies[0].item_data.definition_formal).toBe('X1∪X1');
  expect(dataRSForms.get(rsformID)!.items.find(cst => cst.id === 3102)!.convention).toBe('Комментарий коллеги');
  await expect(expression).toHaveText('X1∪X1');
});
