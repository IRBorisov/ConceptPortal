import { type Tour } from '../../models/tour';
import { DialogTourID } from '../editor-tours';

import { relocateCstContentEn } from './content.en';
import { relocateCstContentFr } from './content.fr';
import { relocateCstContentRu } from './content.ru';

/** Walkthrough of the OSS relocate-constituents dialog. */
export const relocateCstTour: Tour = {
  id: DialogTourID.RELOCATE_CST,
  version: 1,
  route: '/oss',
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'relocate-routing',
      placement: 'bottom'
    },
    {
      id: 'selection',
      anchor: 'relocate-list',
      placement: 'top'
    }
  ],
  content: {
    en: relocateCstContentEn,
    ru: relocateCstContentRu,
    fr: relocateCstContentFr
  }
};
