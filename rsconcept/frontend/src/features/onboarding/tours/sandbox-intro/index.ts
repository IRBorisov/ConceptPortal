import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';

import { SANDBOX_TOUR_CST_ID } from './constants';
import { sandboxIntroContentEn } from './content.en';
import { sandboxIntroContentFr } from './content.fr';
import { sandboxIntroContentRu } from './content.ru';

function openConceptEditor(controller: {
  changeTab: (tabID: number) => void;
  gotoEditActive: (activeID: number) => void;
}) {
  controller.changeTab(RSModelTabID.CST_EDIT);
  controller.gotoEditActive(SANDBOX_TOUR_CST_ID);
}

export const sandboxIntroTour: Tour = {
  id: 'sandbox-intro',
  version: 3,
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
      id: 'list-filter',
      anchor: 'sandbox-list-search',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'list-interact',
      anchor: 'sandbox-list-table',
      placement: 'top',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'concept',
      anchor: 'sandbox-tab-concept',
      placement: 'bottom',
      onEnter: openConceptEditor
    },
    {
      id: 'concept-check',
      anchor: 'sandbox-concept-check',
      placement: 'bottom',
      onEnter: openConceptEditor
    },
    {
      id: 'concept-tools',
      anchor: 'sandbox-concept-tools',
      placement: 'bottom',
      onEnter: openConceptEditor
    },
    {
      id: 'concept-structure',
      anchor: 'sandbox-concept-structure',
      placement: 'bottom',
      onEnter: openConceptEditor
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
    {
      id: 'finish',
      onEnter: controller => controller.changeTab(RSModelTabID.CARD)
    }
  ],
  content: {
    en: sandboxIntroContentEn,
    ru: sandboxIntroContentRu,
    fr: sandboxIntroContentFr
  }
};
