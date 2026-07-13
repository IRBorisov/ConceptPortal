import { OssTabID } from '@/app/navigation/navigation-context';

import { type Tour, type TourStepController } from '../../models/tour';
import { OssTourID } from '../editor-tours';

import { ossGraphContentEn } from './content.en';
import { ossGraphContentFr } from './content.fr';
import { ossGraphContentRu } from './content.ru';

function openGraphTab(controller: TourStepController) {
  controller.changeTab(OssTabID.GRAPH);
}

/** Walkthrough of the OSS operations graph and contents sidebar. */
export const ossGraphTour: Tour = {
  id: OssTourID.GRAPH,
  version: 1,
  route: '/oss',
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-graph',
      placement: 'bottom',
      onEnter: openGraphTab
    },
    {
      id: 'view',
      anchor: 'oss-graph-tools',
      placement: 'bottom',
      onEnter: openGraphTab
    },
    {
      id: 'edit',
      anchor: 'oss-graph-edit',
      placement: 'bottom',
      onEnter: openGraphTab
    },
    {
      id: 'canvas',
      anchor: 'oss-graph-canvas',
      placement: 'top',
      onEnter: openGraphTab
    },
    {
      id: 'sidebar',
      anchor: 'oss-sidebar-toggle',
      placement: 'bottom',
      onEnter: openGraphTab
    }
  ],
  content: {
    en: ossGraphContentEn,
    ru: ossGraphContentRu,
    fr: ossGraphContentFr
  }
};
