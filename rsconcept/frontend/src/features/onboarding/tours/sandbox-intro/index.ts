import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';

import { sandboxIntroContentEn } from './content.en';
import { sandboxIntroContentFr } from './content.fr';
import { sandboxIntroContentRu } from './content.ru';

export const sandboxIntroTour: Tour = {
  id: 'sandbox-intro',
  version: 1,
  route: '/sandbox',
  autoStart: true,
  steps: [
    { id: 'welcome' },
    {
      id: 'passport',
      anchor: 'sandbox-tab-passport',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CARD)
    },
    {
      id: 'list',
      anchor: 'sandbox-tab-list',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'concept',
      anchor: 'sandbox-tab-concept',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_EDIT)
    },
    {
      id: 'graph',
      anchor: 'sandbox-tab-graph',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.GRAPH)
    },
    {
      id: 'data',
      anchor: 'sandbox-tab-data',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.VALUE_EDIT)
    },
    {
      id: 'evaluation',
      anchor: 'sandbox-tab-evaluation',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.EVALUATOR)
    },
    { id: 'finish' }
  ],
  content: {
    en: sandboxIntroContentEn,
    ru: sandboxIntroContentRu,
    fr: sandboxIntroContentFr
  }
};
