import { HelpTopic } from '@/features/help';

import {
  IconDownload,
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
        The left panel is the location explorer. Click a folder to show its items on the right. Ctrl/Cmd-click a folder
        copies its path. Folder icons show whether a location has items or nested folders.
      </p>
    )
  },
  location: {
    title: 'Current location',
    body: (
      <p>
        The breadcrumb shows the active path. Use <IconFolderEdit className='inline-icon' /> to rename a folder (when
        allowed) and <IconSubfolders className='inline-icon' /> to include or hide items from nested folders.
      </p>
    )
  },
  search: {
    title: 'Search and filters',
    body: (
      <p>
        Type chips narrow the list to schemas, models, or OSS. Switch Metadata (<IconSearch className='inline-icon' />)
        and Context search (<IconText className='inline-icon' />) with the mode selector; optionally filter by owner.{' '}
        <IconFilterReset className='inline-icon' /> clears custom filters.
      </p>
    )
  },
  table: {
    title: 'Items table',
    body: (
      <>
        <p>
          Click a row to open an item. Ctrl/Cmd-click opens it in a new tab. Sort with{' '}
          <IconSortAsc className='inline-icon' /> column headers, and export the visible table with{' '}
          <IconDownload className='inline-icon' />.
        </p>
        <p>
          Row color shows the item kind: green rows are OSS, orange rows are conceptual models, and the rest are
          schemas.
        </p>
      </>
    )
  }
};
