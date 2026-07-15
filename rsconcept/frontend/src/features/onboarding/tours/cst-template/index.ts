import { type Tour } from '../../models/tour';
import { DialogTourID, EDITOR_TOUR_ROUTES } from '../editor-tours';

import { cstTemplateContentEn } from './content.en';
import { cstTemplateContentFr } from './content.fr';
import { cstTemplateContentRu } from './content.ru';

/** Walkthrough of the create-from-template dialog. */
export const cstTemplateTour: Tour = {
  id: DialogTourID.CST_TEMPLATE,
  version: 1,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'cst-template-tabs',
      placement: 'bottom'
    },
    {
      id: 'workflow',
      anchor: 'cst-template-body',
      placement: 'top'
    },
    {
      id: 'create',
      anchor: 'cst-template-tabs',
      placement: 'bottom'
    }
  ],
  content: {
    en: cstTemplateContentEn,
    ru: cstTemplateContentRu,
    fr: cstTemplateContentFr
  }
};
