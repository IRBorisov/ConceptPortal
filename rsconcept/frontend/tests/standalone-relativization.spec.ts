import { CstType } from '@rsconcept/domain/library';

import { type CreateRSFormFromSandboxDTO } from '../src/features/library/backend/types';
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
  await expect(manual.getByText('Дерелятивизатор', { exact: true })).toBeVisible();
  await manual.close();
  await expect(dialog).toBeVisible();
  await expect(alias).toHaveValue('VerticesByContext');
});

test('offers French proposals for a French source in the Russian interface', async ({ page }) => {
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
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('GrapheContexte');
  await dialog.getByRole('button', { name: 'Проверить тексты' }).press('Enter');
  await expect(dialog.getByRole('heading', { name: 'Проверка текстов' })).toBeFocused();

  const axis = dialog.locator('details').filter({ hasText: 'X1 → S1' });
  await axis.locator(':scope > summary').press('Enter');
  const term = axis.getByRole('textbox', { name: 'Термин', exact: true });
  await expect(term).toHaveValue('contextes admissibles');
  await expect(term).toHaveAttribute('lang', 'fr');
  await page.setViewportSize({ width: 360, height: 640 });
  const original = axis.getByText('sommets', { exact: true });
  await expect
    .poll(async () => {
      const before = await original.boundingBox();
      const after = await term.boundingBox();
      return before !== null && after !== null && after.y >= before.y + before.height;
    })
    .toBe(true);
  await expect(dialog).toBeInViewport({ ratio: 1 });
  await dialog.getByRole('button', { name: 'К параметрам' }).press('Enter');
  const target = dialog.getByRole('combobox', { name: 'Фокус релятивизации' });
  await expect(target).toBeFocused();
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
  const endpoint = `${BACKEND_URL}/api/rsforms/create-from-sandbox`;
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
  const create = dialog.getByRole('button', { name: 'Создать без проверки' });
  const review = dialog.getByRole('button', { name: 'Проверить тексты' });
  const target = dialog.getByRole('combobox', { name: 'Фокус релятивизации' });
  await expect(target).toBeFocused();
  await expect(target).toHaveText('Фокус релятивизации');
  await dialog.getByRole('textbox', { name: 'Название' }).fill(result.title);
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('Relative');
  await expect(create).toBeDisabled();
  await expect(review).toBeDisabled();
  await target.press('Enter');
  await page.getByRole('button', { name: /^X1/ }).click();
  await expect(dialog.getByRole('textbox', { name: 'Имя семейства' })).toHaveValue('');
  await expect(create).toBeEnabled();
  await expect(review).toBeEnabled();
  await expect(create).toBeInViewport();
  await expect(review).toBeInViewport();
  await expect(dialog.getByRole('button', { name: 'Отмена' })).toBeInViewport();

  const saved = waitForApiResponse(page, { url: endpoint, method: 'POST' });
  const opened = waitForAppURL(page, new RegExp(`/rsforms/${result.id}(?:[/?]|$)`));
  await create.press('Enter');
  const submission = (await saved).request().postDataJSON() as CreateRSFormFromSandboxDTO;
  await opened;
  await expect(dialog).toHaveCount(0);
  expect(submission.schema_data.items).toEqual(
    expect.arrayContaining([expect.objectContaining({ alias: 'S1', definition_formal: 'ℬℬ(X1)' })])
  );
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
    await route.fulfill({ status: 201, json: createdSchema(result) });
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
  await axis.locator(':scope > summary').click();
  const edited = 'Согласованный текст контекста.';
  const convention = axis.getByLabel('Конвенция');
  await convention.fill(edited);
  await expect(confirm).toBeEnabled();
  await dialog.getByRole('button', { name: 'К параметрам' }).click();
  await expect(dialog.getByText('Чтобы сохранить правки текстов, вернитесь к проверке.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Проверить тексты' }).click();
  await axis.locator(':scope > summary').click();
  await expect(convention).toHaveValue(edited);
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
