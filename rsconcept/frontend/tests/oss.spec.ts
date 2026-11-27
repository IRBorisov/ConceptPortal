import { CstType, OperationType } from '@rsconcept/domain/library';

import { type CreateRelativizationDTO } from '../src/features/oss/backend/types';
import { authAdmin, authAnonymous, setupAuth } from './mocks/auth';
import { createOssMock, createRSFormMock, dataOss, dataRSForms, resetConceptMocks } from './mocks/concepts';
import { waitForApiResponse, waitForAppURL } from './navigation';
import { expect, test } from './setup';

test.describe.configure({ mode: 'serial' });

test.beforeEach(() => {
  authAdmin();
  resetConceptMocks();
});

test.afterEach(() => {
  authAnonymous();
  resetConceptMocks();
});

test('OSS page loads, switches tabs, and shows 404 for missing schema', async ({ page }) => {
  const ossID = 401;
  dataOss.set(ossID, createOssMock(ossID, 'Тестовая ОСС'));

  await page.goto(`/oss/${ossID}`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Граф' })).toBeVisible();

  await page.getByRole('tab', { name: 'Паспорт' }).click();
  const contents = page.locator('#oss-stats-composition');
  await contents.getByText('Подробнее', { exact: true }).click();
  await expect(contents.getByText('Релятивизация', { exact: true })).toBeVisible();

  const attachments = page.locator('#oss-stats-schemas');
  await expect(attachments.getByRole('heading', { name: 'Прикреплённые схемы' })).toBeVisible();
  await attachments.getByText('Подробнее', { exact: true }).click();
  await expect(attachments.getByText('Релятивиз. схемы', { exact: true })).toBeVisible();

  const graphTab = page.getByRole('tab', { name: 'Граф' });
  await graphTab.click();
  await expect(graphTab).toHaveAttribute('aria-selected', 'true');

  await page.goto('/oss/999999', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/отсутствует/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Библиотека' }).first()).toBeVisible();
});

test('OSS Add offers an editable title and saves relativization without a preview', async ({ page }) => {
  const schema = createRSFormMock(402, 'Родственные отношения');
  schema.items.push({
    id: 1,
    alias: 'X1',
    convention: '',
    crucial: false,
    cst_type: CstType.BASE,
    definition_formal: '',
    typification_manual: '',
    value_is_property: false,
    definition_raw: '',
    definition_resolved: '',
    term_raw: 'индивиды',
    term_resolved: 'индивиды',
    term_forms: []
  });
  dataRSForms.set(schema.id, schema);

  const oss = createOssMock(403);
  oss.operations.push({
    id: 1,
    oss: oss.id,
    operation_type: OperationType.INPUT,
    alias: schema.alias,
    title: schema.title,
    description: '',
    parent: null,
    is_import: false,
    has_additions: true,
    result: schema.id
  });
  oss.layout.push({ nodeID: 'o1', x: 0, y: 0, width: 150, height: 40 });
  dataOss.set(oss.id, oss);

  await page.route('**/api/cctext/inflect', async route => {
    expect(route.request().postDataJSON()).toEqual({ text: 'индивиды', grams: 'gent' });
    await route.fulfill({ json: { result: 'индивидов' } });
  });

  await page.goto(`/oss/${oss.id}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('tab', { name: 'Граф' }).click();
  const add = page.getByRole('button', { name: /^Добавить/ });
  await add.click();
  await page.getByRole('button', { name: 'Релятивизация', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  await expect(dialog.getByRole('combobox', { name: 'Исходная схема' })).toBeFocused();
  await expect(dialog.locator('#help-concept-relativization')).toBeVisible();
  await dialog.getByRole('button', { name: 'Открыть варианты справки' }).click();
  await dialog.getByRole('button', { name: 'Быстрый гид' }).click();

  const sourceStep = page.getByRole('dialog', { name: 'Исходная схема' });
  await expect(sourceStep).toBeVisible();
  await sourceStep.getByRole('button', { name: 'Начать' }).click();
  await page
    .getByRole('dialog', { name: 'Релятивизируемая конституента и исключения' })
    .getByRole('button', { name: 'Далее' })
    .click();
  const resultStep = page.getByRole('dialog', { name: 'Название и результат' });
  await resultStep.getByRole('button', { name: 'Завершить' }).click();
  await expect(resultStep).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Исходная схема' }).click();
  await page.getByRole('button', { name: /^KS_402.*Родственные отношения/ }).click();
  await page.getByRole('combobox', { name: 'Фокус релятивизации' }).click();
  await page.getByRole('button', { name: /^X1.*индивиды/ }).click();

  const title = dialog.getByRole('textbox', { name: 'Название' });
  await expect(title).toHaveValue('Родственные отношения – релятивизация индивидов');
  await expect(dialog.getByRole('button', { name: 'Проверить тексты' })).toBeDisabled();
  await title.fill('Моё название');
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('РО-р');
  await expect(title).toHaveValue('Моё название');
  await expect(dialog.getByRole('button', { name: 'Проверить тексты' })).toBeEnabled();
  await dialog.getByText('Отмена', { exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(add).toBeFocused();

  await add.click();
  await page.getByRole('button', { name: 'Релятивизация', exact: true }).click();
  await dialog.getByRole('button', { name: 'Открыть варианты справки' }).click();
  await setupAuth(page.context());
  const newPage = page.context().waitForEvent('page');
  await dialog.getByRole('button', { name: 'Читать справку' }).click();
  const manual = await newPage;
  await expect(manual).toHaveURL(/\/manuals\?topic=concept-relativization$/);
  await expect(manual.getByRole('heading', { name: 'Контексты и значения' })).toBeVisible();
  await manual.close();
  await expect(dialog).toBeVisible();

  const result = createRSFormMock(404, 'Результат');
  dataRSForms.set(result.id, result);
  const created = {
    ...oss.operations[0],
    id: 2,
    operation_type: OperationType.RELATIVIZATION,
    alias: 'РО-р',
    title: result.title,
    result: result.id
  };
  const endpoint = `/api/oss/${oss.id}/create-relativization`;
  await page.route(`**${endpoint}`, route =>
    route.fulfill({
      status: 201,
      json: {
        new_operation: created.id,
        oss: {
          ...oss,
          operations: [...oss.operations, created],
          layout: [...oss.layout, { nodeID: 'o2', x: 200, y: 0, width: 150, height: 40 }],
          arguments: [{ operation: created.id, argument: oss.operations[0].id }]
        }
      }
    })
  );
  await dialog.getByRole('combobox', { name: 'Исходная схема' }).click();
  await page.getByRole('button', { name: /^KS_402.*Родственные отношения/ }).click();
  const target = dialog.getByRole('combobox', { name: 'Фокус релятивизации' });
  await expect(target).toHaveText('Фокус релятивизации');
  const context = dialog.getByRole('textbox', { name: 'Имя семейства' });
  await expect(context).toHaveValue('');
  await context.fill('группа');
  await dialog.getByRole('textbox', { name: 'Название' }).fill(result.title);
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('РО-р');
  const create = dialog.getByRole('button', { name: 'Создать без проверки' });
  const review = dialog.getByRole('button', { name: 'Проверить тексты' });
  await expect(create).toBeDisabled();
  await expect(review).toBeDisabled();
  await target.click();
  await page.getByRole('button', { name: /^X1.*индивиды/ }).click();
  await expect(create).toBeEnabled();
  await expect(review).toBeEnabled();

  const saved = waitForApiResponse(page, { url: endpoint, method: 'POST' });
  const opened = waitForAppURL(page, new RegExp(`/rsforms/${result.id}(?:[/?]|$)`));
  await create.click();
  const submission = (await saved).request().postDataJSON() as CreateRelativizationDTO;
  await opened;
  expect(submission).toMatchObject({ skip_review: true, context_name: 'группа', target: 1 });
  expect(submission).not.toHaveProperty('revision');
  await expect(dialog).toHaveCount(0);
});
