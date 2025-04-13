import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/container';
import { Button } from '@/components/control';
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

  const menu = useDropdown();

  function handleDelete() {
    menu.hide();
    deleteSchema();
  }

  function handleShare() {
    menu.hide();
    sharePage();
  }

  function handleCreateNew() {
    router.push({ path: urls.create_schema });
  }

  function handleShowQR() {
    menu.hide();
    showQR({ target: generatePageQR() });
  }

  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className='relative'>
      <Button
        dense
        noBorder
        noOutline
        title='Меню'
        hideTitle={menu.isOpen}
        icon={<IconMenu size='1.25rem' className='cc-controls' />}
        className='h-full pl-2'
        onClick={menu.toggle}
      />
      <Dropdown isOpen={menu.isOpen} margin='mt-3'>
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
          onClick={() => router.push({ path: urls.library })}
        />
      </Dropdown>
    </div>
  );
}
