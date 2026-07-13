import { type Tour } from '../../models/tour';
import { LibraryTourID } from '../editor-tours';

import { libraryIntroContentEn } from './content.en';
import { libraryIntroContentFr } from './content.fr';
import { libraryIntroContentRu } from './content.ru';

/** Guided walkthrough of the library browser. */
export const libraryIntroTour: Tour = {
  id: LibraryTourID.INTRO,
  version: 2,
  route: '/library',
  autoStart: true,
  steps: [
    { id: 'welcome' },
    {
      id: 'folders',
      anchor: 'library-folders',
      placement: 'right'
    },
    {
      id: 'location',
      anchor: 'library-location',
      placement: 'bottom'
    },
    {
      id: 'search',
      anchor: 'library-search',
      placement: 'bottom'
    },
    {
      id: 'table',
      anchor: 'library-table',
      placement: 'top'
    }
  ],
  content: {
    en: libraryIntroContentEn,
    ru: libraryIntroContentRu,
    fr: libraryIntroContentFr
  }
};
