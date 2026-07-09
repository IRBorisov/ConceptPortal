import { RSTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { PassportTourID } from '../editor-tours';

import { schemaPassportContentEn } from './content.en';
import { schemaPassportContentFr } from './content.fr';
import { schemaPassportContentRu } from './content.ru';

function openPassport(controller: { changeTab: (tabID: number) => void }) {
  controller.changeTab(RSTabID.CARD);
}

/** Detailed walkthrough of the conceptual schema passport. */
export const schemaPassportTour: Tour = {
  id: PassportTourID.SCHEMA,
  version: 1,
  route: '/rsforms',
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
      id: 'versions',
      anchor: 'passport-versions',
      placement: 'left',
      onEnter: openPassport
    },
    {
      id: 'access',
      anchor: 'passport-access',
      placement: 'left',
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
    en: schemaPassportContentEn,
    ru: schemaPassportContentRu,
    fr: schemaPassportContentFr
  }
};
