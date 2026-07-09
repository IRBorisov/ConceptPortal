import { HelpTopic } from '@/features/help';

import { IconDownload, IconFilterReset, IconFolder, IconSearch, IconSortAsc, IconSubfolders } from '@/components/icons';

import { type TourStepContent } from '../../models/tour';
import { TourHelpLink } from '../shared/tour-help-links';

export const libraryIntroContentEn: Record<string, TourStepContent> = {
  welcome: {
    title: 'Library',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          The <TourHelpLink text='library' topic={HelpTopic.UI_LIBRARY} /> is where you browse and open conceptual
          schemas, models, and operational synthesis schemas stored in the Portal.
        </p>
        <p>This short tour covers folders, search, and the items table.</p>
      </div>
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
        The breadcrumb shows the active path. Use <IconFolder className='inline-icon' /> rename (when allowed) and{' '}
        <IconSubfolders className='inline-icon' /> to include or hide items from nested folders.
      </p>
    )
  },
  search: {
    title: 'Search and filters',
    body: (
      <p>
        Filter by type, switch between metadata and context search with <IconSearch className='inline-icon' />, and
        narrow results by owner. <IconFilterReset className='inline-icon' /> clears custom filters.
      </p>
    )
  },
  table: {
    title: 'Items table',
    body: (
      <div className='flex flex-col gap-2'>
        <p>
          Click a row to open an item. Ctrl/Cmd-click opens it in a new tab. Sort with{' '}
          <IconSortAsc className='inline-icon' /> column headers, and export the visible table with{' '}
          <IconDownload className='inline-icon' />.
        </p>
        <p>Green rows are OSS; orange rows are conceptual models.</p>
      </div>
    )
  }
};
