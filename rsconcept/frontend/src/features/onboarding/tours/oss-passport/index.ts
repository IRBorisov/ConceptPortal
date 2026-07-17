import { OssTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { PassportTourID } from '../editor-tours';

import { ossPassportContentEn } from './content.en';
import { ossPassportContentFr } from './content.fr';
import { ossPassportContentRu } from './content.ru';

function openPassport(controller: { changeTab: (tabID: number) => void }) {
  controller.changeTab(OssTabID.CARD);
}

/** Detailed walkthrough of the OSS passport. Graph details live in the separate `oss-graph` tour. */
export const ossPassportTour: Tour = {
  id: PassportTourID.OSS,
  version: 3,
  route: '/oss',
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
    en: ossPassportContentEn,
    ru: ossPassportContentRu,
    fr: ossPassportContentFr
  }
};
