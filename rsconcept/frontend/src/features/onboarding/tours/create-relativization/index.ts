import { type Tour } from '../../models/tour';
import { DialogTourID, EDITOR_TOUR_ROUTES } from '../editor-tours';

import { createRelativizationContentEn } from './content.en';
import { createRelativizationContentFr } from './content.fr';
import { createRelativizationContentRu } from './content.ru';

export const createRelativizationTour: Tour = {
  id: DialogTourID.CREATE_RELATIVIZATION,
  version: 1,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    { id: 'target', anchor: 'relativization-target', placement: 'bottom' },
    { id: 'parameters', anchor: 'relativization-parameters', placement: 'bottom' },
    { id: 'result', anchor: 'relativization-result', placement: 'top' }
  ],
  content: {
    en: createRelativizationContentEn,
    ru: createRelativizationContentRu,
    fr: createRelativizationContentFr
  }
};
