import { type Tour } from '../../models/tour';
import { DialogTourID } from '../editor-tours';

import { createRelativizationContentEn } from './content.en';
import { createRelativizationContentFr } from './content.fr';
import { createRelativizationContentRu } from './content.ru';

export const createRelativizationTour: Tour = {
  id: DialogTourID.CREATE_RELATIVIZATION,
  version: 1,
  route: '/oss',
  autoStart: false,
  steps: [
    { id: 'source', anchor: 'relativization-source', placement: 'bottom' },
    { id: 'parameters', anchor: 'relativization-parameters', placement: 'bottom' },
    { id: 'result', anchor: 'relativization-result', placement: 'top' }
  ],
  content: {
    en: createRelativizationContentEn,
    ru: createRelativizationContentRu,
    fr: createRelativizationContentFr
  }
};
