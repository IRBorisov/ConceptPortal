import { HelpTopic } from '@/features/help';

import {
  IconFilterReset,
  IconFolderEdit,
  IconSearch,
  IconSortAsc,
  IconSubfolders,
  IconText
} from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const libraryIntroContentEn: Record<string, TourStepContent> = {
  welcome: {
    title: 'Library',
    body: (
      <>
        <p>
          The <TourHelpLink text='library' topic={HelpTopic.UI_LIBRARY} /> is where you browse and open conceptual
          schemas, models, and operational synthesis schemas (OSS) stored in the Portal.
        </p>
        <p>This short tour covers folders, search, and the items table.</p>
      </>
    )
  },
  folders: {
    title: 'Folders',
    body: (
      <p>
        The left panel is the explorer. Click a folder to show its items on the right. Ctrl/Cmd-click a folder to copy
        its path. Folder icons show whether a folder has items or nested folders.
      </p>
    )
  },
  location: {
    title: 'Current location',
    body: (
      <p>
        The path bar shows the current folder. Use <IconFolderEdit className='inline-icon' /> to edit the location and
        move your schemas (when allowed) and <IconSubfolders className='inline-icon' /> to include or hide items from
        nested folders.
      </p>
    )
  },
  search: {
    title: 'Search and filters',
    body: (
      <p>
        The Filter selector narrows the list (type, role, hidden…). Switch Metadata (
        <IconSearch className='inline-icon' />) and Context search (<IconText className='inline-icon' />) with the mode
        switch; optionally use Search by owner. <IconFilterReset className='inline-icon' /> resets the filter.
      </p>
    )
  },
  table: {
    title: 'Items table',
    body: (
      <>
        <p>
          Click a row to open an item. Ctrl/Cmd-click opens it in a new tab. Sort with{' '}
          <IconSortAsc className='inline-icon' /> column headers.
        </p>
        <p>
          Row color shows the item kind: green rows are OSS, orange rows are conceptual models, and the rest are
          schemas.
        </p>
      </>
    )
  }
};
