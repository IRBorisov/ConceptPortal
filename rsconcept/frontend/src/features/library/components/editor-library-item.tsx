'use client';

import { Suspense } from 'react';
import { useIntl } from 'react-intl';

import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { useLabelUser, useRoleStore, UserRole } from '@/features/users';
import { InfoUsers } from '@/features/users/components/info-users';
import { SelectUser } from '@/features/users/components/select-user';

import { Tooltip } from '@/components/container';
import { MiniButton } from '@/components/control';
import { useDropdown } from '@/components/dropdown';
import {
  IconDateCreate,
  IconDateUpdate,
  IconEditor,
  IconFolderEdit,
  IconFolderOpened,
  IconOwner
} from '@/components/icons';
import { Loader } from '@/components/loader';
import { ValueIcon } from '@/components/view';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { prefixes } from '@/utils/constants';

import { type LibraryItemData } from '../backend/types';
import { useMutatingLibrary } from '../backend/use-mutating-library';
import { useSetLocation } from '../backend/use-set-location';
import { useSetOwner } from '../backend/use-set-owner';
import { labelLibraryLocationPath } from '../labels';
import { useLibrarySearchStore } from '../stores/library-search';

interface EditorLibraryItemProps {
  item: LibraryItemData;
  isProduced: boolean;
}

export function EditorLibraryItem({ item, isProduced }: EditorLibraryItemProps) {
  const getUserLabel = useLabelUser();
  const role = useRoleStore(state => state.role);
  const intl = useIntl();
  const tx = useTx();
  const router = useConceptNavigation();
  const setGlobalLocation = useLibrarySearchStore(state => state.setLocation);

  const isProcessing = useMutatingLibrary();
  const isModified = useModificationStore(state => state.isModified);

  const { setOwner } = useSetOwner();
  const { setLocation } = useSetLocation();

  const showEditEditors = useDialogsStore(state => state.showEditEditors);
  const showEditLocation = useDialogsStore(state => state.showChangeLocation);

  const {
    elementRef: ownerRef,
    isOpen: isOwnerOpen,
    toggle: toggleOwner,
    handleBlur: handleOwnerBlur,
    hide: hideOwner
  } = useDropdown();
  const onSelectUser = function (newValue: number) {
    hideOwner();
    if (newValue === item.owner) {
      return;
    }
    if (!window.confirm(tx('tx.lib.item.owner.edit.confirm'))) {
      return;
    }
    void setOwner({ itemID: item.id, owner: newValue });
  };

  function handleOpenLibrary(event: React.MouseEvent<Element>) {
    setGlobalLocation(item.location);
    router.gotoLibrary(event.ctrlKey || event.metaKey);
  }

  function handleEditLocation() {
    showEditLocation({
      initial: item.location,
      onChangeLocation: newLocation => void setLocation({ itemID: item.id, location: newLocation })
    });
  }

  function handleEditEditors() {
    showEditEditors({
      itemID: item.id,
      initialEditors: item.editors
    });
  }

  return (
    <div className='flex flex-col'>
      <div className='relative flex justify-stretch sm:mb-1 max-w-120 gap-3'>
        <MiniButton
          title={tx('tx.lib.location.open')}
          noPadding
          icon={<IconFolderOpened size='1.25rem' className='icon-primary' />}
          onClick={handleOpenLibrary}
        />
        <ValueIcon
          className='text-ellipsis grow'
          icon={<IconFolderEdit size='1.25rem' className='icon-primary' />}
          value={labelLibraryLocationPath(item.location)}
          title={isProduced ? tx('tx.schema.inherit.location') : tx('tx.lib.location')}
          onClick={handleEditLocation}
          disabled={isModified || isProcessing || isProduced || role < UserRole.OWNER}
        />
      </div>

      <div className='relative' ref={ownerRef} onBlur={handleOwnerBlur}>
        <SelectUser
          className='absolute -top-2 right-0 w-100 text-sm'
          value={item.owner}
          onChange={user => user && onSelectUser(user)}
          hidden={!isOwnerOpen}
        />

        <ValueIcon
          className='sm:mb-1'
          icon={<IconOwner size='1.25rem' className='icon-primary' />}
          value={getUserLabel(item.owner)}
          title={isProduced ? tx('tx.schema.inherit.owner') : tx('tx.general.role.owner')}
          onClick={toggleOwner}
          disabled={isModified || isProcessing || isProduced || role < UserRole.OWNER}
        />
      </div>

      <div className='sm:mb-1 flex justify-between items-center'>
        <ValueIcon
          id='editor_stats'
          dense
          icon={<IconEditor size='1.25rem' className='icon-primary' />}
          value={item.editors.length}
          onClick={handleEditEditors}
          disabled={isModified || isProcessing || role < UserRole.OWNER}
        />
        <Tooltip anchorSelect='#editor_stats'>
          <Suspense fallback={<Loader scale={2} />}>
            <InfoUsers
              items={item.editors}
              prefix={prefixes.user_editors}
              header={tx('tx.general.role.editor.plural')}
            />
          </Suspense>
        </Tooltip>

        <ValueIcon
          title={tx('tx.general.date.updated')}
          dense
          icon={<IconDateUpdate size='1.25rem' />}
          value={new Date(item.time_update).toLocaleString(intl.locale)}
        />

        <ValueIcon
          title={tx('tx.general.date.creation')}
          dense
          icon={<IconDateCreate size='1.25rem' />}
          value={new Date(item.time_create).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          })}
        />
      </div>
    </div>
  );
}
