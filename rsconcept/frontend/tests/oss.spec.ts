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

test('OSS page loads and renders base tabs', async ({ page }) => {
  const ossID = 401;
  dataOss.set(ossID, createOssMock(ossID, 'Тестовая ОСС'));

  await page.goto(`/oss/${ossID}`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Граф' })).toBeVisible();
});

test('OSS allows switching active tab', async ({ page }) => {
  const ossID = 402;
  dataOss.set(ossID, createOssMock(ossID, 'ОСС переключения вкладок'));

  await page.goto(`/oss/${ossID}`, { waitUntil: 'domcontentloaded' });

  const graphTab = page.getByRole('tab', { name: 'Граф' });
  await graphTab.click();

  await expect(graphTab).toHaveAttribute('aria-selected', 'true');
});

test('OSS respects tab query parameter', async ({ page }) => {
  const ossID = 403;
  dataOss.set(ossID, createOssMock(ossID, 'ОСС query tab'));

  await page.goto(`/oss/${ossID}?tab=1`, { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(new RegExp(`/oss/${ossID}\\?tab=1`));
});

test('OSS shows 404 fallback when schema is missing', async ({ page }) => {
  await page.goto('/oss/999999', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/отсутствует/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Библиотека' }).first()).toBeVisible();
});
