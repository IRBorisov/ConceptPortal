import { type Page } from '@playwright/test';

import { expect, test } from './setup';

const ONBOARDING_KEY = 'portal.onboarding';

function seedTourState(status: 'skipped' | 'done', tourID = 'sandbox-intro', seenVersion = 7) {
  return {
    state: { tours: { [tourID]: { status, seenVersion, resumeStep: 0 } } },
    version: 1
  };
}

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

test('first sandbox visit shows an invitation; Start walks across tabs', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const invitation = page.getByTestId('tour-invitation');
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  await expect(invitation).toContainText('Добро пожаловать в Песочницу');
  await expect(invitation).toContainText('Тур состоит из 8 шагов и займёт не более 5 минут');
  await expect(page.getByTestId('tour-card')).toBeHidden();
  await expect(page.locator('#root')).not.toHaveAttribute('inert');

  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await expect(card).toContainText('Добро пожаловать в Песочницу');
  await expect(card).toHaveAttribute('data-tour-step', '1/8');

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
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toContainText('Список конституент');

  await card.getByRole('button', { name: 'Подробнее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '1/5');
  await expect(card).toContainText('Список конституент');

  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/5');
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '3/5');
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '4/5');
  await card.getByRole('button', { name: 'Далее' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '5/5');
  await card.getByRole('button', { name: 'Завершить' }).click();

  await expect(card).toContainText('Список конституент');
  await expect(card).toHaveAttribute('data-tour-step', '3/8');
  await expect(card.getByRole('button', { name: 'Подробнее' })).toBeVisible();
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

test('Not now and backdrop dismiss the invitation for the session without skipping', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const invitation = page.getByTestId('tour-invitation');
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('tour-invitation-backdrop')).toBeVisible();
  await invitation.getByRole('button', { name: 'Не сейчас' }).click();
  await expect(invitation).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted ?? '').not.toContain('"status":"skipped"');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('tour-invitation-backdrop').click({ position: { x: 8, y: 8 } });
  await expect(invitation).toBeHidden();
});

test('leaving the route pauses the tour and Resume restores the resume point', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toContainText('Паспорт');

  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tour-card')).toBeHidden();

  const persisted = await page.evaluate(key => localStorage.getItem(key), ONBOARDING_KEY);
  expect(persisted).toContain('"status":"pending"');
  expect(persisted).toContain('"resumeStep":1');

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await acceptTourInvitation(page, 'resume');
  const resumedCard = page.getByTestId('tour-card');
  await expect(resumedCard).toContainText('Паспорт');
  await expect(resumedCard).toHaveAttribute('data-tour-step', '2/8');
});

test('users with completed tour never see it, and can restart from the menu', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Паспорт' })).toBeVisible();
  await expect(page.getByTestId('tour-invitation')).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.getByRole('button', { name: 'Меню' }).click();
  await page.getByRole('button', { name: 'Запустить интерактивное обучение' }).click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Добро пожаловать в Песочницу');
});

test('shared list tour practices search and advances after typing', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox?tab=1', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Список' })).toBeVisible();
  await expect(page.getByTestId('tour-invitation')).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.locator('#help-ui-rsmodel-list').getByRole('button', { name: 'Открыть варианты справки' }).click();
  await page.getByRole('button', { name: 'Быстрый гид' }).click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-tour-step', '1/5');
  await expect(card).toContainText('Список конституент');

  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toHaveAttribute('data-tour-step', '2/5');
  await expect(page.locator('#root')).not.toHaveAttribute('inert');

  await page.locator('#constituents_search').fill('x');
  await expect(card).toHaveAttribute('data-tour-step', '3/5');
  await expect(card).toContainText('Счётчик выделения');
});

test('help link in a contextual tour pauses and Resume restores the step after Back', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox?tab=1', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'Список' })).toBeVisible();

  await page.locator('#help-ui-rsmodel-list').getByRole('button', { name: 'Открыть варианты справки' }).click();
  await page.getByRole('button', { name: 'Быстрый гид' }).click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Начать обучение' }).click();
  await expect(card).toContainText('Поиск');
  await expect(card).toHaveAttribute('data-tour-step', '2/5');

  await card.getByRole('link', { name: 'списку конституент' }).click();
  await expect(page).toHaveURL(/\/manuals/);
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.goBack();
  await expect(page).toHaveURL(/\/sandbox/);
  await acceptTourInvitation(page, 'resume');
  const resumedCard = page.getByTestId('tour-card');
  await expect(resumedCard).toContainText('Поиск');
  await expect(resumedCard).toHaveAttribute('data-tour-step', '2/5');
});

