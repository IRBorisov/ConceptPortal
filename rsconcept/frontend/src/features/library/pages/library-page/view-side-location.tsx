import { toast } from 'react-toastify';

import { useAuthSuspense } from '@/features/auth';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { MiniButton } from '@/components/control1';
import { IconFolderEdit, IconFolderTree } from '@/components/icons1';
import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { PARAMETER, prefixes } from '@/utils/constants';
import { infoMsg } from '@/utils/labels';

import { useLibrary } from '../../backend/use-library';
import { IconShowSubfolders } from '../../components/icon-show-subfolders';
import { SelectLocation } from '../../components/select-location';
import { type FolderNode } from '../../models/folder-tree';
import { useLibrarySearchStore } from '../../stores/library-search';

interface ViewSideLocationProps {
  isVisible: boolean;
  onRenameLocation: () => void;
}

export function ViewSideLocation({ isVisible, onRenameLocation }: ViewSideLocationProps) {
  const { user, isAnonymous } = useAuthSuspense();
  const { items } = useLibrary();
  const { isSmall } = useWindowSize();

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

  function handleClickFolder(event: React.MouseEvent<Element>, target: FolderNode) {
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
      className='max-w-40 sm:max-w-60 flex flex-col text:xs sm:text-sm select-none'
      style={{
        transitionProperty: 'width, min-width, opacity',
        transitionDuration: `${PARAMETER.moveDuration}ms`,
        transitionTimingFunction: 'ease-out',
        minWidth: isVisible ? (isSmall ? '10rem' : '15rem') : '0',
        width: isVisible ? '100%' : '0',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div className='h-8 flex justify-between items-center pr-1 pl-0.5'>
        <BadgeHelp topic={HelpTopic.UI_LIBRARY} contentClass='text-sm' offset={5} place='right-start' />
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
              title={subfolders ? 'Вложенные папки: Вкл' : 'Вложенные папки: Выкл'}
              icon={<IconShowSubfolders value={subfolders} />}
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
