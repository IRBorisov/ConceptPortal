import { type Tour } from '../../models/tour';
import { DialogTourID, EDITOR_TOUR_ROUTES } from '../editor-tours';

import { structurePlannerContentEn } from './content.en';
import { structurePlannerContentFr } from './content.fr';
import { structurePlannerContentRu } from './content.ru';

/** Walkthrough of the typification structure planner dialog. */
export const structurePlannerTour: Tour = {
  id: DialogTourID.STRUCTURE_PLANNER,
  version: 1,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'structure-planner-graph',
      placement: 'top'
    },
    {
      id: 'panel',
      anchor: 'structure-planner-panel',
      placement: 'bottom'
    }
  ],
  content: {
    en: structurePlannerContentEn,
    ru: structurePlannerContentRu,
    fr: structurePlannerContentFr
  }
};
