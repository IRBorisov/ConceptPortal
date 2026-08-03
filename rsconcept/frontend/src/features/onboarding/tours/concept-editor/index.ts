import { RSModelTabID } from '@/app/navigation/navigation-context';
import { useAIStore } from '@/features/ai/stores/ai-context';

import { type Tour, type TourStepController } from '../../models/tour';
import { EDITOR_TOUR_ROUTES, EditorTourID, SANDBOX_TOUR_CST_ID } from '../editor-tours';

import { conceptEditorContentEn } from './content.en';
import { conceptEditorContentFr } from './content.fr';
import { conceptEditorContentRu } from './content.ru';
import { resolveExpressionEditorTarget } from './resolve-expression-editor-target';

/**
 * Opens the concept tab and, while the tour is running, selects a constituenta
 * whose form mounts expression-editor anchors (`concept-check` / `concept-tools`).
 * Selection changes happen only here — not in the editor component itself.
 */
function openConceptEditor(controller: TourStepController) {
  controller.changeTab(RSModelTabID.CST_EDIT);

  // Sandbox starter data has a stable demo constituent.
  if (controller.pathname === '/sandbox') {
    controller.gotoEditActive(SANDBOX_TOUR_CST_ID);
    return;
  }

  // Schema/model pages sync the open schema into the AI context store.
  const { schema, constituenta } = useAIStore.getState();
  const targetID = resolveExpressionEditorTarget(
    schema
      ? {
          items: schema.items,
          active: constituenta
        }
      : null
  );
  if (targetID != null) {
    controller.gotoEditActive(targetID);
  }
}

/** Detailed walkthrough of the concept editor tab (Sandbox, schema, and model). */
export const conceptEditorTour: Tour = {
  id: EditorTourID.CONCEPT_EDITOR,
  version: 4,
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
      id: 'fields',
      anchor: 'concept-form',
      placement: 'right',
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
    }
  ],
  content: {
    en: conceptEditorContentEn,
    ru: conceptEditorContentRu,
    fr: conceptEditorContentFr
  }
};
