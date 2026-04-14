'use client';

import { toast } from 'react-toastify';

import { AccessPolicy, LocationHead } from '@/domain/library';

import { useConceptNavigation } from '@/app';
import { useAuth } from '@/features/auth';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
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
  IconNewItem,
  IconQR,
  IconRSForm,
  IconSandbox,
  IconShare
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg, infoMsg, promptText, tooltipText } from '@/utils/labels';
import { generatePageQR, sharePage } from '@/utils/utils';

import { useRSModelEdit } from './rsmodel-context';

export function MenuMain() {
  const router = useConceptNavigation();
  const { model, deleteModel, isMutable, engine } = useRSModelEdit();
  const { schema, isProcessing } = useRSFormEdit();

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
    if (!window.confirm(promptText.resetSandbox)) {
      return;
    }
    hideMenu();
    try {
      const nextBundle = createSandboxBundleFromRSModel(schema, model);
      await saveBundle(nextBundle);
      toast.success(infoMsg.sandboxImportSuccess);
      router.gotoSandboxEditor();
    } catch (error) {
      console.error(error);
      toast.error(errorMsg.sandboxImportError);
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
          text='Пересчитать модель'
          aria-label='Пересчитать все вычисления'
          icon={<IconCalculateAll size='1rem' className='icon-green' />}
          onClick={handleRecalculate}
        />
        <DropdownButton
          text='Поделиться'
          titleHtml={tooltipText.shareItem(model.access_policy === AccessPolicy.PUBLIC)}
          aria-label='Скопировать ссылку в буфер обмена'
          icon={<IconShare size='1rem' className='icon-primary' />}
          onClick={handleShare}
          disabled={model.access_policy !== AccessPolicy.PUBLIC}
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
            onClick={handleClone}
          />
        ) : null}
        <DropdownButton
          text='Открыть в песочнице'
          icon={<IconSandbox size='1rem' className='icon-green' />}
          onClick={() => void handleTransferToSandbox()}
        />
        {isMutable ? (
          <DropdownButton
            text='Удалить модель'
            icon={<IconDestroy size='1rem' className='icon-red' />}
            disabled={isProcessing || role < UserRole.OWNER}
            onClick={handleDelete}
          />
        ) : null}

        <Divider margins='mx-3 my-1' />

        <DropdownButton
          text='Перейти к схеме'
          icon={<IconRSForm size='1rem' className='icon-primary' />}
          onClick={handleNavigateSchema}
        />
        {!isAnonymous ? (
          <DropdownButton
            text='Создать новую схему'
            icon={<IconNewItem size='1rem' className='icon-primary' />}
            onClick={() => router.gotoNewItem()}
          />
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
