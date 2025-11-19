'use client';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

import { Divider } from '@/components/container';
import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconArchive,
  IconEdit2,
  IconGenerateNames,
  IconGenerateStructure,
  IconInlineSynthesis,
  IconReplace,
  IconSortList,
  IconTemplates
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { promptUnsaved } from '@/utils/utils';

import { useMutatingRSForm } from '../../backend/use-mutating-rsform';
import { useProduceStructure } from '../../backend/use-produce-structure';
import { useResetAliases } from '../../backend/use-reset-aliases';
import { useRestoreOrder } from '../../backend/use-restore-order';
import { type IConstituenta } from '../../models/rsform';
import { canProduceStructure } from '../../models/rsform-api';

import { useRSEdit } from './rsedit-context';

export function MenuEditSchema() {
  const { isAnonymous } = useAuthSuspense();
  const isModified = useModificationStore(state => state.isModified);
  const router = useConceptNavigation();
  const {
    elementRef: menuRef,
    isOpen: isMenuOpen,
    toggle: toggleMenu,
    handleBlur: handleMenuBlur,
    hide: hideMenu
  } = useDropdown();
  const {
    schema,
    activeCst,
    setSelectedCst: setSelected,
    isArchive,
    isContentEditable,
    promptTemplate,
    deselectAll
  } = useRSEdit();
  const isProcessing = useMutatingRSForm();

  const { resetAliases } = useResetAliases();
  const { restoreOrder } = useRestoreOrder();
  const { produceStructure } = useProduceStructure();

  const showInlineSynthesis = useDialogsStore(state => state.showInlineSynthesis);
  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);

  function handleReindex() {
    hideMenu();
    void resetAliases({ itemID: schema.id });
  }

  function handleRestoreOrder() {
    hideMenu();
    void restoreOrder({ itemID: schema.id });
  }

  function handleSubstituteCst() {
    hideMenu();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showSubstituteCst({
      schemaID: schema.id,
      onSubstitute: data => setSelected(prev => prev.filter(id => !data.substitutions.find(sub => sub.original === id)))
    });
  }

  function handleTemplates() {
    hideMenu();
    promptTemplate();
  }

  function handleProduceStructure(targetCst: IConstituenta | null) {
    hideMenu();
    if (!targetCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    void produceStructure({
      itemID: schema.id,
      cstID: targetCst.id
    }).then(cstList => {
      if (cstList.length !== 0) {
        setSelected([...cstList]);
      }
    });
  }

  function handleInlineSynthesis() {
    hideMenu();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showInlineSynthesis({
      receiverID: schema.id,
      onSynthesis: () => deselectAll()
    });
  }

  if (isAnonymous) {
    return null;
  }

  if (isArchive) {
    return (
      <MiniButton
        noPadding
        titleHtml='<b>Архив</b>: Редактирование запрещено<br />Перейти к актуальной версии'
        hideTitle={isMenuOpen}
        className='h-full px-3 bg-transparent'
        icon={<IconArchive size='1.25rem' className='icon-primary' />}
        onClick={event => router.push({ path: urls.schema(schema.id), newTab: event.ctrlKey || event.metaKey })}
      />
    );
  }

  return (
    <div ref={menuRef} onBlur={handleMenuBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title='Редактирование'
        hideTitle={isMenuOpen}
        className='h-full px-3 text-muted-foreground hover:text-primary cc-animate-color'
        icon={<IconEdit2 size='1.25rem' />}
        onClick={toggleMenu}
      />
      <Dropdown isOpen={isMenuOpen} margin='mt-3'>
        <DropdownButton
          text='Шаблоны'
          title='Создать конституенту из шаблона'
          icon={<IconTemplates size='1rem' className='icon-green' />}
          onClick={handleTemplates}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text='Встраивание'
          titleHtml='Импортировать совокупность <br/>конституент из другой схемы'
          aria-label='Импортировать совокупность конституент из другой схемы'
          icon={<IconInlineSynthesis size='1rem' className='icon-green' />}
          onClick={handleInlineSynthesis}
          disabled={!isContentEditable || isProcessing}
        />

        <Divider margins='mx-3 my-1' />

        <DropdownButton
          text='Упорядочить список'
          titleHtml='Упорядочить список, исходя из <br/>логики типов и связей конституент'
          aria-label='Упорядочить список, исходя из логики типов и связей конституент'
          icon={<IconSortList size='1rem' className='icon-primary' />}
          onClick={handleRestoreOrder}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text='Порядковые имена'
          titleHtml='Присвоить порядковые имена <br/>и обновить выражения'
          aria-label='Присвоить порядковые имена и обновить выражения'
          icon={<IconGenerateNames size='1rem' className='icon-primary' />}
          onClick={handleReindex}
          disabled={!isContentEditable || isProcessing}
        />
        <DropdownButton
          text='Раскрытие структуры'
          titleHtml='Породить внутренние понятия<br/> по структуре типизации<br/> выделенной конституенты'
          aria-label='Породить внутренние понятия по структуре типизации выделенной конституенты'
          icon={<IconGenerateStructure size='1rem' className='icon-primary' />}
          onClick={() => handleProduceStructure(activeCst)}
          disabled={!isContentEditable || isProcessing || !activeCst || !canProduceStructure(activeCst)}
        />
        <DropdownButton
          text='Отождествление'
          titleHtml='Заменить вхождения <br/>одной конституенты на другую'
          aria-label='Заменить вхождения одной конституенты на другую'
          icon={<IconReplace size='1rem' className='icon-red' />}
          onClick={handleSubstituteCst}
          disabled={!isContentEditable || isProcessing}
        />
      </Dropdown>
    </div>
  );
}
