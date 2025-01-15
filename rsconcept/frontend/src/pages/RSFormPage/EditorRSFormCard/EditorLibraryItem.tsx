import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { urls } from '@/app/urls';
import {
  IconDateCreate,
  IconDateUpdate,
  IconEditor,
  IconFolderEdit,
  IconFolderOpened,
  IconOwner
} from '@/components/Icons';
import InfoUsers from '@/components/info/InfoUsers';
import { CProps } from '@/components/props';
import SelectUser from '@/components/select/SelectUser';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import Tooltip from '@/components/ui/Tooltip';
import ValueIcon from '@/components/ui/ValueIcon';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useUsers } from '@/context/UsersContext';
import useDropdown from '@/hooks/useDropdown';
import { ILibraryItemData, ILibraryItemEditor } from '@/models/library';
import { UserID, UserRole } from '@/models/user';
import { useLibrarySearchStore } from '@/stores/librarySearch';
import { useRoleStore } from '@/stores/role';
import { prefixes } from '@/utils/constants';
import { prompts } from '@/utils/labels';

interface EditorLibraryItemProps {
  item?: ILibraryItemData;
  isModified?: boolean;
  controller: ILibraryItemEditor;
}

function EditorLibraryItem({ item, isModified, controller }: EditorLibraryItemProps) {
  const { getUserLabel, users } = useUsers();
  const role = useRoleStore(state => state.role);
  const intl = useIntl();
  const router = useConceptNavigation();
  const setLocation = useLibrarySearchStore(state => state.setLocation);

  const ownerSelector = useDropdown();
  const onSelectUser = useCallback(
    (newValue: UserID) => {
      ownerSelector.hide();
      if (newValue === item?.owner) {
        return;
      }
      if (!window.confirm(prompts.ownerChange)) {
        return;
      }
      controller.setOwner(newValue);
    },
    [controller, item?.owner, ownerSelector]
  );

  const handleOpenLibrary = useCallback(
    (event: CProps.EventMouse) => {
      if (!item) {
        return;
      }
      setLocation(item.location);
      router.push(urls.library, event.ctrlKey || event.metaKey);
    },
    [setLocation, item, router]
  );

  if (!item) {
    return null;
  }

  return (
    <div className='flex flex-col'>
      <div className='flex justify-stretch sm:mb-1 max-w-[30rem] gap-3'>
        <MiniButton
          noHover
          noPadding
          title='Открыть в библиотеке'
          icon={<IconFolderOpened size='1.25rem' className='icon-primary' />}
          onClick={handleOpenLibrary}
        />
        <ValueIcon
          className='text-ellipsis flex-grow'
          icon={<IconFolderEdit size='1.25rem' className='icon-primary' />}
          value={item.location}
          title={controller.isAttachedToOSS ? 'Путь наследуется от ОСС' : 'Путь'}
          onClick={controller.promptLocation}
          disabled={isModified || controller.isProcessing || controller.isAttachedToOSS || role < UserRole.OWNER}
        />
      </div>

      {ownerSelector.isOpen ? (
        <Overlay position='top-[-0.5rem] left-[4rem] cc-icons'>
          {ownerSelector.isOpen ? (
            <SelectUser
              className='w-[25rem] sm:w-[26rem] text-sm'
              items={users}
              value={item.owner ?? undefined}
              onSelectValue={onSelectUser}
            />
          ) : null}
        </Overlay>
      ) : null}
      <ValueIcon
        className='sm:mb-1'
        icon={<IconOwner size='1.25rem' className='icon-primary' />}
        value={getUserLabel(item.owner)}
        title={controller.isAttachedToOSS ? 'Владелец наследуется от ОСС' : 'Владелец'}
        onClick={ownerSelector.toggle}
        disabled={isModified || controller.isProcessing || controller.isAttachedToOSS || role < UserRole.OWNER}
      />

      <div className='sm:mb-1 flex justify-between items-center'>
        <ValueIcon
          id='editor_stats'
          dense
          icon={<IconEditor size='1.25rem' className='icon-primary' />}
          value={item.editors.length}
          onClick={controller.promptEditors}
          disabled={isModified || controller.isProcessing || role < UserRole.OWNER}
        />
        <Tooltip anchorSelect='#editor_stats' layer='z-modalTooltip'>
          <InfoUsers items={item?.editors ?? []} prefix={prefixes.user_editors} header='Редакторы' />
        </Tooltip>

        <ValueIcon
          dense
          disabled
          icon={<IconDateUpdate size='1.25rem' className='text-ok-600' />}
          value={new Date(item.time_update).toLocaleString(intl.locale)}
          title='Дата обновления'
        />

        <ValueIcon
          dense
          disabled
          icon={<IconDateCreate size='1.25rem' className='text-ok-600' />}
          value={new Date(item.time_create).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          })}
          title='Дата создания'
        />
      </div>
    </div>
  );
}

export default EditorLibraryItem;
