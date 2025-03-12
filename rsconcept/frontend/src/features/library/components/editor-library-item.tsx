import { Suspense } from 'react';
import { useIntl } from 'react-intl';

import { urls, useConceptNavigation } from '@/app';
import { useLabelUser, useRoleStore, UserRole } from '@/features/users';
import { InfoUsers, SelectUser } from '@/features/users/components';

import { Tooltip } from '@/components/container1';
import { MiniButton } from '@/components/control1';
import { useDropdown } from '@/components/dropdown1';
import {
  IconDateCreate,
  IconDateUpdate,
  IconEditor,
  IconFolderEdit,
  IconFolderOpened,
  IconOwner
} from '@/components/icons1';
import { Loader } from '@/components/loader1';
import { ValueIcon } from '@/components/view1';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { prefixes } from '@/utils/constants';
import { promptText } from '@/utils/labels';

import { type ILibraryItemData } from '../backend/types';
import { useMutatingLibrary } from '../backend/use-mutating-library';
import { useSetLocation } from '../backend/use-set-location';
import { useSetOwner } from '../backend/use-set-owner';
import { useLibrarySearchStore } from '../stores/library-search';

interface EditorLibraryItemProps {
  schema: ILibraryItemData;
  isAttachedToOSS: boolean;
}

export function EditorLibraryItem({ schema, isAttachedToOSS }: EditorLibraryItemProps) {
  const getUserLabel = useLabelUser();
  const role = useRoleStore(state => state.role);
  const intl = useIntl();
  const router = useConceptNavigation();
  const setGlobalLocation = useLibrarySearchStore(state => state.setLocation);

  const isProcessing = useMutatingLibrary();
  const { isModified } = useModificationStore();

  const { setOwner } = useSetOwner();
  const { setLocation } = useSetLocation();

  const showEditEditors = useDialogsStore(state => state.showEditEditors);
  const showEditLocation = useDialogsStore(state => state.showChangeLocation);

  const ownerSelector = useDropdown();
  const onSelectUser = function (newValue: number) {
    ownerSelector.hide();
    if (newValue === schema.owner) {
      return;
    }
    if (!window.confirm(promptText.ownerChange)) {
      return;
    }
    void setOwner({ itemID: schema.id, owner: newValue });
  };

  function handleOpenLibrary(event: React.MouseEvent<Element>) {
    setGlobalLocation(schema.location);
    router.push({ path: urls.library, newTab: event.ctrlKey || event.metaKey });
  }

  function handleEditLocation() {
    showEditLocation({
      initial: schema.location,
      onChangeLocation: newLocation => void setLocation({ itemID: schema.id, location: newLocation })
    });
  }

  function handleEditEditors() {
    showEditEditors({
      itemID: schema.id,
      initialEditors: schema.editors
    });
  }

  return (
    <div className='flex flex-col'>
      <div className='relative flex justify-stretch sm:mb-1 max-w-120 gap-3'>
        <MiniButton
          noHover
          noPadding
          title='Открыть в библиотеке'
          icon={<IconFolderOpened size='1.25rem' className='icon-primary' />}
          onClick={handleOpenLibrary}
        />
        <ValueIcon
          className='text-ellipsis grow'
          icon={<IconFolderEdit size='1.25rem' className='icon-primary' />}
          value={schema.location}
          title={isAttachedToOSS ? 'Путь наследуется от ОСС' : 'Путь'}
          onClick={handleEditLocation}
          disabled={isModified || isProcessing || isAttachedToOSS || role < UserRole.OWNER}
        />
      </div>

      <div className='relative'>
        {ownerSelector.isOpen ? (
          <div className='absolute -top-2 right-0'>
            <SelectUser className='w-100 text-sm' value={schema.owner} onChange={onSelectUser} />
          </div>
        ) : null}
        <ValueIcon
          className='sm:mb-1'
          icon={<IconOwner size='1.25rem' className='icon-primary' />}
          value={getUserLabel(schema.owner)}
          title={isAttachedToOSS ? 'Владелец наследуется от ОСС' : 'Владелец'}
          onClick={ownerSelector.toggle}
          disabled={isModified || isProcessing || isAttachedToOSS || role < UserRole.OWNER}
        />
      </div>

      <div className='sm:mb-1 flex justify-between items-center'>
        <ValueIcon
          id='editor_stats'
          dense
          icon={<IconEditor size='1.25rem' className='icon-primary' />}
          value={schema.editors.length}
          onClick={handleEditEditors}
          disabled={isModified || isProcessing || role < UserRole.OWNER}
        />
        <Tooltip anchorSelect='#editor_stats'>
          <Suspense fallback={<Loader scale={2} />}>
            <InfoUsers items={schema.editors} prefix={prefixes.user_editors} header='Редакторы' />
          </Suspense>
        </Tooltip>

        <ValueIcon
          dense
          disabled
          icon={<IconDateUpdate size='1.25rem' className='text-ok-600' />}
          value={new Date(schema.time_update).toLocaleString(intl.locale)}
          title='Дата обновления'
        />

        <ValueIcon
          dense
          disabled
          icon={<IconDateCreate size='1.25rem' className='text-ok-600' />}
          value={new Date(schema.time_create).toLocaleString(intl.locale, {
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
