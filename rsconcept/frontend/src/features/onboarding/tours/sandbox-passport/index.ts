import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { PassportTourID } from '../editor-tours';

import { sandboxPassportContentEn } from './content.en';
import { sandboxPassportContentFr } from './content.fr';
import { sandboxPassportContentRu } from './content.ru';

function openPassport(controller: { changeTab: (tabID: number) => void }) {
  controller.changeTab(RSModelTabID.CARD);
}

/**
 * Slim Sandbox passport tour: local title/alias/description + model stats.
 * Library access/ownership/versioning are covered by schema/model passport tours.
 */
export const sandboxPassportTour: Tour = {
  id: PassportTourID.SANDBOX,
  version: 1,
  route: '/sandbox',
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
      id: 'stats',
      anchor: 'passport-stats',
      placement: 'left',
      onEnter: openPassport
    }
  ],
  content: {
    en: sandboxPassportContentEn,
    ru: sandboxPassportContentRu,
    fr: sandboxPassportContentFr
  }
};
