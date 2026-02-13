'use client';

import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { useConceptNavigation } from '@/app';
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
  IconPDF,
  IconQR,
  IconRSModel,
  IconShare,
  IconUpload
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { EXTEOR_TRS_FILE, prefixes } from '@/utils/constants';
import { errorMsg, tooltipText } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { generatePageQR, promptUnsaved, sharePage } from '@/utils/utils';

import { useDownloadRSForm } from '../../backend/use-download-rsform';
import { useMutatingRSForm } from '../../backend/use-mutating-rsform';

import { useRSFormEdit } from './rsedit-context';

export function MenuMain() {
  const router = useConceptNavigation();
  const { schema, selectedCst, deleteSchema, isArchive, isMutable, isContentEditable } = useRSFormEdit();
  const isProcessing = useMutatingRSForm();

  const { user, isAnonymous } = useAuthSuspense();
  const hasInheritance = schema.inheritance.some(item => item.child_source === schema.id);

  const role = useRoleStore(state => state.role);
  const isModified = useModificationStore(state => state.isModified);

  const { download } = useDownloadRSForm();

  const showQR = useDialogsStore(state => state.showQR);
  const showClone = useDialogsStore(state => state.showCloneLibraryItem);
  const showUpload = useDialogsStore(state => state.showUploadRSForm);

  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  const { elementRef: ossRef, isOpen: isOssOpen, toggle: toggleOss, handleBlur: handleOssBlur } = useDropdown();
  const { elementRef: modelRef, isOpen: isModelOpen, toggle: toggleModel, handleBlur: handleModelBlur } = useDropdown();

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
    hideMenu();
    deleteSchema();
  }

  function handleDownload() {
    hideMenu();
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
    hideMenu();
    showUpload({ itemID: schema.id });
  }

  function handleClone() {
    hideMenu();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showClone({
      base: schema,
      initialLocation: calculateCloneLocation(),
      selected: selectedCst,
      totalCount: schema.items.length
    });
  }

  function handleShare() {
    hideMenu();
    sharePage();
  }

  function handleShowQR() {
    hideMenu();
    showQR({ target: generatePageQR() });
  }

  async function handleSavePDF() {
    hideMenu();
    const filename = schema.alias ?? 'Schema';
    try {
      const { createSchemaFile } = await import('../../utils/rsform2pdf');
      const blob = await createSchemaFile(schema);
      void createSchemaFile(schema);
      fileDownload(blob, `${filename}.pdf`, 'application/pdf;charset=utf-8;');
    } catch (error) {
      toast.error(errorMsg.pdfError);
      throw error;
    }
  }

  function onOssToggle() {
    if (schema.oss.length > 1) {
      toggleOss();
    } else {
      router.gotoOss(schema.oss[0].id);
    }
  }

  function onModelToggle() {
    if (schema.models.length > 1) {
      toggleModel();
    } else {
      router.gotoRSModel(schema.models[0].id);
    }
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title='Меню'
        hideTitle={isMenuOpen}
        icon={<IconMenu size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-primary cc-animate-color bg-transparent'
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
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
        {!isAnonymous ? (
          <DropdownButton
            text='Клонировать'
            icon={<IconClone size='1rem' className='icon-green' />}
            disabled={isArchive}
            onClick={handleClone}
          />
        ) : null}
        <DropdownButton
          text='Экспорт в PDF'
          icon={<IconPDF size='1rem' className='icon-primary' />}
          onClick={() => void handleSavePDF()}
        />
        <DropdownButton
          text='Выгрузить в Экстеор'
          icon={<IconDownload size='1rem' className='icon-primary' />}
          onClick={handleDownload}
        />
        {isContentEditable ? (
          <DropdownButton
            text='Загрузить из Экстеор'
            icon={<IconUpload size='1rem' className='icon-red' />}
            disabled={isProcessing || hasInheritance}
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
            onClick={() => router.gotoNewItem()}
          />
        ) : null}
        {schema.oss.length > 0 ? (
          <div ref={ossRef} onBlur={handleOssBlur} className='relative w-full'>
            <DropdownButton
              text='Перейти к ОСС'
              className='w-full'
              icon={<IconOSS size='1rem' className='icon-primary' />}
              onClick={onOssToggle}
            />
            <Dropdown isOpen={isOssOpen} stretchTop stretchLeft margin='mt-1'>
              {schema.oss.map((reference, index) => (
                <DropdownButton
                  key={`${prefixes.oss_list}${index}`}
                  text={reference.alias}
                  className='min-w-30'
                  onClick={() => router.gotoOss(schema.oss[index].id)}
                />
              ))}
            </Dropdown>
          </div>
        ) : null}
        {schema.models.length > 0 ? (
          <div ref={modelRef} onBlur={handleModelBlur} className='relative w-full'>
            <DropdownButton
              text='Перейти к модели'
              className='w-full'
              icon={<IconRSModel size='1rem' className='icon-primary' />}
              onClick={onModelToggle}
            />
            <Dropdown isOpen={isModelOpen} stretchTop stretchLeft margin='mt-1'>
              {schema.models.map((reference, index) => (
                <DropdownButton
                  key={`${prefixes.oss_list}${index}`}
                  text={reference.alias}
                  className='min-w-30'
                  onClick={() => router.gotoRSModel(schema.models[index].id)}
                />
              ))}
            </Dropdown>
          </div>
        ) : null}
        <DropdownButton
          text='Библиотека'
          icon={<IconLibrary size='1rem' className='icon-primary' />}
          onClick={() => router.gotoLibrary()}
        />
      </Dropdown>
    </div>
  );
}
