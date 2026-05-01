'use client';

import { toast } from 'react-toastify';

import { AccessPolicy, LocationHead } from '@/domain/library';
import { formatLabel, lid,useTx  } from '@/i18n';

import { useConceptNavigation } from '@/app';
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
    router.gotoRSForm(model.schema, undefined, event.ctrlKey || event.metaKey);
  }

  async function handleTransferToSandbox() {
    if (isModified && !promptUnsaved()) {
      return;
    }
    if (!window.confirm(formatLabel(lid.prompt.resetSandbox))) {
      return;
    }
    hideMenu();
    try {
      const nextBundle = createSandboxBundleFromRSModel(schema, model);
      await saveBundle(nextBundle);
      toast.success(formatLabel(lid.info.sandboxImportSuccess));
      router.gotoSandboxEditor();
    } catch (error) {
      console.error(error);
      toast.error(formatLabel(lid.error.sandboxImportError));
    }
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title={tx('ui.nav.menu', 'Menu')}
        hideTitle={isMenuOpen}
        icon={<IconMenu size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-primary cc-animate-color bg-transparent'
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text={tx('ui.action.recalculateModel', 'Recalculate model')}
          aria-label={tx('ui.aria.recalculateAll', 'Recalculate all results')}
          icon={<IconCalculateAll size='1rem' className='icon-green' />}
          onClick={handleRecalculate}
        />
        <DropdownButton
          text={tx('ui.action.share', 'Share')}
          title={formatLabel(
            model.access_policy === AccessPolicy.PUBLIC ? lid.tooltip.shareItemPublic : lid.tooltip.shareItemPrivate
          )}
          aria-label={tx('ui.aria.copyLinkToClipboard', 'Copy link to clipboard')}
          icon={<IconShare size='1rem' className='icon-primary' />}
          onClick={handleShare}
          disabled={model.access_policy !== AccessPolicy.PUBLIC}
        />
        <DropdownButton
          text={tx('ui.action.qrCode', 'QR code')}
          title={tx('ui.hint.qrSchemaPage', 'Show schema QR code')}
          icon={<IconQR size='1rem' className='icon-primary' />}
          onClick={handleShowQR}
        />
        {!isAnonymous ? (
          <DropdownButton
            text={tx('ui.action.clone', 'Clone')}
            icon={<IconClone size='1rem' className='icon-green' />}
            onClick={handleClone}
          />
        ) : null}
        <DropdownButton
          text={tx('ui.action.openInSandbox', 'Open in sandbox')}
          icon={<IconSandbox size='1rem' className='icon-green' />}
          onClick={() => void handleTransferToSandbox()}
        />
        {isMutable ? (
          <DropdownButton
            text={tx('ui.action.deleteModel', 'Delete model')}
            icon={<IconDestroy size='1rem' className='icon-red' />}
            disabled={isProcessing || role < UserRole.OWNER}
            onClick={handleDelete}
          />
        ) : null}

        <Divider margins='mx-3 my-1' />

        <DropdownButton
          text={tx('ui.nav.gotoSchema', 'Go to schema')}
          icon={<IconRSForm size='1rem' className='icon-primary' />}
          onClick={handleNavigateSchema}
        />
        <DropdownButton
          text={tx('ui.nav.library', 'Library')}
          icon={<IconLibrary size='1rem' className='icon-primary' />}
          onClick={() => router.gotoLibrary()}
        />
      </Dropdown>
    </div>
  );
}
