'use client';

import { useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconDestroy, IconLibrary, IconMenu, IconNewItem, IconQR, IconShare } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { generatePageQR, sharePage } from '@/utils/utils';

import { useMutatingOss } from '../../backend/use-mutating-oss';

import { useOssEdit } from './oss-edit-context';

export function MenuMain() {
  const router = useConceptNavigation();
  const { isMutable, deleteSchema } = useOssEdit();
  const isProcessing = useMutatingOss();

  const { isAnonymous } = useAuthSuspense();

  const role = useRoleStore(state => state.role);

  const showQR = useDialogsStore(state => state.showQR);

  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  function handleDelete() {
    hideMenu();
    deleteSchema();
  }

  function handleShare() {
    hideMenu();
    sharePage();
  }

  function handleCreateNew() {
    router.gotoNewItem();
  }

  function handleOpenLibrary() {
    router.gotoLibrary();
  }

  function handleShowQR() {
    hideMenu();
    showQR({ target: generatePageQR() });
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title='Меню'
        hideTitle={isMenuOpen}
        icon={<IconMenu size='1.25rem' />}
        className='h-full px-2 text-muted-foreground hover:text-primary cc-animate-color'
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text='Поделиться'
          title='Скопировать ссылку в буфер обмена'
          icon={<IconShare size='1rem' className='icon-primary' />}
          onClick={handleShare}
        />
        <DropdownButton
          text='QR-код'
          title='Показать QR-код схемы'
          icon={<IconQR size='1rem' className='icon-primary' />}
          onClick={handleShowQR}
        />
        {isMutable ? (
          <DropdownButton
            text='Удалить схему'
            icon={<IconDestroy size='1rem' className='icon-red' />}
            onClick={handleDelete}
            disabled={isProcessing || role < UserRole.OWNER}
          />
        ) : null}

        <Divider margins='mx-3 my-1' />

        {!isAnonymous ? (
          <DropdownButton
            text='Создать новую схему'
            icon={<IconNewItem size='1rem' className='icon-primary' />}
            onClick={handleCreateNew}
          />
        ) : null}
        <DropdownButton
          text='Библиотека'
          icon={<IconLibrary size='1rem' className='icon-primary' />}
          onClick={handleOpenLibrary}
        />
      </Dropdown>
    </div>
  );
}
