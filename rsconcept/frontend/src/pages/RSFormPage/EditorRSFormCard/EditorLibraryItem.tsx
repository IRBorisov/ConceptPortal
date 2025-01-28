import { Suspense } from 'react';
import { useIntl } from 'react-intl';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { useIsProcessingLibrary } from '@/backend/library/useIsProcessingLibrary';
import { useLibraryItem } from '@/backend/library/useLibraryItem';
import { useSetEditors } from '@/backend/library/useSetEditors';
import { useSetLocation } from '@/backend/library/useSetLocation';
import { useSetOwner } from '@/backend/library/useSetOwner';
import { useLabelUser } from '@/backend/users/useLabelUser';
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
import Loader from '@/components/ui/Loader';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import Tooltip from '@/components/ui/Tooltip';
import ValueIcon from '@/components/ui/ValueIcon';
import useDropdown from '@/hooks/useDropdown';
import { ILibraryItemEditor, LibraryItemID, LibraryItemType } from '@/models/library';
import { UserID, UserRole } from '@/models/user';
import { useDialogsStore } from '@/stores/dialogs';
import { useLibrarySearchStore } from '@/stores/librarySearch';
import { useModificationStore } from '@/stores/modification';
import { useRoleStore } from '@/stores/role';
import { prefixes } from '@/utils/constants';
import { prompts } from '@/utils/labels';

interface EditorLibraryItemProps {
  itemID: LibraryItemID;
  itemType: LibraryItemType;
  controller: ILibraryItemEditor;
}

function EditorLibraryItem({ itemID, itemType, controller }: EditorLibraryItemProps) {
  const getUserLabel = useLabelUser();
  const role = useRoleStore(state => state.role);
  const intl = useIntl();
  const router = useConceptNavigation();
  const setGlobalLocation = useLibrarySearchStore(state => state.setLocation);

  const { item } = useLibraryItem({ itemID, itemType });
  const isProcessing = useIsProcessingLibrary();
  const { isModified } = useModificationStore();

  const { setOwner } = useSetOwner();
  const { setLocation } = useSetLocation();
  const { setEditors } = useSetEditors();

  const showEditEditors = useDialogsStore(state => state.showEditEditors);
  const showEditLocation = useDialogsStore(state => state.showChangeLocation);

  const ownerSelector = useDropdown();
  const onSelectUser = function (newValue: UserID) {
    ownerSelector.hide();
    if (newValue === item?.owner) {
      return;
    }
    if (!window.confirm(prompts.ownerChange)) {
      return;
    }
    setOwner({ itemID: itemID, owner: newValue });
  };

  function handleOpenLibrary(event: CProps.EventMouse) {
    if (!item) {
      return;
    }
    setGlobalLocation(item.location);
    router.push(urls.library, event.ctrlKey || event.metaKey);
  }

  function handleEditLocation() {
    if (!item) {
      return;
    }
    showEditLocation({
      initial: item.location,
      onChangeLocation: newLocation => setLocation({ itemID: itemID, location: newLocation })
    });
  }

  function handleEditEditors() {
    if (!item) {
      return;
    }
    showEditEditors({
      editors: item.editors,
      onChangeEditors: newEditors => setEditors({ itemID: itemID, editors: newEditors })
    });
  }

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
          onClick={handleEditLocation}
          disabled={isModified || isProcessing || controller.isAttachedToOSS || role < UserRole.OWNER}
        />
      </div>

      {ownerSelector.isOpen ? (
        <Overlay position='top-[-0.5rem] left-[4rem] cc-icons'>
          {ownerSelector.isOpen ? (
            <SelectUser
              className='w-[25rem] sm:w-[26rem] text-sm'
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
        disabled={isModified || isProcessing || controller.isAttachedToOSS || role < UserRole.OWNER}
      />

      <div className='sm:mb-1 flex justify-between items-center'>
        <ValueIcon
          id='editor_stats'
          dense
          icon={<IconEditor size='1.25rem' className='icon-primary' />}
          value={item.editors.length}
          onClick={handleEditEditors}
          disabled={isModified || isProcessing || role < UserRole.OWNER}
        />
        <Tooltip anchorSelect='#editor_stats' layer='z-modalTooltip'>
          <Suspense fallback={<Loader scale={2} />}>
            <InfoUsers items={item?.editors ?? []} prefix={prefixes.user_editors} header='Редакторы' />
          </Suspense>
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
