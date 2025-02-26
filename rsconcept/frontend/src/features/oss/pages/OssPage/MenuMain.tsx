import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useRoleStore, UserRole } from '@/features/users';

import { Divider } from '@/components/Container';
import { Button } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { IconDestroy, IconLibrary, IconMenu, IconNewItem, IconQR, IconShare } from '@/components/Icons';
import { useDialogsStore } from '@/stores/dialogs';
import { generatePageQR, sharePage } from '@/utils/utils';

import { useMutatingOss } from '../../backend/useMutatingOss';

import { useOssEdit } from './OssEditContext';

export function MenuMain() {
  const router = useConceptNavigation();
  const { isMutable, deleteSchema } = useOssEdit();
  const isProcessing = useMutatingOss();

  const { isAnonymous } = useAuthSuspense();

  const role = useRoleStore(state => state.role);

  const showQR = useDialogsStore(state => state.showQR);

  const schemaMenu = useDropdown();

  function handleDelete() {
    schemaMenu.hide();
    deleteSchema();
  }

  function handleShare() {
    schemaMenu.hide();
    sharePage();
  }

  function handleCreateNew() {
    router.push({ path: urls.create_schema });
  }

  function handleShowQR() {
    schemaMenu.hide();
    showQR({ target: generatePageQR() });
  }

  return (
    <div ref={schemaMenu.ref}>
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        title='Меню'
        hideTitle={schemaMenu.isOpen}
        icon={<IconMenu size='1.25rem' className='clr-text-controls' />}
        className='h-full pl-2'
        onClick={schemaMenu.toggle}
      />
      <Dropdown isOpen={schemaMenu.isOpen}>
        <DropdownButton
          text='Поделиться'
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
            disabled={isProcessing || role < UserRole.OWNER}
            onClick={handleDelete}
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
