'use client';

import clsx from 'clsx';

import { type LocationHead } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { MiniButton } from '@/components/control';
import { IconFolderEdit } from '@/components/icons';

import { IconShowSubfolders } from '../../components/icon-show-subfolders';
import { labelLocationHeadShort } from '../../labels';
import { useLibrarySearchStore } from '../../stores/library-search';

interface LocationBreadcrumbProps {
  className?: string;
  canRename: boolean;
  onRenameLocation: () => void;
}

export function LocationBreadcrumb({ canRename, className, onRenameLocation }: LocationBreadcrumbProps) {
  const tx = useTx();
  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);
  const subfolders = useLibrarySearchStore(state => state.subfolders);
  const toggleSubfolders = useLibrarySearchStore(state => state.toggleSubfolders);

  const segments = location.split('/').filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    label: index === 0 ? labelLocationHeadShort(('/' + segment) as LocationHead) : segment,
    path: '/' + segments.slice(0, index + 1).join('/')
  }));

  return (
    <div className={clsx('flex items-center gap-6 pl-2 pr-5', className)}>
      <div className='cc-icons'>
        <BadgeHelp topic={HelpTopic.UI_LIBRARY} contentClass='text-sm' offset={5} place='bottom-start' />
        <MiniButton
          title={tx(
            'lib.breadcrumb.editLocationTitle',
            'Edit path\nOnly your own schemas are moved\nto the selected folder (and subfolders)'
          )}
          aria-label={tx('lib.breadcrumb.editLocationAria', 'Edit location')}
          icon={<IconFolderEdit size='1.25rem' className='icon-primary' />}
          onClick={onRenameLocation}
          disabled={!canRename}
        />
        <MiniButton
          title={
            subfolders
              ? tx('lib.breadcrumb.subfoldersOn', 'Subfolders: On')
              : tx('lib.breadcrumb.subfoldersOff', 'Subfolders: Off')
          }
          aria-label={tx('lib.breadcrumb.subfoldersAria', 'Toggle subfolder display')}
          icon={<IconShowSubfolders value={subfolders} />}
          onClick={toggleSubfolders}
        />
      </div>

      <div
        className={clsx(
          'min-w-0 flex-1 truncate',
          'whitespace-nowrap overflow-hidden',
          'select-none font-math font-semibold'
        )}
      >
        {crumbs.length > 0
          ? crumbs.map((crumb, index) => (
              <span key={crumb.path} className='inline-flex items-center gap-1'>
                {index > 0 ? <span className='text-muted-foreground ml-1'>/</span> : null}
                <button
                  className='hover:text-primary hover:underline cursor-pointer'
                  onClick={() => setLocation(crumb.path)}
                >
                  {crumb.label}
                </button>
              </span>
            ))
          : null}
      </div>
    </div>
  );
}
