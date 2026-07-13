import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { EDITOR_TOUR_ROUTES, EditorTourID } from '../editor-tours';

import { constituentsListContentEn } from './content.en';
import { constituentsListContentFr } from './content.fr';
import { constituentsListContentRu } from './content.ru';

/** Detailed walkthrough of the constituents list tab (Sandbox, schema, and model). */
export const constituentsListTour: Tour = {
  id: EditorTourID.CONSTITUENTS_LIST,
  version: 2,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-list',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'filter',
      anchor: 'list-search',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'selection',
      anchor: 'list-selection',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'toolbar',
      anchor: 'list-toolbar',
      placement: 'bottom',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'interact',
      anchor: 'list-table',
      placement: 'top',
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    }
  ],
  content: {
    en: constituentsListContentEn,
    ru: constituentsListContentRu,
    fr: constituentsListContentFr
  }
};
