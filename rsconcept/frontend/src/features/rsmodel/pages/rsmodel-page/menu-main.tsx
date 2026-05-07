'use client';

import { toast } from 'react-toastify';

import { AccessPolicy, LocationHead } from '@/domain/library';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { buildModelToSchemaQuery, buildSiblingModelQuery } from '@/app/navigation/cross-rs-query';
import { useAuth } from '@/features/auth';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { createSandboxBundleFromRSModel } from '@/features/sandbox/models/bundle-transfer';
import { saveBundle } from '@/features/sandbox/stores/sandbox-repository';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconCalculateAll,
  IconClone,
  IconDestroy,
  IconLibrary,
  IconMenu,
  IconQR,
  IconRSForm,
  IconRSModel,
  IconSandbox,
  IconShare
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { generatePageQR, promptUnsaved, sharePage } from '@/utils/utils';

import { useModelEdit } from './model-edit-context';

export function MenuMain() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { model, deleteModel, isMutable, engine } = useModelEdit();
  const { schema, isProcessing } = useSchemaEdit();
  const isModified = useModificationStore(state => state.isModified);

  const { isAnonymous } = useAuth();

  const role = useRoleStore(state => state.role);

  const showQR = useDialogsStore(state => state.showQR);
  const showClone = useDialogsStore(state => state.showCloneLibraryItem);

  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  const {
    elementRef: otherModelsRef,
    isOpen: isOtherModelsOpen,
    toggle: toggleOtherModels,
    handleBlur: handleOtherModelsBlur,
    hide: hideOtherModels
  } = useDropdown();

  function handleDelete() {
    hideMenu();
    deleteModel();
  }

  function calculateCloneLocation() {
    const location = model.location;
    const head = location.substring(0, 2) as LocationHead;
    if (head === LocationHead.LIBRARY) {
      return LocationHead.USER;
    }
    return head === LocationHead.USER ? LocationHead.USER : location;
  }

  function handleShare() {
    hideMenu();
    sharePage();
  }

  function handleRecalculate() {
    hideMenu();
    engine.recalculateAll();
  }

  function handleShowQR() {
    hideMenu();
    showQR({ target: generatePageQR() });
  }

  function handleClone() {
    hideMenu();
    showClone({
      base: model,
      initialLocation: calculateCloneLocation(),
      selected: [],
      totalCount: schema.items.length
    });
  }

  function handleNavigateSchema(event: React.MouseEvent<HTMLButtonElement>) {
    hideMenu();
    event.preventDefault();
    event.stopPropagation();
    router.gotoRSForm(model.schema, undefined, event.ctrlKey || event.metaKey, buildModelToSchemaQuery());
  }

  function onOtherModelsToggle() {
    if (schema.models.length > 1) {
      toggleOtherModels();
    }
  }

  function handleGotoSiblingModel(modelID: number, event: React.MouseEvent<HTMLButtonElement>) {
    if (modelID === model.id) {
      return;
    }
    hideMenu();
    hideOtherModels();
    router.gotoRSModel(modelID, event.ctrlKey || event.metaKey, buildSiblingModelQuery());
  }

  async function handleTransferToSandbox() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    if (!window.confirm(tx('labels.prompt.resetSandbox'))) {
      return;
    }
    hideMenu();
    try {
      const nextBundle = createSandboxBundleFromRSModel(schema, model);
      await saveBundle(nextBundle);
      toast.success(tx('labels.info.sandboxImportSuccess'));
      router.gotoSandboxEditor();
    } catch (error) {
      console.error(error);
      toast.error(tx('labels.error.sandboxImportError'));
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
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text={tx('tx.model.recalculate')}
          aria-label={tx('tx.model.recalculate.hint')}
          icon={<IconCalculateAll size='1rem' className='icon-green' />}
          onClick={handleRecalculate}
        />
        <DropdownButton
          text={tx('tx.general.share')}
          title={tx('tx.general.share.link.clipboard')}
          icon={<IconShare size='1rem' className='icon-primary' />}
          onClick={handleShare}
          disabled={model.access_policy !== AccessPolicy.PUBLIC}
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
            onClick={handleClone}
          />
        ) : null}
        <DropdownButton
          text={tx('tx.sandbox.open')}
          icon={<IconSandbox size='1rem' className='icon-green' />}
          onClick={() => void handleTransferToSandbox()}
        />
        {isMutable ? (
          <DropdownButton
            text={tx('tx.model.delete')}
            icon={<IconDestroy size='1rem' className='icon-red' />}
            disabled={isProcessing || role < UserRole.OWNER}
            onClick={handleDelete}
          />
        ) : null}

        <Divider margins='mx-3 my-1' />

        {schema.models.length > 1 ? (
          <div ref={otherModelsRef} onBlur={handleOtherModelsBlur} className='relative w-full'>
            <DropdownButton
              text={tx('tx.model.goto')}
              className='w-full'
              icon={<IconRSModel size='1rem' className='icon-primary' />}
              onClick={onOtherModelsToggle}
            />
            <Dropdown isOpen={isOtherModelsOpen} stretchTop stretchLeft margin='mt-1'>
              {schema.models.map(reference => {
                const isCurrent = reference.id === model.id;
                return (
                  <DropdownButton
                    key={reference.id}
                    text={reference.alias}
                    className='min-w-30'
                    title={isCurrent ? tx('tx.model.current') : undefined}
                    disabled={isCurrent}
                    aria-current={isCurrent ? true : undefined}
                    onClick={event => handleGotoSiblingModel(reference.id, event)}
                  />
                );
              })}
            </Dropdown>
          </div>
        ) : null}
        <DropdownButton
          text={tx('tx.schema.goto')}
          icon={<IconRSForm size='1rem' className='icon-primary' />}
          onClick={handleNavigateSchema}
        />
        <DropdownButton
          text={tx('tx.lib.library')}
          icon={<IconLibrary size='1rem' className='icon-primary' />}
          onClick={() => router.gotoLibrary()}
        />
      </Dropdown>
    </div>
  );
}
