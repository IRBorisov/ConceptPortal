import { CstType } from '@rsconcept/domain/library';

import { authAdmin, authAnonymous } from './mocks/auth';
import {
  createCstMock,
  createRSFormMock,
  createRSModelMock,
  dataRSForms,
  dataRSModels,
  resetConceptMocks
} from './mocks/concepts';
import { expect, test } from './setup';

const scrollRange = (element: Element) => element.scrollHeight - element.clientHeight;

test.afterEach(() => {
  authAnonymous();
  resetConceptMocks();
});

test('short editor windows keep the lists and panels inside the main area', async ({ page }) => {
  authAdmin();
  const schema = createRSFormMock(701);
  schema.items = Array.from({ length: 32 }, (_, index) => createCstMock(index + 1, `X${index + 1}`, CstType.BASE));
  dataRSForms.set(schema.id, schema);
  dataRSModels.set(702, createRSModelMock(702, schema.id));
  await page.setViewportSize({ width: 1100, height: 320 });

  const main = page.getByRole('main');
  const list = page.locator('[data-tour="list-table"] .table-auto');
  for (const path of ['/rsforms/701?tab=1', '/models/702?tab=1', '/sandbox?tab=1']) {
    await page.goto(path);
    await expect(list.locator('tbody tr').first()).toBeVisible();
    await expect.poll(() => main.evaluate(scrollRange)).toBe(0);
    expect(await list.evaluate(scrollRange)).toBeGreaterThan(0);
  }

  await page.setViewportSize({ width: 1100, height: 260 });
  const sidebar = page.locator('.react-tabs__tab-panel--selected .table-auto');
  for (const path of ['/rsforms/701?tab=2', '/models/702?tab=4', '/models/702?tab=5', '/sandbox?tab=2']) {
    await page.goto(path);
    await expect(sidebar.locator('tbody tr').first()).toBeVisible();
    await expect.poll(() => main.evaluate(scrollRange)).toBe(0);
    expect(await sidebar.evaluate(scrollRange)).toBeGreaterThan(0);
    expect(
      await sidebar.evaluate(element => {
        return element.getBoundingClientRect().bottom - element.closest('main')!.getBoundingClientRect().bottom;
      })
    ).toBeLessThanOrEqual(0);
  }
});

test('navigation backgrounds fit the portal and sandbox at desktop and mobile widths', async ({ page }) => {
  authAnonymous();
  for (const width of [1275, 390]) {
    await page.setViewportSize({ width, height: 700 });
    for (const path of ['/library', '/sandbox']) {
      await page.goto(path);
      await expect(page.getByRole('navigation').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
  }
});
