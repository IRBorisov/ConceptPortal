import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { MODEL_TOUR_ROUTES, ModelTourID } from '../editor-tours';

import { modelEvaluatorContentEn } from './content.en';
import { modelEvaluatorContentFr } from './content.fr';
import { modelEvaluatorContentRu } from './content.ru';

function openEvaluatorTab(controller: { changeTab: (tabID: number) => void }) {
  controller.changeTab(RSModelTabID.EVALUATOR);
}

/** Walkthrough of the ad-hoc expression evaluation tab (Sandbox and library models). */
export const modelEvaluatorTour: Tour = {
  id: ModelTourID.EVALUATOR,
  version: 1,
  route: MODEL_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-evaluation',
      placement: 'bottom',
      onEnter: openEvaluatorTab
    },
    {
      id: 'tools',
      anchor: 'model-evaluator-tools',
      placement: 'bottom',
      onEnter: openEvaluatorTab
    },
    {
      id: 'form',
      anchor: 'model-evaluator-form',
      placement: 'top',
      onEnter: openEvaluatorTab
    }
  ],
  content: {
    en: modelEvaluatorContentEn,
    ru: modelEvaluatorContentRu,
    fr: modelEvaluatorContentFr
  }
};
