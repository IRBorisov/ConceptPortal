import { expect, test } from './setup';

const ONBOARDING_KEY = 'portal.onboarding';

function seedTourState(status: 'skipped' | 'done') {
  return {
    state: { tours: { 'sandbox-intro': { status, seenVersion: 6, resumeStep: 0 } } },
    version: 1
  };
}

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  // Clear once per tab; sessionStorage survives reload so completed/skipped state can persist.
  await page.addInitScript(() => {
    const flag = 'portal.onboarding.e2e-cleared';
    if (!sessionStorage.getItem(flag)) {
      localStorage.removeItem('portal.onboarding');
      sessionStorage.setItem(flag, '1');
    }
  });
});

test('first sandbox visit offers the tour and Start walks across tabs', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Добро пожаловать в Песочницу');
  await expect(card.getByRole('img', { name: 'Шаг 1 из 8' })).toBeVisible();

  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toContainText('Паспорт');
  await expect(page).toHaveURL(/tab=0/);

  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toContainText('Список конституент');
  await expect(page).toHaveURL(/tab=1/);
  await expect(card.getByRole('button', { name: 'Подробнее' })).toBeVisible();

  await card.getByRole('button', { name: 'Назад' }).click();
  await expect(card).toContainText('Паспорт');
  await expect(page).toHaveURL(/tab=0/);
});

test('Explore opens a shared list subtour and Done returns to the parent step', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toContainText('Список конституент');

  await card.getByRole('button', { name: 'Подробнее' }).click();
  await expect(card.getByRole('img', { name: 'Шаг 1 из 3' })).toBeVisible();
  await expect(card).toContainText('Список конституент');

  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card.getByRole('img', { name: 'Шаг 2 из 3' })).toBeVisible();
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card.getByRole('img', { name: 'Шаг 3 из 3' })).toBeVisible();
  await card.getByRole('button', { name: 'Завершить' }).click();

  await expect(card).toContainText('Список конституент');
  await expect(card.getByRole('img', { name: 'Шаг 3 из 8' })).toBeVisible();
  await expect(card.getByRole('button', { name: 'Подробнее' })).toBeVisible();
});

test('completing the tour persists done status and prevents re-offer', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  for (let step = 2; step <= 7; ++step) {
    await expect(card.getByRole('img', { name: `Шаг ${step} из 8` })).toBeVisible();
    await card.getByRole('button', { name: 'Далее' }).click();
  }
  await expect(card.getByRole('img', { name: 'Шаг 8 из 8' })).toBeVisible();
  await card.getByRole('button', { name: 'Завершить' }).click();
  await expect(card).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted).toContain('"status":"done"');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByTestId('tour-card')).toBeHidden();
});

test('skipping the tour persists and prevents re-offer after reload', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Пропустить' }).click();
  await expect(card).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted).toContain('"status":"skipped"');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByTestId('tour-card')).toBeHidden();
});

test('Escape dismisses the tour and saves the resume point', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toContainText('Паспорт');

  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted).toContain('"status":"pending"');
  expect(persisted).toContain('"resumeStep":1');

  await page.reload({ waitUntil: 'domcontentloaded' });
  const resumedCard = page.getByTestId('tour-card');
  await expect(resumedCard).toBeVisible();
  await expect(resumedCard).toContainText('Паспорт');
  await expect(resumedCard.getByRole('img', { name: 'Шаг 2 из 8' })).toBeVisible();
});

test('users with completed tour never see it, and can restart from the menu', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.getByRole('button', { name: 'Меню' }).click();
  await page.getByRole('button', { name: 'Запустить интерактивное обучение' }).click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Добро пожаловать в Песочницу');
});

test('help badge starts the shared list tour from the list tab', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox?tab=1', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Список' })).toBeVisible();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.locator('#help-ui-rsmodel-list').getByRole('button', { name: 'Показать обучение' }).click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await expect(card.getByRole('img', { name: 'Шаг 1 из 3' })).toBeVisible();
  await expect(card).toContainText('Список конституент');
});

test('library help badge starts the library tour', async ({ page }) => {
  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.locator('#help-ui-library').getByRole('button', { name: 'Показать обучение' }).click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Библиотека');
  await expect(card.getByRole('img', { name: 'Шаг 1 из 5' })).toBeVisible();
});
