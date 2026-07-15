import { authAdmin, authAnonymous } from './mocks/auth';
import { createOssMock, dataOss, resetConceptMocks } from './mocks/concepts';
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

  const graphTab = page.getByRole('tab', { name: 'Граф' });
  await graphTab.click();
  await expect(graphTab).toHaveAttribute('aria-selected', 'true');

  await page.goto('/oss/999999', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/отсутствует/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Библиотека' }).first()).toBeVisible();
});
