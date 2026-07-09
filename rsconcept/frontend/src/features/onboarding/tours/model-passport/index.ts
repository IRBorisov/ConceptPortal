import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { PassportTourID } from '../editor-tours';

import { modelPassportContentEn } from './content.en';
import { modelPassportContentFr } from './content.fr';
import { modelPassportContentRu } from './content.ru';

function openPassport(controller: { changeTab: (tabID: number) => void }) {
  controller.changeTab(RSModelTabID.CARD);
}

/** Detailed walkthrough of the conceptual model passport. */
export const modelPassportTour: Tour = {
  id: PassportTourID.MODEL,
  version: 1,
  route: '/models',
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-passport',
      placement: 'bottom',
      onEnter: openPassport
    },
    {
      id: 'form',
      anchor: 'passport-form',
      placement: 'right',
      onEnter: openPassport
    },
    {
      id: 'access',
      anchor: 'passport-access',
      placement: 'left',
      onEnter: openPassport
    },
    {
      id: 'schema',
      anchor: 'passport-schema-link',
      placement: 'top',
      onEnter: openPassport
    },
    {
      id: 'library',
      anchor: 'passport-library',
      placement: 'top',
      onEnter: openPassport
    },
    {
      id: 'stats',
      anchor: 'passport-stats',
      placement: 'left',
      onEnter: openPassport
    }
  ],
  content: {
    en: modelPassportContentEn,
    ru: modelPassportContentRu,
    fr: modelPassportContentFr
  }
};
