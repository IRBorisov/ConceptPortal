import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

import { Divider } from '@/components/container1';
import { Button } from '@/components/control1';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown1';
import {
  IconArchive,
  IconEdit2,
  IconGenerateNames,
  IconGenerateStructure,
  IconInlineSynthesis,
  IconReplace,
  IconSortList,
  IconTemplates
} from '@/components/icons1';
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
  const editMenu = useDropdown();
  const { schema, activeCst, setSelected, isArchive, isContentEditable, promptTemplate, deselectAll } = useRSEdit();
  const isProcessing = useMutatingRSForm();

  const { resetAliases } = useResetAliases();
  const { restoreOrder } = useRestoreOrder();
  const { produceStructure } = useProduceStructure();

  const showInlineSynthesis = useDialogsStore(state => state.showInlineSynthesis);
  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);

  function handleReindex() {
    editMenu.hide();
    void resetAliases({ itemID: schema.id });
  }

  function handleRestoreOrder() {
    editMenu.hide();
    void restoreOrder({ itemID: schema.id });
  }

  function handleSubstituteCst() {
    editMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showSubstituteCst({
      schema: schema,
      onSubstitute: data => setSelected(prev => prev.filter(id => !data.substitutions.find(sub => sub.original === id)))
    });
  }

  function handleTemplates() {
    editMenu.hide();
    promptTemplate();
  }

  function handleProduceStructure(targetCst: IConstituenta | null) {
    editMenu.hide();
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
        setSelected(cstList);
      }
    });
  }

  function handleInlineSynthesis() {
    editMenu.hide();
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
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        titleHtml='<b>Архив</b>: Редактирование запрещено<br />Перейти к актуальной версии'
        hideTitle={editMenu.isOpen}
        className='h-full px-2'
        icon={<IconArchive size='1.25rem' className='icon-primary' />}
        onClick={event => router.push({ path: urls.schema(schema.id), newTab: event.ctrlKey || event.metaKey })}
      />
    );
  }

  return (
    <div ref={editMenu.ref} className='relative'>
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        title='Редактирование'
        hideTitle={editMenu.isOpen}
        className='h-full px-2'
        icon={<IconEdit2 size='1.25rem' className={isContentEditable ? 'icon-green' : 'icon-red'} />}
        onClick={editMenu.toggle}
      />
      <Dropdown isOpen={editMenu.isOpen} margin='mt-3'>
        <DropdownButton
          text='Шаблоны'
          title='Создать конституенту из шаблона'
          icon={<IconTemplates size='1rem' className='icon-green' />}
          disabled={!isContentEditable || isProcessing}
          onClick={handleTemplates}
        />
        <DropdownButton
          text='Встраивание'
          titleHtml='Импортировать совокупность <br/>конституент из другой схемы'
          icon={<IconInlineSynthesis size='1rem' className='icon-green' />}
          disabled={!isContentEditable || isProcessing}
          onClick={handleInlineSynthesis}
        />

        <Divider margins='mx-3 my-1' />

        <DropdownButton
          text='Упорядочить список'
          titleHtml='Упорядочить список, исходя из <br/>логики типов и связей конституент'
          icon={<IconSortList size='1rem' className='icon-primary' />}
          disabled={!isContentEditable || isProcessing}
          onClick={handleRestoreOrder}
        />
        <DropdownButton
          text='Порядковые имена'
          titleHtml='Присвоить порядковые имена <br/>и обновить выражения'
          icon={<IconGenerateNames size='1rem' className='icon-primary' />}
          disabled={!isContentEditable || isProcessing}
          onClick={handleReindex}
        />
        <DropdownButton
          text='Порождение структуры'
          titleHtml='Раскрыть структуру типизации <br/>выделенной конституенты'
          icon={<IconGenerateStructure size='1rem' className='icon-primary' />}
          disabled={!isContentEditable || isProcessing || !activeCst || !canProduceStructure(activeCst)}
          onClick={() => handleProduceStructure(activeCst)}
        />
        <DropdownButton
          text='Отождествление'
          titleHtml='Заменить вхождения <br/>одной конституенты на другую'
          icon={<IconReplace size='1rem' className='icon-red' />}
          onClick={handleSubstituteCst}
          disabled={!isContentEditable || isProcessing}
        />
      </Dropdown>
    </div>
  );
}
