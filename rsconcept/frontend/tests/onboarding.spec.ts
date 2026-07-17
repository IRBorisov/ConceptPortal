import { type Page } from '@playwright/test';

import { expect, test } from './setup';

const ONBOARDING_KEY = 'portal.onboarding';

/** Accept the invitation and start/resume the offered tour. */
async function acceptTourInvitation(page: Page, action: 'start' | 'resume' = 'start') {
  const invitation = page.getByTestId('tour-invitation');
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  const label = action === 'resume' ? 'Продолжить обучение' : 'Начать обучение';
  await invitation.getByRole('button', { name: label }).click();
  await expect(page.getByTestId('tour-card')).toBeVisible();
  await expect(invitation).toBeHidden();
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

test('invitation Start opens the tour and Next/Back move across steps', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const invitation = page.getByTestId('tour-invitation');
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('tour-card')).toBeHidden();
  await expect(page.locator('#root')).not.toHaveAttribute('inert');

  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await expect(card).toHaveAttribute('data-tour-step', '1/8');

  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/8');
  await expect(page).toHaveURL(/tab=0/);

  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '3/8');
  await expect(page).toHaveURL(/tab=1/);

  await card.getByRole('button', { name: 'Назад' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/8');
  await expect(page).toHaveURL(/tab=0/);
});

test('completing the tour persists done status and prevents re-offer', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  for (let step = 2; step <= 7; ++step) {
    await expect(card).toHaveAttribute('data-tour-step', `${step}/8`);
    await card.getByRole('button', { name: 'Далее' }).click();
  }
  await expect(card).toHaveAttribute('data-tour-step', '8/8');
  await card.getByRole('button', { name: 'Завершить' }).click();
  await expect(card).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted).toContain('"status":"done"');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByTestId('tour-invitation')).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();
});

test('skipping the tour persists and prevents re-offer after reload', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await card.getByRole('button', { name: 'Пропустить обучение' }).click();
  await expect(card).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted).toContain('"status":"skipped"');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByTestId('tour-invitation')).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();
});

test('Not now dismisses the invitation for the session without skipping', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const invitation = page.getByTestId('tour-invitation');
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  await invitation.getByRole('button', { name: 'Не сейчас' }).click();
  await expect(invitation).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted ?? '').not.toContain('"status":"skipped"');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(invitation).toBeVisible({ timeout: 30_000 });
});

test('leaving the route pauses the tour and Resume restores the resume point', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/8');

  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tour-card')).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted).toContain('"status":"pending"');
  expect(persisted).toContain('"resumeStep":1');

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page, 'resume');
  const resumedCard = page.getByTestId('tour-card');
  await expect(resumedCard).toHaveAttribute('data-tour-step', '2/8');
});

test('Explore opens a subtour and Finish returns to the parent step', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/8');
  await expect(card.getByRole('button', { name: 'Подробнее' })).toBeVisible();

  await card.getByRole('button', { name: 'Подробнее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '1/3');

  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/3');
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '3/3');
  await card.getByRole('button', { name: 'Завершить' }).click();

  await expect(card).toHaveAttribute('data-tour-step', '2/8');
  await expect(card.getByRole('button', { name: 'Подробнее' })).toBeVisible();
});

test('pause mid-subtour resumes the child nested under the parent', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/8');
  await card.getByRole('button', { name: 'Подробнее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '1/3');
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/3');

  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page, 'resume');
  const resumedCard = page.getByTestId('tour-card');
  await expect(resumedCard).toHaveAttribute('data-tour-step', '2/3');

  await resumedCard.getByRole('button', { name: 'Далее' }).click();
  await expect(resumedCard).toHaveAttribute('data-tour-step', '3/3');
  await resumedCard.getByRole('button', { name: 'Завершить' }).click();
  await expect(resumedCard).toHaveAttribute('data-tour-step', '2/8');
});
