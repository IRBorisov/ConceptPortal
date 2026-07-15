import { type Tour } from '../../models/tour';
import { DialogTourID, EDITOR_TOUR_ROUTES } from '../editor-tours';

import { formulaTreeContentEn } from './content.en';
import { formulaTreeContentFr } from './content.fr';
import { formulaTreeContentRu } from './content.ru';

/** Walkthrough of the expression parse-tree dialog (view and extract). */
export const formulaTreeTour: Tour = {
  id: DialogTourID.FORMULA_TREE,
  version: 1,
  route: EDITOR_TOUR_ROUTES,
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'ast-expression',
      placement: 'bottom'
    },
    {
      id: 'canvas',
      anchor: 'ast-canvas',
      placement: 'top'
    },
    {
      id: 'extract'
    }
  ],
  content: {
    en: formulaTreeContentEn,
    ru: formulaTreeContentRu,
    fr: formulaTreeContentFr
  }
};
