import { RSModelTabID } from '@/app/navigation/navigation-context';

import { type Tour } from '../../models/tour';
import { EditorTourID, ModelTourID, PassportTourID, SandboxTourID } from '../editor-tours';

import { sandboxIntroContentEn } from './content.en';
import { sandboxIntroContentFr } from './content.fr';
import { sandboxIntroContentRu } from './content.ru';

/** Brief Sandbox overview: tabs only; list/concept details live in shared editor subtours. */
export const sandboxIntroTour: Tour = {
  id: SandboxTourID.INTRO,
  version: 7,
  route: '/sandbox',
  autoStart: true,
  steps: [
    { id: 'welcome' },
    {
      id: 'passport',
      anchor: 'tab-passport',
      placement: 'bottom',
      subtour: PassportTourID.SANDBOX,
      onEnter: controller => controller.changeTab(RSModelTabID.CARD)
    },
    {
      id: 'list',
      anchor: 'tab-list',
      placement: 'bottom',
      subtour: EditorTourID.CONSTITUENTS_LIST,
      onEnter: controller => controller.changeTab(RSModelTabID.CST_LIST)
    },
    {
      id: 'concept',
      anchor: 'tab-concept',
      placement: 'bottom',
      subtour: EditorTourID.CONCEPT_EDITOR,
      onEnter: controller => controller.changeTab(RSModelTabID.CST_EDIT)
    },
    {
      id: 'graph',
      anchor: 'tab-graph',
      placement: 'bottom',
      subtour: EditorTourID.TERM_GRAPH,
      onEnter: controller => controller.changeTab(RSModelTabID.GRAPH)
    },
    {
      id: 'data',
      anchor: 'tab-data',
      placement: 'bottom',
      subtour: ModelTourID.VALUE,
      onEnter: controller => controller.changeTab(RSModelTabID.VALUE_EDIT)
    },
    {
      id: 'evaluation',
      anchor: 'tab-evaluation',
      placement: 'bottom',
      subtour: ModelTourID.EVALUATOR,
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
