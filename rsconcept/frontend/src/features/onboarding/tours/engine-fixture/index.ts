import { type Tour } from '../../models/tour';

/** Internal tour definition for engine/E2E experiments; not registered in the production catalog. */
export const ENGINE_FIXTURE_TOUR_ID = 'engine-fixture';

export const engineFixtureTour: Tour = {
  id: ENGINE_FIXTURE_TOUR_ID,
  version: 1,
  route: '/sandbox',
  autoStart: false,
  steps: [
    {
      id: 'explain',
      anchor: 'tab-passport',
      mode: 'explain'
    },
    {
      id: 'interact',
      anchor: 'engine-fixture-target',
      mode: 'interact',
      completeAction: 'engine-fixture.complete'
    },
    {
      id: 'interact-fallback',
      anchor: 'engine-fixture-target',
      mode: 'interact'
    }
  ],
  content: {
    en: {
      'explain': { title: 'Explain step', body: 'Explain-only fixture step.' },
      'interact': { title: 'Interact step', body: 'Complete the fixture action.' },
      'interact-fallback': { title: 'Interact fallback', body: 'Advance manually with Next.' }
    },
    ru: {
      'explain': { title: 'Шаг объяснения', body: 'Только объяснение.' },
      'interact': { title: 'Интерактивный шаг', body: 'Выполните действие.' },
      'interact-fallback': { title: 'Интерактивный запасной', body: 'Перейдите кнопкой Далее.' }
    },
    fr: {
      'explain': { title: 'Étape explicative', body: 'Étape explicative seulement.' },
      'interact': { title: 'Étape interactive', body: 'Effectuez l’action.' },
      'interact-fallback': { title: 'Secours interactif', body: 'Avancez avec Suivant.' }
    }
  }
};
