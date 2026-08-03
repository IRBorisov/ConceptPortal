import { OssTabID } from '@/app/navigation/navigation-context';

import { type Tour, type TourStepController } from '../../models/tour';
import { OssTourID, PassportTourID } from '../editor-tours';

import { ossGraphContentEn } from './content.en';
import { ossGraphContentFr } from './content.fr';
import { ossGraphContentRu } from './content.ru';

function openGraphTab(controller: TourStepController) {
  controller.changeTab(OssTabID.GRAPH);
}

function openGraphSidebar(controller: TourStepController) {
  controller.changeTab(OssTabID.GRAPH);
  // Lazy import: preferences persist middleware needs `localStorage` (not available in Node tour load).
  void import('@/stores/preferences').then(function ensureOssSidePanelOpen({ usePreferencesStore }) {
    const preferences = usePreferencesStore.getState();
    if (!preferences.showOssSidePanel) {
      preferences.toggleShowOssSidePanel();
    }
  });
}

/** Walkthrough of the OSS operations graph and contents sidebar. */
export const ossGraphTour: Tour = {
  id: OssTourID.GRAPH,
  version: 2,
  route: '/oss',
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-graph',
      placement: 'bottom',
      subtour: PassportTourID.OSS,
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
      onEnter: openGraphSidebar
    }
  ],
  content: {
    en: ossGraphContentEn,
    ru: ossGraphContentRu,
    fr: ossGraphContentFr
  }
};
