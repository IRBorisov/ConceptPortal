import { useTx } from '@/i18n/use-tx';

import {
  IconAnimationOff,
  IconDownload,
  IconFilterReset,
  IconFolder,
  IconFolderClosed,
  IconFolderEdit,
  IconFolderEmpty,
  IconFolderOpened,
  IconOSS,
  IconRSModel,
  IconSearch,
  IconShow,
  IconSortAsc,
  IconSortDesc,
  IconSubfolders,
  IconUserSearch
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpLibraryEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.library')}</h1>
      <ul>
        <li>
          <span className='text-accent-green-foreground'>green </span> highlights{' '}
          <IconOSS size='1rem' className='inline-icon' />{' '}
          <LinkTopic text='operational synthesis schemas' topic={HelpTopic.CC_OSS} />
        </li>
        <li>
          <span className='text-accent-orange-foreground'>orange </span> highlights{' '}
          <IconRSModel size='1rem' className='inline-icon' />{' '}
          <LinkTopic text='conceptual models' topic={HelpTopic.CC_RSMODEL} />
        </li>
        <li>
          <kbd>click</kbd> on a row to open the schema editor
        </li>
        <li>
          <kbd>{isMac() ? 'Cmd + click' : 'Ctrl + click'}</kbd> on a row opens the schema in a new tab
        </li>
        <li>
          <IconShow className='inline-icon' /> attribute filters are applied on click
        </li>
        <li>
          <IconAnimationOff className='inline-icon' /> filter by type
        </li>
        <li>
          <IconUserSearch className='inline-icon' /> filter by user
        </li>
        <li>
          <IconSearch className='inline-icon' /> filter by title and alias
        </li>
        <li>
          <IconFilterReset className='inline-icon' /> reset filters
        </li>
        <li>
          <IconSortAsc className='inline-icon' />
          <IconSortDesc className='inline-icon' /> sort by clicking a column header
        </li>
        <li>
          <IconDownload className='inline-icon' /> export table to file
        </li>
      </ul>

      <h2>{tx('tx.lib.location.explorer')}</h2>
      <ul>
        <li>
          <kbd>click</kbd> on a folder to expand the explorer tree
        </li>
        <li>
          <kbd>click</kbd> on a row to display its schemas on the right
        </li>
        <li>
          <kbd>
            {isMac()
              ? 'Cmd + click on a folder copies its path to the clipboard'
              : 'Ctrl + click on a folder copies its path to the clipboard'}
          </kbd>
        </li>
        <li>
          <kbd>click</kbd> on the icon to collapse/expand nested items
        </li>
        <li>
          <IconFolderEdit className='inline-icon' /> rename selected folder
        </li>
        <li>
          <IconSubfolders className='inline-icon' /> schemas in nested folders
        </li>
        <li>
          <IconFolderEmpty className='inline-icon text-foreground' /> folder with no schemas
        </li>
        <li>
          <IconFolderEmpty className='inline-icon' /> folder with nested folders but no schemas
        </li>
        <li>
          <IconFolder className='inline-icon' /> folder without nested folders
        </li>
        <li>
          <IconFolderClosed className='inline-icon' /> folder with nested folders and schemas
        </li>
        <li>
          <IconFolderOpened className='inline-icon icon-green' /> expanded folder
        </li>
      </ul>
    </>
  );
}
