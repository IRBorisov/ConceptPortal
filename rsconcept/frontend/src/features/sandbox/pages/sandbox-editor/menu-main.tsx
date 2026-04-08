'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconDownload, IconMenu, IconNewItem, IconReset, IconUpload } from '@/components/icons';

import { type SandboxBundle } from '../../models/bundle';
import { createStarterSandboxBundle } from '../../models/bundle-starter';
import {
  downloadBundle,
  importBundleFromJson
} from '../../stores/sandbox-repository';

interface MenuMainProps {
  bundle: SandboxBundle;
  setBundle: React.Dispatch<React.SetStateAction<SandboxBundle | null>>;
}

export function MenuMain({ bundle, setBundle }: MenuMainProps) {
  const router = useConceptNavigation();
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
    downloadBundle(bundle);
  }

  function handleReset() {
    hideMenu();
    if (!window.confirm('Reset the sandbox bundle to the starter state?')) {
      return;
    }
    setBundle(createStarterSandboxBundle());
  }

  function handleImportClick() {
    hideMenu();
    fileInputRef.current?.click();
  }

  function handleCreateRSForm() {
    hideMenu();
    router.gotoNewItemFromSandbox();
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const next = await importBundleFromJson(raw);
      setBundle(next);
      toast.success('Sandbox bundle imported');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to import sandbox bundle');
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
          text='Создать RSForm'
          title='Создать новую концептуальную схему из текущих данных песочницы'
          icon={<IconNewItem size='1rem' className='icon-green' />}
          onClick={handleCreateRSForm}
        />
        <DropdownButton
          text='Сохранить в файл'
          title='Скачать текущие данные песочницы в JSON'
          icon={<IconDownload size='1rem' className='icon-primary' />}
          onClick={handleExport}
        />
        <DropdownButton
          text='Импортировать из файла'
          title='Загрузить данные песочницы из JSON'
          icon={<IconUpload size='1rem' className='icon-primary' />}
          onClick={handleImportClick}
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
