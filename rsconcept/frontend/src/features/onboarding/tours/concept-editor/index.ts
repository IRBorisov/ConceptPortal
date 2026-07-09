import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour, type TourStepController } from '../../models/tour';
import { EDITOR_TOUR_ROUTES, EditorTourID, SANDBOX_TOUR_CST_ID } from '../editor-tours';

import { conceptEditorContentEn } from './content.en';
import { conceptEditorContentFr } from './content.fr';
import { conceptEditorContentRu } from './content.ru';

function openConceptEditor(controller: TourStepController) {
  controller.changeTab(RSModelTabID.CST_EDIT);
  // Sandbox starter data has a stable demo constituent; schema/model keep the current selection.
  if (controller.pathname === '/sandbox') {
    controller.gotoEditActive(SANDBOX_TOUR_CST_ID);
  }
}

/** Detailed walkthrough of the concept editor tab (Sandbox, schema, and model). */
export const conceptEditorTour: Tour = {
  id: EditorTourID.CONCEPT_EDITOR,
  version: 1,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'tab-concept',
      placement: 'bottom',
      onEnter: openConceptEditor
    },
    {
      id: 'check',
      anchor: 'concept-check',
      placement: 'bottom',
      onEnter: openConceptEditor
    },
    {
      id: 'tools',
      anchor: 'concept-tools',
      placement: 'bottom',
      onEnter: openConceptEditor
    },
    {
      id: 'structure',
      anchor: 'concept-structure',
      placement: 'bottom',
      onEnter: openConceptEditor
    }
  ],
  content: {
    en: conceptEditorContentEn,
    ru: conceptEditorContentRu,
    fr: conceptEditorContentFr
  }
};
