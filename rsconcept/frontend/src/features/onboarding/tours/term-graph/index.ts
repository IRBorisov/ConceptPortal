import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { EDITOR_TOUR_ROUTES, EditorTourID } from '../editor-tours';

import { termGraphContentEn } from './content.en';
import { termGraphContentFr } from './content.fr';
import { termGraphContentRu } from './content.ru';

function openGraphTab(controller: { changeTab: (tabID: number) => void }) {
  controller.changeTab(RSModelTabID.GRAPH);
}

/** Detailed walkthrough of the term graph tab (Sandbox, schema, and model). */
export const termGraphTour: Tour = {
  id: EditorTourID.TERM_GRAPH,
  version: 1,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-graph',
      placement: 'bottom',
      onEnter: openGraphTab
    },
    {
      id: 'options',
      anchor: 'graph-options',
      placement: 'right',
      onEnter: openGraphTab
    },
    {
      id: 'tools',
      anchor: 'graph-tools',
      placement: 'bottom',
      onEnter: openGraphTab
    },
    {
      id: 'canvas',
      anchor: 'graph-canvas',
      placement: 'top',
      onEnter: openGraphTab
    }
  ],
  content: {
    en: termGraphContentEn,
    ru: termGraphContentRu,
    fr: termGraphContentFr
  }
};
