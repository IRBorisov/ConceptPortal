import { toast } from 'react-toastify';
import clsx from 'clsx';

import { useAuthSuspense } from '@/features/auth';
import { BadgeHelp, HelpTopic } from '@/features/help';

import { MiniButton } from '@/components/Control';
import { SubfoldersIcon } from '@/components/DomainIcons';
import { IconFolderEdit, IconFolderTree } from '@/components/Icons';
import { CProps } from '@/components/props';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useFitHeight } from '@/stores/appLayout';
import { PARAMETER, prefixes } from '@/utils/constants';
import { infoMsg } from '@/utils/labels';

import { useLibrary } from '../../backend/useLibrary';
import { SelectLocation } from '../../components/SelectLocation';
import { FolderNode } from '../../models/FolderTree';
import { useLibrarySearchStore } from '../../stores/librarySearch';

interface ViewSideLocationProps {
  isVisible: boolean;
  onRenameLocation: () => void;
}

export function ViewSideLocation({ isVisible, onRenameLocation }: ViewSideLocationProps) {
  const { user, isAnonymous } = useAuthSuspense();
  const { items } = useLibrary();
  const windowSize = useWindowSize();

  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);
  const toggleFolderMode = useLibrarySearchStore(state => state.toggleFolderMode);
  const subfolders = useLibrarySearchStore(state => state.subfolders);
  const toggleSubfolders = useLibrarySearchStore(state => state.toggleSubfolders);

  const canRename = (() => {
    if (location.length <= 3 || isAnonymous) {
      return false;
    }
    if (user.is_staff) {
      return true;
    }
    const owned = items.filter(item => item.owner == user.id);
    const located = owned.filter(item => item.location == location || item.location.startsWith(`${location}/`));
    return located.length !== 0;
  })();

  const maxHeight = useFitHeight('4.5rem');

  function handleClickFolder(event: CProps.EventMouse, target: FolderNode) {
    event.preventDefault();
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      navigator.clipboard
        .writeText(target.getPath())
        .then(() => toast.success(infoMsg.pathReady))
        .catch(console.error);
    } else {
      setLocation(target.getPath());
    }
  }

  return (
    <div
      className={clsx('max-w-[10rem] sm:max-w-[15rem]', 'flex flex-col', 'text:xs sm:text-sm', 'select-none')}
      style={{
        transitionProperty: 'width, min-width, opacity',
        transitionDuration: `${PARAMETER.moveDuration}ms`,
        transitionTimingFunction: 'ease-out',
        minWidth: isVisible ? (windowSize.isSmall ? '10rem' : '15rem') : '0',
        width: isVisible ? '100%' : '0',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div className='h-[2.08rem] flex justify-between items-center pr-1 pl-[0.125rem]'>
        <BadgeHelp
          topic={HelpTopic.UI_LIBRARY}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'text-sm')}
          offset={5}
          place='right-start'
        />
        <div className='cc-icons'>
          {canRename ? (
            <MiniButton
              icon={<IconFolderEdit size='1.25rem' className='icon-primary' />}
              titleHtml='<b>Редактирование пути</b><br/>Перемещаются только Ваши схемы<br/>в указанной папке (и подпапках)'
              onClick={onRenameLocation}
            />
          ) : null}
          {!!location ? (
            <MiniButton
              title={subfolders ? 'Вложенные папки: Вкл' : 'Вложенные папки: Выкл'} // prettier: split-lines
              icon={<SubfoldersIcon value={subfolders} />}
              onClick={toggleSubfolders}
            />
          ) : null}
          <MiniButton
            icon={<IconFolderTree size='1.25rem' className='icon-green' />}
            title='Переключение в режим Поиск'
            onClick={toggleFolderMode}
          />
        </div>
      </div>
      <SelectLocation
        value={location}
        prefix={prefixes.folders_list}
        onClick={handleClickFolder}
        style={{ maxHeight: maxHeight }}
      />
    </div>
  );
}
