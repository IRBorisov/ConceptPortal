'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { useTx } from '@/i18n';
import { AccessPolicy, LocationHead } from '@rsconcept/domain/library';

import { useConceptNavigation, useUnsavedChanges } from '@/app';
import { buildSchemaToModelQuery } from '@/app/navigation/cross-rs-query';
import { useAuth } from '@/features/auth/backend/use-auth';
import { useLibraryDialogsStore } from '@/features/library/dialogs/library-dialog-store';
import { createSandboxBundleFromRSForm } from '@/features/sandbox/models/bundle-transfer';
import { saveBundle } from '@/features/sandbox/stores/sandbox-repository';
import { UserRole } from '@/features/users';
import { useRoleStore } from '@/features/users/stores/role';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconClone,
  IconDestroy,
  IconDownload,
  IconLibrary,
  IconMenu,
  IconOSS,
  IconPDF,
  IconQR,
  IconRSModel,
  IconSandbox,
  IconShare,
  IconUpload
} from '@/components/icons';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { EXTEOR_TRS_FILE, prefixes } from '@/utils/constants';
import { convertToJSON, generatePageQR, sharePage } from '@/utils/utils';

import { useUploadRSFormJson } from '../../backend/use-upload-json';
import { useUploadTRS } from '../../backend/use-upload-trs';
import { useRsformDialogsStore } from '../../dialogs/rsform-dialog-store';
import { rsFormContentToImportJson } from '../../models/json-file';
import { readRSFormImportJsonFile } from '../../models/parse-import-json';
import { prepareTRSFile } from '../../models/trs-file';

import { useSchemaEdit } from './schema-edit-context';

