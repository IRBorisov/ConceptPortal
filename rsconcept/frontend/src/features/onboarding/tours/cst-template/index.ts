import { type Tour } from '../../models/tour';
import { DialogTourID, EDITOR_TOUR_ROUTES } from '../editor-tours';

import { cstTemplateContentEn } from './content.en';
import { cstTemplateContentFr } from './content.fr';
import { cstTemplateContentRu } from './content.ru';

const CstTemplateTab = {
  TEMPLATE: 0,
  ARGUMENTS: 1,
  EDITOR: 2
} as const;

/** Selects a tab inside the create-from-template dialog (page `changeTab` does not reach modal tabs). */
function selectCstTemplateTab(tabIndex: number) {
  const tabs = document.querySelectorAll<HTMLElement>('[data-tour="cst-template-tabs"] [role="tab"]');
  tabs[tabIndex]?.click();
}

/** Walkthrough of the create-from-template dialog. */
export const cstTemplateTour: Tour = {
  id: DialogTourID.CST_TEMPLATE,
  version: 2,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'cst-template-tabs',
      placement: 'bottom',
      onEnter: () => selectCstTemplateTab(CstTemplateTab.TEMPLATE)
    },
    {
      id: 'workflow',
      anchor: 'cst-template-arguments',
      placement: 'top',
      onEnter: () => selectCstTemplateTab(CstTemplateTab.ARGUMENTS)
    },
    {
      id: 'create',
      anchor: 'cst-template-editor',
      placement: 'top',
      onEnter: () => selectCstTemplateTab(CstTemplateTab.EDITOR)
    }
  ],
  content: {
    en: cstTemplateContentEn,
    ru: cstTemplateContentRu,
    fr: cstTemplateContentFr
  }
};
