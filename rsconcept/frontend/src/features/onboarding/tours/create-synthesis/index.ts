import { TOUR_ANCHOR_ATTR, type Tour } from '../../models/tour';
import { DialogTourID } from '../editor-tours';

import { createSynthesisContentEn } from './content.en';
import { createSynthesisContentFr } from './content.fr';
import { createSynthesisContentRu } from './content.ru';

/** Clicks a tab inside the create-synthesis dialog (`changeTab` only drives page routes). */
function clickSynthesisTab(index: number) {
  const tabList = document.querySelector(`[${TOUR_ANCHOR_ATTR}="synthesis-tabs"]`);
  const tab = tabList?.querySelectorAll<HTMLElement>('[role="tab"]')[index];
  tab?.click();
}

/** Walkthrough of the OSS create-synthesis dialog. */
export const createSynthesisTour: Tour = {
  id: DialogTourID.CREATE_SYNTHESIS,
  version: 2,
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
      placement: 'top',
      onEnter: () => clickSynthesisTab(0)
    },
    {
      id: 'substitutions',
      anchor: 'synthesis-substitutions',
      placement: 'top',
      onEnter: () => clickSynthesisTab(1)
    }
  ],
  content: {
    en: createSynthesisContentEn,
    ru: createSynthesisContentRu,
    fr: createSynthesisContentFr
  }
};
