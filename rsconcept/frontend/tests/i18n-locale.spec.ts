import { authAdmin, authAnonymous } from './mocks/auth';
import { expect, test } from './setup';

test.beforeEach(async ({ page }) => {
  authAdmin();
  /** Seed Russian locale only on the first document load in this tab (not on reload). */
  await page.addInitScript(() => {
    const flag = '__portal_i18n_locale_spec_seeded';
    if (sessionStorage.getItem(flag)) {
      return;
    }
    sessionStorage.setItem(flag, '1');
    localStorage.setItem('portal.preferences', JSON.stringify({ state: { locale: 'ru' }, version: 5 }));
  });
});

test.afterEach(() => {
  authAnonymous();
});

test('user menu switches UI language to English and persists', async ({ page }) => {
  await page.goto('/library');

  await page.locator('[aria-controls="user_dropdown"]').click();
  await expect(page.getByText('Язык интерфейса')).toBeVisible();

  await page.getByTestId('locale-option-en').click();

  await page.locator('[aria-controls="user_dropdown"]').click();
  await expect(page.getByText('Interface language')).toBeVisible();

  await page.reload();
  await page.locator('[aria-controls="user_dropdown"]').click();
  await expect(page.getByText('Interface language')).toBeVisible();
});