test('library help badge restarts the completed tour even when inline help is off', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done', 'library-intro', 2)
  ] as const);
  await page.addInitScript(() => {
    localStorage.setItem(
      'portal.preferences',
      JSON.stringify({ state: { locale: 'ru', showHelp: false }, version: 5 })
    );
  });

  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tour-invitation')).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();
  await expect(page.locator('#help-ui-library')).toBeVisible();
  await expect(
    page.locator('#help-ui-library').getByRole('button', { name: 'Открыть варианты справки' })
  ).toBeVisible();

  await page.locator('#help-ui-library').getByRole('button', { name: 'Открыть варианты справки' }).click();
  await page.getByRole('button', { name: 'Быстрый гид' }).click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Библиотека');
  await expect(card).toHaveAttribute('data-tour-step', '1/5');
});

test('coarse-pointer help activation offers guide and manual before starting a tour', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);
  await page.addInitScript(() => {
    window.matchMedia = (query: string) =>
      ({
        matches: query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false
      }) as MediaQueryList;
  });

  await page.goto('/sandbox?tab=1', { waitUntil: 'domcontentloaded' });
  await page.locator('#help-ui-rsmodel-list').getByRole('button', { name: 'Открыть варианты справки' }).click();

  const quickGuide = page.getByRole('button', { name: 'Быстрый гид' });
  const readManual = page.getByRole('button', { name: 'Читать справку' });
  await expect(quickGuide).toBeVisible();
  await expect(readManual).toBeVisible();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await quickGuide.click();
  await expect(page.getByTestId('tour-card')).toBeVisible();
});

test('narrow viewport uses bottom-sheet layout after accepting the invitation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const invitation = page.getByTestId('tour-invitation');
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  await acceptTourInvitation(page);

  const card = page.getByTestId('tour-card');
  await expect(card).toHaveAttribute('data-tour-layout', 'bottom-sheet');

  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeGreaterThan(700);
  expect(box!.x).toBeLessThanOrEqual(8);
});

test('invitation does not steal focus; tour card focuses its primary action', async ({ page }) => {
  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });

  const invitation = page.getByTestId('tour-invitation');
  await expect(invitation).toBeVisible({ timeout: 30_000 });
  const inviteStart = invitation.getByRole('button', { name: 'Начать обучение' });
  await expect(inviteStart).not.toBeFocused();

  await inviteStart.click();
  const card = page.getByTestId('tour-card');
  const startButton = card.getByRole('button', { name: 'Начать обучение' });
  await expect(startButton).toBeFocused();

  await startButton.click();
  const nextButton = card.getByRole('button', { name: 'Далее' });
  await expect(nextButton).toBeFocused();
});

test('Skip tour restores focus to the page after the tour closes', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('tour-invitation')).toBeHidden();
  await expect(page.getByTestId('tour-card')).toBeHidden();

  await page.getByRole('button', { name: 'Меню' }).click();
  const restartButton = page.getByRole('button', { name: 'Запустить интерактивное обучение' });
  await restartButton.click();
  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible();

  await card.getByRole('button', { name: 'Пропустить обучение' }).click();
  await expect(card).toBeHidden();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement)) {
          return false;
        }
        if (active === document.body) {
          return false;
        }
        return !active.closest('[data-testid="tour-layer"]');
      })
    )
    .toBe(true);
});

async function startEngineFixtureTour(page: Page, stepIndex = 1) {
  await page.evaluate(async fixtureStepIndex => {
    const tours = (await import('/src/features/onboarding/tours/index.ts')) as {
      ensureTourLoaded: (id: string) => Promise<unknown>;
    };
    const storeModule = (await import('/src/features/onboarding/stores/onboarding.ts')) as {
      useOnboardingStore: { getState: () => { startTour: (id: string, step: number) => void } };
    };
    await tours.ensureTourLoaded('engine-fixture');
    storeModule.useOnboardingStore.getState().startTour('engine-fixture', fixtureStepIndex);
  }, stepIndex);
}

