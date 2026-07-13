import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { MODEL_TOUR_ROUTES, ModelTourID } from '../editor-tours';

import { modelValueContentEn } from './content.en';
import { modelValueContentFr } from './content.fr';
import { modelValueContentRu } from './content.ru';

function openValueTab(controller: { changeTab: (tabID: number) => void }) {
  controller.changeTab(RSModelTabID.VALUE_EDIT);
}

/** Walkthrough of the model data tab (Sandbox and library models). */
export const modelValueTour: Tour = {
  id: ModelTourID.VALUE,
  version: 1,
  route: MODEL_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-data',
      placement: 'bottom',
      onEnter: openValueTab
    },
    {
      id: 'tools',
      anchor: 'model-value-tools',
      placement: 'bottom',
      onEnter: openValueTab
    },
    {
      id: 'form',
      anchor: 'model-value-form',
      placement: 'top',
      onEnter: openValueTab
    }
  ],
  content: {
    en: modelValueContentEn,
    ru: modelValueContentRu,
    fr: modelValueContentFr
  }
};
