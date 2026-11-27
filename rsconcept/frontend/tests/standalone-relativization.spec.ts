import { CstType } from '@rsconcept/domain/library';

import {
  type CreateStandaloneRelativizationDTO,
  schemaCreateStandaloneRelativization
} from '../src/features/rsform/backend/relativization';
import { type RSFormDTO } from '../src/features/rsform/backend/types';
import { authAdmin, authAnonymous, setupAuth } from './mocks/auth';
import { createCstMock, createRSFormMock, dataRSForms, resetConceptMocks } from './mocks/concepts';
import { BACKEND_URL } from './mocks/constants';
import { waitForApiResponse, waitForAppURL } from './navigation';
import { expect, test } from './setup';

test.beforeEach(() => {
  authAdmin();
  resetConceptMocks();
});

test.afterEach(() => {
  authAnonymous();
  resetConceptMocks();
});

function createdSchema(result: RSFormDTO) {
  return {
    id: result.id,
    item_type: result.item_type,
    alias: result.alias,
    title: result.title,
    description: result.description,
    visible: result.visible,
    read_only: result.read_only,
    location: result.location,
    access_policy: result.access_policy,
    time_create: result.time_create,
    time_update: result.time_update,
    owner: result.owner
  };
}

test('keeps the relativization fields in their columns with a long selected term', async ({ page }) => {
  const source = createRSFormMock(355, 'Соседство ячеек');
  const term = 'соседство ячеек '.repeat(12).trim();
  source.items = [
    { ...createCstMock(11, 'S1', CstType.STRUCTURED), term_raw: term, term_resolved: term },
    createCstMock(12, 'X1', CstType.BASE)
  ];
  dataRSForms.set(source.id, source);

  await page.goto(`/rsforms/${source.id}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Редактирование' }).click();
  await page.getByRole('button', { name: 'Создать самостоятельную КС релятивизацией' }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  const target = dialog.getByRole('combobox', { name: 'Фокус релятивизации' });
  const context = dialog.getByRole('textbox', { name: 'Имя семейства' });
  await expect(context).toHaveValue('');
  const emptyTargetBox = (await target.boundingBox())!;
  const contextBox = (await context.boundingBox())!;

  await target.click();
  await page.getByRole('button', { name: /^S1.*соседство ячеек/ }).click();
  await expect(target).toContainText(term);
  const targetBox = (await target.boundingBox())!;
  expect(targetBox).toEqual(emptyTargetBox);
  expect(await context.boundingBox()).toEqual(contextBox);
  expect(targetBox.y).toBe(contextBox.y);
  expect(targetBox.x + targetBox.width).toBeLessThan(contextBox.x);

  await page.setViewportSize({ width: 390, height: 860 });
  await expect
    .poll(async () => {
      const targetBox = (await target.boundingBox())!;
      const contextBox = (await context.boundingBox())!;
      return targetBox.y + targetBox.height < contextBox.y && targetBox.width === contextBox.width;
    })
    .toBe(true);

  await dialog.getByText('Исключённые конституенты', { exact: true }).click();
  const exclusion = dialog.getByRole('checkbox', { name: /^X1/ });
  await expect(exclusion).not.toBeChecked();
  await exclusion.press('Space');
  await expect(exclusion).toBeChecked();
});

test('opens relativization help from the schema dialog and follows a term link', async ({ page }) => {
  const source = createRSFormMock(353, 'Вершины');
  source.items = [createCstMock(11, 'X1', CstType.BASE)];
  dataRSForms.set(source.id, source);

  await page.goto(`/rsforms/${source.id}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Редактирование' }).click();
  await page.getByRole('button', { name: 'Создать самостоятельную КС релятивизацией' }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  const alias = dialog.getByLabel('Сокращение');
  await alias.fill('VerticesByContext');
  await setupAuth(page.context());
  const newPage = page.context().waitForEvent('page');
  await dialog.locator('#help-concept-relativization').getByRole('button').click();

  const manual = await newPage;
  await expect(manual).toHaveURL(/\/manuals\?topic=concept-relativization$/);
  await expect(manual.getByRole('heading', { name: 'Релятивизация', level: 1 })).toBeVisible();
  await expect(manual.locator('a[href="/manuals?topic=thesaurus"]')).toHaveCount(0);
  await manual.locator('a[href="/manuals?topic=concept-schema"]').click();
  await expect(manual).toHaveURL(/\/manuals\?topic=concept-schema$/);
  await manual.close();
  await expect(dialog).toBeVisible();
  await expect(alias).toHaveValue('VerticesByContext');
});

test('submits the source language for a French schema in the Russian interface', async ({ page }) => {
  const source = createRSFormMock(354, 'Граф');
  source.items = [
    {
      ...createCstMock(11, 'X1', CstType.BASE),
      term_raw: 'sommets',
      term_resolved: 'sommets',
      convention: 'Ensemble des sommets qui appartiennent au graphe.'
    }
  ];
  dataRSForms.set(source.id, source);

  await page.goto(`/rsforms/${source.id}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Редактирование' }).click();
  await page.getByRole('button', { name: 'Создать самостоятельную КС релятивизацией' }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  await expect(dialog.getByRole('combobox')).toHaveCount(1);
  await dialog.getByRole('combobox', { name: 'Фокус релятивизации' }).click();
  await page.getByRole('button', { name: /^X1.*sommets/ }).click();
  const context = dialog.getByRole('textbox', { name: 'Имя семейства' });
  await expect(context).toHaveValue('');
  await expect(context).toHaveAttribute('placeholder', 'Имя семейства');
  await context.fill('contexte');
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('GrapheContexte');
  const endpoint = BACKEND_URL + '/api/rsforms/' + source.id + '/create-relativization';
  await page.route(endpoint, route => route.fulfill({ status: 400, json: { detail: 'Test validation.' } }));
  const submitted = waitForApiResponse(page, { url: endpoint, method: 'POST', ok: false });
  await dialog.getByRole('button', { name: 'Создать', exact: true }).click();
  expect((await submitted).request().postDataJSON()).toMatchObject({ locale: 'fr', context_name: 'contexte' });
  await expect(dialog.getByRole('alert')).toHaveText('Test validation.');
  const target = dialog.getByRole('combobox', { name: 'Фокус релятивизации' });
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  const cancel = dialog.getByRole('button', { name: 'Отмена' });
  await cancel.press('Tab');
  const help = dialog.locator('#help-concept-relativization').getByRole('button');
  await expect(help).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(cancel).toBeFocused();
  await target.press('Enter');
  await expect(target).toHaveAttribute('aria-expanded', 'true');
  const search = dialog.locator('[data-slot="popover-content"] input');
  await expect(search).toBeFocused();
  await expect(dialog.locator('[data-slot="command-input-wrapper"]')).toHaveCSS('outline-style', 'solid');
  await search.press('Enter');
  await expect(target).toHaveAttribute('aria-expanded', 'true');
  await search.press('Tab');
  const option = dialog.getByRole('button', { name: /^X1.*sommets/ });
  await expect(option).toBeFocused();
  await expect(option).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Escape');
  await expect(target).toBeFocused();
  await expect(target).toHaveAttribute('aria-expanded', 'false');
  await target.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Редактирование' })).toBeFocused();
});

test('uses the dialog focus when another constituent is selected in the schema', async ({ page }) => {
  const source = createRSFormMock(356, 'Вершины');
  source.items = [createCstMock(11, 'X1', CstType.BASE), createCstMock(12, 'X2', CstType.BASE)];
  const result = createRSFormMock(357, 'Релятивизированные вершины');
  dataRSForms.set(source.id, source);
  dataRSForms.set(result.id, result);
  const endpoint = `${BACKEND_URL}/api/rsforms/${source.id}/create-relativization`;
  await page.route(endpoint, route => route.fulfill({ status: 201, json: createdSchema(result) }));

  await page.goto(`/rsforms/${source.id}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('tab', { name: 'Список' }).click();
  const sourceRow = page.getByRole('row').filter({ hasText: 'X2' });
  await sourceRow.click();
  await expect(sourceRow).toHaveClass(/\bcc-selected\b/);
  await page.getByRole('button', { name: 'Редактирование' }).click();
  await page.getByRole('button', { name: 'Создать самостоятельную КС релятивизацией' }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  await page.setViewportSize({ width: 360, height: 640 });
  const create = dialog.getByRole('button', { name: 'Создать', exact: true });
  const target = dialog.getByRole('combobox', { name: 'Фокус релятивизации' });
  await expect(target).toBeFocused();
  await expect(target).toHaveText('Фокус релятивизации');
  await dialog.getByRole('textbox', { name: 'Название' }).fill(result.title);
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('Relative');
  await expect(create).toBeDisabled();
  await target.press('Enter');
  await page.getByRole('button', { name: /^X1/ }).click();
  const context = dialog.getByRole('textbox', { name: 'Имя семейства' });
  await expect(context).toHaveValue('');
  await expect(create).toBeDisabled();
  await context.fill('   ');
  await expect(create).toBeDisabled();
  await context.fill('  группа  ');
  await expect(create).toBeEnabled();
  await expect(create).toBeInViewport();
  await expect(dialog.getByRole('button', { name: 'Отмена' })).toBeInViewport();

  const saved = waitForApiResponse(page, { url: endpoint, method: 'POST' });
  const opened = waitForAppURL(page, new RegExp(`/rsforms/${result.id}(?:[/?]|$)`));
  await create.press('Enter');
  const submission = schemaCreateStandaloneRelativization.parse((await saved).request().postDataJSON());
  await opened;
  await expect(dialog).toHaveCount(0);
  expect(submission).toMatchObject({
    target: 11,
    source_time_update: source.time_update,
    context_name: 'группа'
  });
  expect(submission).not.toHaveProperty('schema_data');
});

test('relativizes a schema from its editing menu and keeps operation parameters after a rejected save', async ({
  page
}) => {
  const source = createRSFormMock(351, 'Вершины');
  source.items = [
    {
      ...createCstMock(11, 'X1', CstType.BASE),
      term_raw: 'Вершины',
      term_resolved: 'Вершины',
      convention: 'Множество всех вершин.'
    },
    createCstMock(12, 'D1', CstType.TERM, 'X1')
  ];
  const result = createRSFormMock(352, 'Релятивизированные вершины');
  dataRSForms.set(source.id, source);
  dataRSForms.set(result.id, result);
  await page.route('**/api/cctext/inflect', route => route.fulfill({ json: { result: 'вершин' } }));
  const endpoint = `${BACKEND_URL}/api/rsforms/${source.id}/create-relativization`;
  const submissions: CreateStandaloneRelativizationDTO[] = [];
  await page.route(endpoint, async route => {
    submissions.push(schemaCreateStandaloneRelativization.parse(route.request().postDataJSON()));
    if (submissions.length === 1) {
      await route.fulfill({ status: 409, json: { detail: 'Повторите запись.' } });
      return;
    }
    await route.fulfill({ status: 201, json: createdSchema(result) });
  });

  await page.goto(`/rsforms/${source.id}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Редактирование' }).click();
  await page.getByRole('button', { name: 'Создать самостоятельную КС релятивизацией' }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  await dialog.locator('#relativization_target').click();
  await page.getByRole('button', { name: /^X1.*Вершины/ }).click();
  await dialog.getByRole('textbox', { name: 'Имя семейства' }).fill('группа');
  await dialog.getByLabel('Сокращение').fill('Relative');
  const create = dialog.getByRole('button', { name: 'Создать', exact: true });
  const context = dialog.getByRole('textbox', { name: 'Имя семейства' });
  const rejected = waitForApiResponse(page, { url: endpoint, method: 'POST', ok: false });
  await create.click();
  expect((await rejected).status()).toBe(409);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('alert')).toHaveText('Повторите запись.');
  await expect(context).toHaveValue('группа');

  const saved = waitForApiResponse(page, { url: endpoint, method: 'POST' });
  const opened = waitForAppURL(page, new RegExp(`/rsforms/${result.id}(?:[/?]|$)`));
  await create.click();
  await Promise.all([saved, opened]);
  expect(submissions).toHaveLength(2);
  expect(submissions[1]).toEqual(submissions[0]);
  expect(submissions[1]).not.toHaveProperty('schema_data');
});
