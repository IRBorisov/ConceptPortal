'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { LocationHead } from '@rsconcept/domain/library';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { useCreateFromSandbox } from '@/features/library/backend/use-create-from-sandbox';

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

import { useSandboxBundle } from '../../context/bundle-context';

export function MenuMain() {
  const tx = useTx();
  const router = useConceptNavigation();
  const { resetBundle, importBundle, exportBundle, engine, bundle } = useSandboxBundle();
  const { createRSFormFromSandbox, createRSModelFromSandbox } = useCreateFromSandbox();
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
    if (!window.confirm(tx('tx.sandbox.reset.confirm'))) {
      return;
    }
    resetBundle();
  }

  function handleImportClick() {
    hideMenu();
    fileInputRef.current?.click();
  }

  async function handleCreateRSForm() {
    hideMenu();
    try {
      const created = await createRSFormFromSandbox({
        item_data: {
          title: bundle.schema.title,
          alias: bundle.schema.alias,
          description: bundle.schema.description,
          visible: bundle.schema.visible,
          read_only: bundle.schema.read_only,
          access_policy: bundle.schema.access_policy,
          location: LocationHead.USER
        },
        schema_data: {
          items: bundle.schema.items,
          attribution: bundle.schema.attribution
        }
      });
      router.gotoRSForm(created.id);
    } catch (error) {
      console.error(error);
      toast.error(tx('tx.sandbox.export.schema.fail'));
    }
  }

  async function handleCreateRSModel() {
    hideMenu();
    try {
      const created = await createRSModelFromSandbox({
        item_data: {
          title: bundle.model.title,
          alias: bundle.model.alias,
          description: bundle.model.description,
          visible: bundle.model.visible,
          read_only: bundle.model.read_only,
          access_policy: bundle.model.access_policy,
          location: LocationHead.USER
        },
        schema_data: {
          items: bundle.schema.items,
          attribution: bundle.schema.attribution
        },
        model_data: {
          items: bundle.model.items
        }
      });
      router.gotoRSModel(created.id);
    } catch (error) {
      console.error(error);
      toast.error(tx('tx.sandbox.export.model.fail'));
    }
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
      toast.success(tx('tx.sandbox.import.success'));
    } catch (error) {
      console.error(error);
      toast.error(tx('tx.sandbox.import.fail'));
    }
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title={tx('tx.general.menu')}
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
          text={tx('tx.model.recalculate')}
          aria-label={tx('tx.model.recalculate.hint')}
          icon={<IconCalculateAll size='1rem' className='icon-green' />}
          onClick={handleRecalculate}
        />
        <DropdownButton
          text={tx('tx.general.download.file')}
          title={tx('tx.sandbox.bundle.save.file')}
          icon={<IconDownload size='1rem' className='icon-primary' />}
          onClick={handleExport}
        />
        <DropdownButton
          text={tx('tx.general.load.fromFile')}
          title={tx('tx.sandbox.bundle.load.file')}
          icon={<IconUpload size='1rem' className='icon-primary' />}
          onClick={handleImportClick}
        />
        <DropdownButton
          text={tx('tx.schema.create')}
          title={tx('tx.sandbox.export.schema')}
          icon={<IconRSForm size='1rem' className='icon-green' />}
          onClick={() => void handleCreateRSForm()}
        />
        <DropdownButton
          text={tx('tx.model.create')}
          title={tx('tx.sandbox.export.model')}
          icon={<IconRSModel size='1rem' className='text-accent-orange' />}
          onClick={() => void handleCreateRSModel()}
        />
        <Divider margins='mx-3 my-1' />
        <DropdownButton
          text={tx('tx.general.resetAll')}
          title={tx('tx.sandbox.reset')}
          icon={<IconReset size='1rem' className='icon-red' />}
          onClick={handleReset}
        />
      </Dropdown>
    </div>
  );
}