export function MenuMain() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { promptUnsaved } = useUnsavedChanges();
  const { schema, selectedCst, deleteSchema, isArchive, isMutable, isContentEditable, isProcessing } = useSchemaEdit();

  const { user, isAnonymous } = useAuth();
  const hasInheritance = schema.inheritance.some(item => item.child_source === schema.id);

  const role = useRoleStore(state => state.role);
  const isModified = useModificationStore(state => state.isModified);

  const { upload } = useUploadTRS();
  const { uploadJson } = useUploadRSFormJson();
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const showQR = useRsformDialogsStore(state => state.showQR);
  const showClone = useLibraryDialogsStore(state => state.showCloneLibraryItem);
  const showUpload = useRsformDialogsStore(state => state.showUploadRSForm);

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

  function handleCreateModel(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    hideMenu();
    router.gotoNewModel(schema.id, event.ctrlKey || event.metaKey);
  }

  function handleDelete() {
    hideMenu();
    deleteSchema();
  }

  async function handleDownload() {
    hideMenu();
    if (isModified) {
      const outcome = await promptUnsaved();
      if (outcome === 'cancel') {
        return;
      }
    }
    const fileName = (schema.alias ?? 'Schema') + EXTEOR_TRS_FILE;
    try {
      fileDownload(prepareTRSFile(schema), fileName);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDownloadJson() {
    hideMenu();
    if (isModified) {
      const outcome = await promptUnsaved();
      if (outcome === 'cancel') {
        return;
      }
    }
    try {
      const payload = rsFormContentToImportJson(schema);
      fileDownload(convertToJSON(payload), `${schema.alias ?? 'Schema'}.json`, 'application/json;charset=utf-8;');
    } catch (error) {
      console.error(error);
    }
  }

  function handleUpload() {
    hideMenu();
    showUpload({
      onUpload: data =>
        void upload({
          itemID: schema.id,
          data: data
        })
    });
  }

  function handleUploadJson() {
    hideMenu();
    jsonInputRef.current?.click();
  }

  async function handleJsonFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) {
      return;
    }
    if (isModified) {
      const outcome = await promptUnsaved();
      if (outcome === 'cancel') {
        return;
      }
    }
    if (!window.confirm(`${tx('tx.general.attention')} ${tx('tx.schema.upload.constituents')}`)) {
      return;
    }
    let data;
    try {
      data = await readRSFormImportJsonFile(file);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
      return;
    }
    try {
      await uploadJson({ itemID: schema.id, data });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleClone() {
    hideMenu();
    if (isModified) {
      const outcome = await promptUnsaved();
      if (outcome === 'cancel') {
        return;
      }
    }
    showClone({
      base: schema,
      initialLocation: calculateCloneLocation(),
      selected: selectedCst,
      totalCount: schema.items.length
    });
  }

  async function handleTransferToSandbox() {
    if (isModified) {
      const outcome = await promptUnsaved();
      if (outcome === 'cancel') {
        return;
      }
    }
    if (!window.confirm(tx('tx.sandbox.reset.confirm'))) {
      return;
    }
    hideMenu();
    try {
      const nextBundle = createSandboxBundleFromRSForm(schema);
      await saveBundle(nextBundle);
      toast.success(tx('tx.sandbox.import.success'));
      router.gotoSandboxEditor();
    } catch (error) {
      console.error(error);
      toast.error(tx('tx.sandbox.import.fail'));
    }
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
      const { createSchemaFile } = await import('@/services/pdf');
      const locale = usePreferencesStore.getState().locale;
      const blob = await createSchemaFile(schema, locale);
      fileDownload(blob, `${filename}.pdf`, 'application/pdf;charset=utf-8;');
    } catch (error) {
      toast.error(tx('tx.general.download.pdf.fail'));
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
      hideMenu();
      router.gotoRSModel(schema.models[0].id, undefined, buildSchemaToModelQuery());
    }
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title={tx('tx.general.menu')}
        hideTitle={isMenuOpen}
        icon={<IconMenu size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-primary cc-animate-color bg-transparent'
        onClick={toggleMenu}
      />
      <input
        ref={jsonInputRef}
        type='file'
        accept='application/json,.json'
        className='hidden'
        onChange={event => void handleJsonFile(event)}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text={tx('tx.general.share')}
          title={tx('tx.general.share.link.clipboard')}
          icon={<IconShare size='1rem' className='icon-primary' />}
          onClick={handleShare}
          disabled={schema.access_policy !== AccessPolicy.PUBLIC}
        />
        <DropdownButton
          text={tx('tx.general.qrCode')}
          title={tx('tx.general.qrCode.hint')}
          icon={<IconQR size='1rem' className='icon-primary' />}
          onClick={handleShowQR}
        />
        {!isAnonymous ? (
          <DropdownButton
            text={tx('tx.general.clone')}
            icon={<IconClone size='1rem' className='icon-green' />}
            disabled={isArchive}
            onClick={() => void handleClone()}
          />
        ) : null}
        {!isAnonymous ? (
          <DropdownButton
            text={tx('tx.model.create')}
            icon={<IconRSModel size='1rem' className={isArchive ? '' : 'text-accent-orange'} />}
            disabled={isArchive}
            onClick={handleCreateModel}
          />
        ) : null}
        <DropdownButton
          text={tx('tx.sandbox.import')}
          icon={<IconSandbox size='1rem' className='icon-green' />}
          onClick={() => void handleTransferToSandbox()}
        />
        <DropdownButton
          text={tx('tx.general.download.pdf')}
          icon={<IconPDF size='1rem' className='icon-primary' />}
          onClick={() => void handleSavePDF()}
        />
        <DropdownButton
          text={tx('tx.general.download.toExteor')}
          icon={<IconDownload size='1rem' className='icon-primary' />}
          onClick={() => void handleDownload()}
        />
        <DropdownButton
          text={tx('tx.general.download.json')}
          icon={<IconDownload size='1rem' className='icon-primary' />}
          onClick={() => void handleDownloadJson()}
        />
        {isContentEditable ? (
          <DropdownButton
            text={tx('tx.general.load.fromExteor')}
            icon={<IconUpload size='1rem' className='icon-red' />}
            disabled={isProcessing || hasInheritance}
            onClick={handleUpload}
          />
        ) : null}
        {isContentEditable ? (
          <DropdownButton
            text={tx('tx.general.load.fromJson')}
            icon={<IconUpload size='1rem' className='icon-red' />}
            disabled={isProcessing || hasInheritance}
            onClick={handleUploadJson}
          />
        ) : null}
        {isMutable ? (
          <DropdownButton
            text={tx('tx.schema.delete')}
            icon={<IconDestroy size='1rem' className='icon-red' />}
            disabled={isProcessing || role < UserRole.OWNER}
            onClick={handleDelete}
          />
        ) : null}

        <Divider margins='mx-3 my-1' />

        {schema.oss.length > 0 ? (
          <div ref={ossRef} onBlur={handleOssBlur} className='relative w-full'>
            <DropdownButton
              text={tx('tx.oss.goto')}
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
              text={tx('tx.model.goto')}
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
                  onClick={event => {
                    hideMenu();
                    router.gotoRSModel(
                      schema.models[index].id,
                      event.ctrlKey || event.metaKey,
                      buildSchemaToModelQuery()
                    );
                  }}
                />
              ))}
            </Dropdown>
          </div>
        ) : null}
        <DropdownButton
          text={tx('tx.lib.library')}
          icon={<IconLibrary size='1rem' className='icon-primary' />}
          onClick={() => router.gotoLibrary()}
        />
      </Dropdown>
    </div>
  );
}
