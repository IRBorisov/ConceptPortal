import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { AccessPolicy, LocationHead } from '@/features/library';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
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
  IconRobot,
  IconShare,
  IconUpload
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { EXTEOR_TRS_FILE } from '@/utils/constants';
import { infoMsg, tooltipText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { generatePageQR, promptUnsaved, sharePage } from '@/utils/utils';

import { useDownloadRSForm } from '../../backend/use-download-rsform';
import { useMutatingRSForm } from '../../backend/use-mutating-rsform';
import { generatePrompt } from '../../models/rslang-api';

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

  const menu = useDropdown();

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
    menu.hide();
    deleteSchema();
  }

  function handleDownload() {
    menu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    const fileName = (schema.alias ?? 'Schema') + EXTEOR_TRS_FILE;
    void download({
      itemID: schema.id,
      version: schema.version === 'latest' ? undefined : schema.version
    }).then((data: RO<Blob>) => {
      try {
        fileDownload(data as Blob, fileName);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function handleUpload() {
    menu.hide();
    showUpload({ itemID: schema.id });
  }

  function handleClone() {
    menu.hide();
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
    menu.hide();
    sharePage();
  }

  function handleCopyPrompt() {
    menu.hide();

    const prompt = generatePrompt(schema);
    navigator.clipboard
      .writeText(prompt)
      .then(() => toast.success(infoMsg.promptReady))
      .catch(console.error);
  }

  function handleShowQR() {
    menu.hide();
    showQR({ target: generatePageQR() });
  }

  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title='Меню'
        hideTitle={menu.isOpen}
        icon={<IconMenu size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-primary bg-transparent'
        onClick={menu.toggle}
      />
      <Dropdown isOpen={menu.isOpen} margin='mt-3'>
        <DropdownButton
          text='Поделиться'
          titleHtml={tooltipText.shareItem(schema.access_policy === AccessPolicy.PUBLIC)}
          aria-label='Скопировать ссылку в буфер обмена'
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
        <DropdownButton
          text='Запрос LLM'
          title='Генерировать запрос для LLM'
          icon={<IconRobot size='1rem' className='icon-primary' />}
          onClick={handleCopyPrompt}
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
