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
  const { isModified } = useModificationStore();
  const router = useConceptNavigation();
  const menu = useDropdown();
  const { schema, activeCst, setSelected, isArchive, isContentEditable, promptTemplate, deselectAll } = useRSEdit();
  const isProcessing = useMutatingRSForm();

  const { resetAliases } = useResetAliases();
  const { restoreOrder } = useRestoreOrder();
  const { produceStructure } = useProduceStructure();

  const showInlineSynthesis = useDialogsStore(state => state.showInlineSynthesis);
  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);

  function handleReindex() {
    menu.hide();
    void resetAliases({ itemID: schema.id });
  }

  function handleRestoreOrder() {
    menu.hide();
    void restoreOrder({ itemID: schema.id });
  }

  function handleSubstituteCst() {
    menu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showSubstituteCst({
      schema: schema,
      onSubstitute: data => setSelected(prev => prev.filter(id => !data.substitutions.find(sub => sub.original === id)))
    });
  }

  function handleTemplates() {
    menu.hide();
    promptTemplate();
  }

  function handleProduceStructure(targetCst: IConstituenta | null) {
    menu.hide();
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
    menu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showInlineSynthesis({
      receiver: schema,
      onSynthesis: () => deselectAll()
    });
  }

  if (isAnonymous) {
    return null;
  }

  if (isArchive) {
    return (
      <MiniButton
        noHover
        noPadding
        titleHtml='<b>Архив</b>: Редактирование запрещено<br />Перейти к актуальной версии'
        hideTitle={menu.isOpen}
        className='h-full px-3 bg-transparent'
        icon={<IconArchive size='1.25rem' className='icon-primary' />}
        onClick={event => router.push({ path: urls.schema(schema.id), newTab: event.ctrlKey || event.metaKey })}
      />
    );
  }

  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title='Редактирование'
        hideTitle={menu.isOpen}
        className='h-full px-3 bg-transparent text-muted-foreground hover:text-primary'
        icon={<IconEdit2 size='1.25rem' />}
        onClick={menu.toggle}
      />
      <Dropdown isOpen={menu.isOpen} margin='mt-3'>
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
          text='Порождение структуры'
          titleHtml='Раскрыть структуру типизации <br/>выделенной конституенты'
          aria-label='Раскрыть структуру типизации выделенной конституенты'
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
