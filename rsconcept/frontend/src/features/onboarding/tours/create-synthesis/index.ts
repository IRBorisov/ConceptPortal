import { type Tour } from '../../models/tour';
import { DialogTourID } from '../editor-tours';

import { createSynthesisContentEn } from './content.en';
import { createSynthesisContentFr } from './content.fr';
import { createSynthesisContentRu } from './content.ru';

/** Walkthrough of the OSS create-synthesis dialog. */
export const createSynthesisTour: Tour = {
  id: DialogTourID.CREATE_SYNTHESIS,
  version: 1,
  route: '/oss',
  autoStart: false,
  steps: [
    {
      id: 'overview',
      anchor: 'synthesis-tabs',
      placement: 'bottom'
    },
    {
      id: 'arguments',
      anchor: 'synthesis-arguments',
      placement: 'top'
    },
    {
      id: 'substitutions',
      anchor: 'synthesis-tabs',
      placement: 'bottom'
    }
  ],
  content: {
    en: createSynthesisContentEn,
    ru: createSynthesisContentRu,
    fr: createSynthesisContentFr
  }
};
