'use client';

import clsx from 'clsx';

import { type LocationHead } from '@/domain/library';

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
          title='Редактирование пути
Перемещаются только Ваши схемы
в указанной папке (и подпапках)'
          aria-label='Редактирование расположения'
          icon={<IconFolderEdit size='1.25rem' className='icon-primary' />}
          onClick={onRenameLocation}
          disabled={!canRename}
        />
        <MiniButton
          title={subfolders ? 'Вложенные папки: Вкл' : 'Вложенные папки: Выкл'}
          aria-label='Переключатель отображения вложенных папок'
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
