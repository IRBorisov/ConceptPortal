import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { SubfoldersIcon } from '@/components/DomainIcons';
import { IconFolderEdit, IconFolderTree } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import { CProps } from '@/components/props';
import SelectLocation from '@/components/select/SelectLocation';
import MiniButton from '@/components/ui/MiniButton';
import { useAuth } from '@/context/AuthContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useLibrary } from '@/context/LibraryContext';
import useWindowSize from '@/hooks/useWindowSize';
import { FolderNode, FolderTree } from '@/models/FolderTree';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER, prefixes } from '@/utils/constants';
import { information } from '@/utils/labels';

interface ViewSideLocationProps {
  folderTree: FolderTree;
  isVisible: boolean;
  subfolders: boolean;
  activeLocation: string;
  onChangeActiveLocation: (newValue: string) => void;
  toggleFolderMode: () => void;
  toggleSubfolders: () => void;
  onRenameLocation: () => void;
}

function ViewSideLocation({
  folderTree,
  activeLocation,
  subfolders,
  isVisible,
  onChangeActiveLocation,
  toggleFolderMode,
  toggleSubfolders,
  onRenameLocation
}: ViewSideLocationProps) {
  const { user } = useAuth();
  const { items } = useLibrary();
  const { calculateHeight } = useConceptOptions();
  const windowSize = useWindowSize();

  const canRename = useMemo(() => {
    if (activeLocation.length <= 3 || !user) {
      return false;
    }
    if (user.is_staff) {
      return true;
    }
    const owned = items.filter(item => item.owner == user.id);
    const located = owned.filter(
      item => item.location == activeLocation || item.location.startsWith(`${activeLocation}/`)
    );
    return located.length !== 0;
  }, [activeLocation, user, items]);

  const maxHeight = useMemo(() => calculateHeight('4.5rem'), [calculateHeight]);

  const handleClickFolder = useCallback(
    (event: CProps.EventMouse, target: FolderNode) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey) {
        navigator.clipboard
          .writeText(target.getPath())
          .then(() => toast.success(information.pathReady))
          .catch(console.error);
      } else {
        onChangeActiveLocation(target.getPath());
      }
    },
    [onChangeActiveLocation]
  );

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
          {!!activeLocation ? (
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
        value={activeLocation}
        folderTree={folderTree}
        prefix={prefixes.folders_list}
        onClick={handleClickFolder}
        style={{ maxHeight: maxHeight }}
      />
    </div>
  );
}

export default ViewSideLocation;
