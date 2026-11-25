import { CstType } from '@rsconcept/domain/library';

import { type CreateRSFormFromSandboxDTO } from '../src/features/library/backend/types';
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

test('opens relativization help from the schema dialog and links to the glossary', async ({ page }) => {
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
  await expect(manual.getByRole('heading', { name: 'Контексты и значения' })).toBeVisible();
  await manual.getByRole('link', { name: 'глоссарий', exact: true }).click();
  await expect(manual.getByText(/Дерелятивизатор — функция извлечения/)).toBeVisible();
  await manual.close();
  await expect(dialog).toBeVisible();
  await expect(alias).toHaveValue('VerticesByContext');
});

test('relativizes a schema from its editing menu and keeps reviewed text after a rejected save', async ({ page }) => {
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
  const endpoint = `${BACKEND_URL}/api/rsforms/create-from-sandbox`;
  const submissions: CreateRSFormFromSandboxDTO[] = [];
  await page.route(endpoint, async route => {
    submissions.push(route.request().postDataJSON() as CreateRSFormFromSandboxDTO);
    if (submissions.length === 1) {
      await route.fulfill({ status: 409, json: { detail: 'Повторите запись.' } });
      return;
    }
    await route.fulfill({
      status: 201,
      json: {
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
      }
    });
  });

  await page.goto(`/rsforms/${source.id}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Редактирование' }).click();
  await page.getByRole('button', { name: 'Создать самостоятельную КС релятивизацией' }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  await dialog.locator('#relativization_target').click();
  await page.getByRole('button', { name: /^X1.*Вершины/ }).click();
  await dialog.getByLabel('Сокращение').fill('Relative');
  await dialog.getByRole('button', { name: 'Проверить тексты' }).click();

  const axis = dialog.locator('details').filter({ hasText: 'X1 → S1' });
  const confirm = dialog.getByRole('button', { name: 'Подтвердить тексты и создать КС' });
  await expect(confirm).toBeDisabled();
  await dialog.locator('summary').filter({ hasText: 'X1 → X1' }).click();
  await axis.locator('summary').click();
  const edited = 'Согласованный текст контекста.';
  const convention = axis.getByLabel('Конвенция');
  await convention.fill(edited);
  await expect(confirm).toBeEnabled();
  const rejected = waitForApiResponse(page, { url: endpoint, method: 'POST', ok: false });
  await confirm.click();
  expect((await rejected).status()).toBe(409);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('alert')).toHaveText('Повторите запись.');
  await expect(convention).toHaveValue(edited);

  const saved = waitForApiResponse(page, { url: endpoint, method: 'POST' });
  const opened = waitForAppURL(page, new RegExp(`/rsforms/${result.id}(?:[/?]|$)`));
  await confirm.click();
  await Promise.all([saved, opened]);
  expect(submissions).toHaveLength(2);
  expect(submissions[1].schema_data.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ alias: 'S1', definition_formal: 'ℬℬ(X1)', convention: edited }),
      expect.objectContaining({ alias: 'D1', definition_formal: 'I{(c, v) | c:∈S1; v:=c}' })
    ])
  );
});
