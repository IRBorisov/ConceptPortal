import { CstType, OperationType } from '@rsconcept/domain/library';

import { authAdmin, authAnonymous } from './mocks/auth';
import { createOssMock, createRSFormMock, dataOss, dataRSForms, resetConceptMocks } from './mocks/concepts';
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

test('OSS Add opens relativization and offers an editable title from the genitive term', async ({ page }) => {
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
  await page.getByRole('button', { name: /^Добавить/ }).click();
  await page.getByRole('button', { name: 'Релятивизация', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  await dialog.getByRole('button', { name: 'Открыть варианты справки' }).click();
  await dialog.getByRole('button', { name: 'Быстрый гид' }).click();

  const sourceStep = page.getByRole('dialog', { name: 'Исходная схема' });
  await expect(sourceStep).toBeVisible();
  await sourceStep.getByRole('button', { name: 'Начать' }).click();
  await page
    .getByRole('dialog', { name: 'Конституента релятивизации и исключения' })
    .getByRole('button', { name: 'Далее' })
    .click();
  const resultStep = page.getByRole('dialog', { name: 'Название и результат' });
  await resultStep.getByRole('button', { name: 'Завершить' }).click();
  await expect(resultStep).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Исходная схема' }).click();
  await page.getByRole('button', { name: /^KS_402.*Родственные отношения/ }).click();
  await page.getByRole('combobox', { name: 'Конституента релятивизации' }).click();
  await page.getByRole('button', { name: /^X1.*индивиды/ }).click();

  const title = dialog.getByRole('textbox', { name: 'Название' });
  await expect(title).toHaveValue('Родственные отношения – релятивизация индивидов');
  await expect(dialog.getByRole('button', { name: 'Создать' })).toBeDisabled();
  await title.fill('Моё название');
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('РО-р');
  await expect(title).toHaveValue('Моё название');
  await expect(dialog.getByRole('button', { name: 'Создать' })).toBeEnabled();
  await dialog.getByText('Отмена', { exact: true }).click();
  await expect(dialog).toHaveCount(0);
});
