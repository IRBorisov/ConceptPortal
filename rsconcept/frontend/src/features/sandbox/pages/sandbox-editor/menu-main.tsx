'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { LibraryItemType } from '@/domain/library';

import { useConceptNavigation } from '@/app';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconCalculateAll,
  IconDownload,
  IconMenu,
  IconReset,
  IconRSForm,
  IconRSModel,
  IconUpload
} from '@/components/icons';
import { errorMsg, infoMsg, promptText } from '@/utils/labels';

import { useSandboxBundle } from '../../context/bundle-context';

export function MenuMain() {
  const router = useConceptNavigation();
  const { resetBundle, importBundle, exportBundle } = useSandboxBundle();
  const { engine } = useSandboxBundle();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();

  function handleExport() {
    hideMenu();
    exportBundle();
  }

  function handleReset() {
    hideMenu();
    if (!window.confirm(promptText.resetSandbox)) {
      return;
    }
    resetBundle();
  }

  function handleImportClick() {
    hideMenu();
    fileInputRef.current?.click();
  }

  function handleCreateRSForm() {
    hideMenu();
    router.gotoNewItemFromSandbox(LibraryItemType.RSFORM);
  }

  function handleCreateRSModel() {
    hideMenu();
    router.gotoNewItemFromSandbox(LibraryItemType.RSMODEL);
  }

  function handleRecalculate() {
    hideMenu();
    engine.recalculateAll();
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const raw = JSON.parse(await file.text()) as unknown;
      await importBundle(raw);
      toast.success(infoMsg.sandboxImportSuccess);
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
        title='Меню песочницы'
        hideTitle={isMenuOpen}
        className='h-full pl-2 text-muted-foreground hover:text-primary cc-animate-color bg-transparent'
        icon={<IconMenu size='1.25rem' />}
        onClick={toggleMenu}
      />
      <input
        ref={fileInputRef}
        type='file'
        accept='application/json,.json'
        className='hidden'
        onChange={event => void handleImportFile(event)}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text='Пересчитать модель'
          aria-label='Пересчитать все вычисления'
          icon={<IconCalculateAll size='1rem' className='icon-green' />}
          onClick={handleRecalculate}
        />
        <DropdownButton
          text='Сохранить в файл'
          title='Скачать текущие данные песочницы в JSON'
          icon={<IconDownload size='1rem' className='icon-primary' />}
          onClick={handleExport}
        />
        <DropdownButton
          text='Загрузить из файла'
          title='Загрузить данные песочницы из JSON'
          icon={<IconUpload size='1rem' className='icon-primary' />}
          onClick={handleImportClick}
        />
        <DropdownButton
          text='Создать схему'
          title='Создать новую концептуальную схему из текущих данных песочницы'
          icon={<IconRSForm size='1rem' className='icon-green' />}
          onClick={handleCreateRSForm}
        />
        <DropdownButton
          text='Создать модель'
          title='Создать новую концептуальную схему и модель из текущих данных песочницы'
          icon={<IconRSModel size='1rem' className='text-accent-orange' />}
          onClick={handleCreateRSModel}
        />
        <Divider margins='mx-3 my-1' />
        <DropdownButton
          text='Сбросить состояние'
          title='Восстановить стартовые данные песочницы'
          icon={<IconReset size='1rem' className='icon-red' />}
          onClick={handleReset}
        />
      </Dropdown>
    </div>
  );
}
