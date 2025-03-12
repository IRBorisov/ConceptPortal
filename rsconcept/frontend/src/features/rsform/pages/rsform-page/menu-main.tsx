import fileDownload from 'js-file-download';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { AccessPolicy, LocationHead } from '@/features/library';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/container';
import { Button } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconClone,
  IconDestroy,
  IconDownload,
  IconLibrary,
  IconMenu,
  IconNewItem,
  IconOSS,
  IconQR,
  IconShare,
  IconUpload
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { EXTEOR_TRS_FILE } from '@/utils/constants';
import { tooltipText } from '@/utils/labels';
import { generatePageQR, promptUnsaved, sharePage } from '@/utils/utils';

import { useDownloadRSForm } from '../../backend/use-download-rsform';
import { useMutatingRSForm } from '../../backend/use-mutating-rsform';

import { useRSEdit } from './rsedit-context';

export function MenuMain() {
  const router = useConceptNavigation();
  const { schema, selected, deleteSchema, isArchive, isMutable, isContentEditable } = useRSEdit();
  const isProcessing = useMutatingRSForm();

  const { user, isAnonymous } = useAuthSuspense();

  const role = useRoleStore(state => state.role);
  const { isModified } = useModificationStore();

  const { download } = useDownloadRSForm();

  const showQR = useDialogsStore(state => state.showQR);
  const showClone = useDialogsStore(state => state.showCloneLibraryItem);
  const showUpload = useDialogsStore(state => state.showUploadRSForm);

  const schemaMenu = useDropdown();

  function calculateCloneLocation() {
    const location = schema.location;
    const head = location.substring(0, 2) as LocationHead;
    if (head === LocationHead.LIBRARY) {
      return user.is_staff ? location : LocationHead.USER;
    }
    if (schema.owner === user.id) {
      return location;
    }
    return head === LocationHead.USER ? LocationHead.USER : location;
  }

  function handleDelete() {
    schemaMenu.hide();
    deleteSchema();
  }

  function handleDownload() {
    schemaMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    const fileName = (schema.alias ?? 'Schema') + EXTEOR_TRS_FILE;
    void download({
      itemID: schema.id,
      version: schema.version === 'latest' ? undefined : schema.version
    }).then((data: Blob) => {
      try {
        fileDownload(data, fileName);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function handleUpload() {
    schemaMenu.hide();
    showUpload({ itemID: schema.id });
  }

  function handleClone() {
    schemaMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showClone({
      base: schema,
      initialLocation: calculateCloneLocation(),
      selected: selected,
      totalCount: schema.items.length
    });
  }

  function handleShare() {
    schemaMenu.hide();
    sharePage();
  }

  function handleShowQR() {
    schemaMenu.hide();
    showQR({ target: generatePageQR() });
  }

  return (
    <div ref={schemaMenu.ref} className='relative'>
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        title='Меню'
        hideTitle={schemaMenu.isOpen}
        icon={<IconMenu size='1.25rem' className='clr-text-controls' />}
        className='h-full pl-2'
        onClick={schemaMenu.toggle}
      />
      <Dropdown isOpen={schemaMenu.isOpen} margin='mt-3'>
        <DropdownButton
          text='Поделиться'
          titleHtml={tooltipText.shareItem(schema.access_policy === AccessPolicy.PUBLIC)}
          icon={<IconShare size='1rem' className='icon-primary' />}
          onClick={handleShare}
          disabled={schema.access_policy !== AccessPolicy.PUBLIC}
        />
        <DropdownButton
          text='QR-код'
          title='Показать QR-код схемы'
          icon={<IconQR size='1rem' className='icon-primary' />}
          onClick={handleShowQR}
        />
        {!isAnonymous ? (
          <DropdownButton
            text='Клонировать'
            icon={<IconClone size='1rem' className='icon-green' />}
            disabled={isArchive}
            onClick={handleClone}
          />
        ) : null}
        <DropdownButton
          text='Выгрузить в Экстеор'
          icon={<IconDownload size='1rem' className='icon-primary' />}
          onClick={handleDownload}
        />
        {isContentEditable ? (
          <DropdownButton
            text='Загрузить из Экстеор'
            icon={<IconUpload size='1rem' className='icon-red' />}
            disabled={isProcessing || schema.oss.length !== 0}
            onClick={handleUpload}
          />
        ) : null}
        {isMutable ? (
          <DropdownButton
            text='Удалить схему'
            icon={<IconDestroy size='1rem' className='icon-red' />}
            disabled={isProcessing || role < UserRole.OWNER}
            onClick={handleDelete}
          />
        ) : null}

        <Divider margins='mx-3 my-1' />

        {!isAnonymous ? (
          <DropdownButton
            text='Создать новую схему'
            icon={<IconNewItem size='1rem' className='icon-primary' />}
            onClick={() => router.push({ path: urls.create_schema })}
          />
        ) : null}
        {schema.oss.length > 0 ? (
          <DropdownButton
            text='Перейти к ОСС'
            icon={<IconOSS size='1rem' className='icon-primary' />}
            onClick={() => router.push({ path: urls.oss(schema.oss[0].id) })}
          />
        ) : null}
        <DropdownButton
          text='Библиотека'
          icon={<IconLibrary size='1rem' className='icon-primary' />}
          onClick={() => router.push({ path: urls.library })}
        />
      </Dropdown>
    </div>
  );
}