async function injectEngineFixtureRegion(page: Page) {
  await page.evaluate(() => {
    const existing = document.querySelector('[data-tour="engine-fixture-target"]');
    if (existing) {
      return;
    }
    const region = document.createElement('div');
    region.setAttribute('data-tour', 'engine-fixture-target');
    region.style.cssText =
      'position:fixed;top:180px;left:40px;z-index:2;padding:12px;background:#fff;border:1px solid #888';
    region.innerHTML =
      '<button type="button" id="engine-fixture-action">Fixture action</button><input id="engine-fixture-input" aria-label="Fixture input" />';
    const outside = document.createElement('button');
    outside.type = 'button';
    outside.id = 'engine-fixture-outside';
    outside.textContent = 'Outside blocked';
    outside.style.cssText = 'position:fixed;top:40px;left:40px;z-index:2';
    document.body.append(region, outside);
  });
}

test('interact step keeps the declared region operable and blocks outside pointer targets', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await injectEngineFixtureRegion(page);
  await startEngineFixtureTour(page, 1);

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible({ timeout: 30_000 });
  await expect(card).toContainText('Интерактивный шаг');
  await expect(page.locator('#root')).not.toHaveAttribute('inert');
  await expect(page.getByTestId('tour-interact-panel-top')).toBeVisible();

  await page.getByTestId('tour-interact-panel-top').click();
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-tour-step', '2/3');

  await page.locator('#engine-fixture-action').click();
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-tour-step', '2/3');
});

test('matching onboarding action auto-advances once; Next remains a fallback', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await injectEngineFixtureRegion(page);
  await startEngineFixtureTour(page, 1);

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible({ timeout: 30_000 });

  const events: string[] = [];
  await page.exposeFunction('recordOnboardingEvent', (name: string) => {
    events.push(name);
  });
  await page.evaluate(() => {
    window.addEventListener('portal:onboarding', (event: Event) => {
      const detail = (event as CustomEvent<{ name: string }>).detail;
      (window as unknown as { recordOnboardingEvent: (name: string) => void }).recordOnboardingEvent(detail.name);
    });
  });

  await page.evaluate(async () => {
    const actions = (await import('/src/features/onboarding/models/actions.ts')) as {
      emitOnboardingAction: (id: string) => void;
    };
    actions.emitOnboardingAction('engine-fixture.complete');
    actions.emitOnboardingAction('engine-fixture.complete');
    actions.emitOnboardingAction('unrelated.action');
  });

  await expect(card).toContainText('Интерактивный запасной');
  await expect(card).toHaveAttribute('data-tour-step', '3/3');
  await expect.poll(() => events.filter(name => name === 'action_completed').length).toBe(1);

  await card.getByRole('button', { name: 'Завершить' }).click();
  await expect(card).toBeHidden();
});

test('interact keyboard focus stays in the card and declared region', async ({ page }) => {
  await page.addInitScript(([key, value]) => localStorage.setItem(key as string, JSON.stringify(value)), [
    ONBOARDING_KEY,
    seedTourState('done')
  ] as const);

  await page.goto('/sandbox', { waitUntil: 'domcontentloaded' });
  await injectEngineFixtureRegion(page);
  await startEngineFixtureTour(page, 2);

  const card = page.getByTestId('tour-card');
  await expect(card).toBeVisible({ timeout: 30_000 });
  await expect(card).toContainText('Интерактивный запасной');

  const regionInput = page.locator('#engine-fixture-input');
  await regionInput.focus();
  await expect(regionInput).toBeFocused();

  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('Tab');
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const active = document.activeElement;
          if (!(active instanceof HTMLElement)) {
            return false;
          }
          return (
            active.closest('[data-testid="tour-card"]') !== null ||
            active.closest('[data-tour="engine-fixture-target"]') !== null
          );
        })
      )
      .toBe(true);
  }

  await card.getByRole('button', { name: 'Завершить' }).click();
  await expect(card).toBeHidden();
});
