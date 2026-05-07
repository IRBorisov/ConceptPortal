'use client';

import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconDestroy, IconLibrary, IconMenu, IconQR, IconShare } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { generatePageQR, sharePage } from '@/utils/utils';

import { useMutatingOss } from '../../backend/use-mutating-oss';

import { useOssEdit } from './oss-edit-context';

export function MenuMain() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { isMutable, deleteSchema } = useOssEdit();
  const isProcessing = useMutatingOss();

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
        title={tx('tx.general.menu')}
        hideTitle={isMenuOpen}
        icon={<IconMenu size='1.25rem' />}
        className='h-full px-2 text-muted-foreground hover:text-primary cc-animate-color'
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text={tx('tx.general.share')}
          title={tx('tx.general.share.link.clipboard')}
          icon={<IconShare size='1rem' className='icon-primary' />}
          onClick={handleShare}
        />
        <DropdownButton
          text={tx('tx.general.qrCode')}
          title={tx('tx.general.qrCode.hint')}
          icon={<IconQR size='1rem' className='icon-primary' />}
          onClick={handleShowQR}
        />
        {isMutable ? (
          <DropdownButton
            text={tx('tx.schema.delete')}
            icon={<IconDestroy size='1rem' className='icon-red' />}
            onClick={handleDelete}
            disabled={isProcessing || role < UserRole.OWNER}
          />
        ) : null}

        <Divider margins='mx-3 my-1' />

        <DropdownButton
          text={tx('tx.lib.library')}
          icon={<IconLibrary size='1rem' className='icon-primary' />}
          onClick={handleOpenLibrary}
        />
      </Dropdown>
    </div>
  );
}
