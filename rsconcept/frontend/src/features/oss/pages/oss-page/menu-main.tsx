'use client';

import { LocationHead } from '@/domain/library';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { useAuth } from '@/features/auth';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconClone, IconDestroy, IconLibrary, IconMenu, IconQR, IconShare } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { generatePageQR, sharePage } from '@/utils/utils';

import { useMutatingOss } from '../../backend/use-mutating-oss';

import { useOssEdit } from './oss-edit-context';

export function MenuMain() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { schema, isMutable, deleteSchema } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { user, isAnonymous } = useAuth();

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

  function handleClone() {
    hideMenu();
    const fallback = schema.location.startsWith(LocationHead.USER)
      ? `${LocationHead.USER}/clone`
      : `${schema.location}/clone`;
    const initialLocation = calculateCloneLocation();
    showClone({
      base: schema,
      initialLocation: initialLocation === schema.location ? fallback : initialLocation,
      selected: [],
      totalCount: 0
    });
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
        {!isAnonymous ? (
          <DropdownButton
            text={tx('tx.oss.clone')}
            title={tx('tx.oss.clone.hint')}
            icon={<IconClone size='1rem' className='icon-green' />}
            onClick={handleClone}
            disabled={isProcessing}
          />
        ) : null}
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
