'use client';

import { urls, useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type IConstituenta, type IRSForm } from '@/features/rsform';
import { CstType, type IConstituentaBasicsDTO, type ICreateConstituentaDTO } from '@/features/rsform/backend/types';
import { useCreateConstituenta } from '@/features/rsform/backend/use-create-constituenta';
import { useMoveConstituents } from '@/features/rsform/backend/use-move-constituents';
import { useMutatingRSForm } from '@/features/rsform/backend/use-mutating-rsform';
import { useResetAliases } from '@/features/rsform/backend/use-reset-aliases';
import { useRestoreOrder } from '@/features/rsform/backend/use-restore-order';
import { generateAlias } from '@/features/rsform/models/rsform-api';
import { useCstSearchStore } from '@/features/rsform/stores/cst-search';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconClone,
  IconDestroy,
  IconEdit,
  IconGenerateNames,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconRSForm,
  IconSortList,
  IconTree,
  IconTypeGraph
} from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER, prefixes } from '@/utils/constants';
import { type RO } from '@/utils/meta';

interface ToolbarSchemaProps {
  schema: IRSForm;
  isMutable: boolean;
  activeCst: IConstituenta | null;
  setActive: (cstID: number) => void;
  resetActive: () => void;
  onEditActive: () => void;
  className?: string;
}

export function ToolbarSchema({
  schema,
  activeCst,
  setActive,
  resetActive,
  onEditActive,
  isMutable,
  className
}: ToolbarSchemaProps) {
  const menuSchema = useDropdown();
  const router = useConceptNavigation();
  const isProcessing = useMutatingRSForm();
  const searchText = useCstSearchStore(state => state.query);
  const hasSearch = searchText.length > 0;

  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);
  const showTermGraph = useDialogsStore(state => state.showShowTermGraph);
  const { moveConstituents } = useMoveConstituents();
  const { createConstituenta } = useCreateConstituenta();
  const { resetAliases } = useResetAliases();
  const { restoreOrder } = useRestoreOrder();

  function navigateRSForm() {
    router.push({ path: urls.schema(schema.id) });
  }

  function onCreateCst(newCst: RO<IConstituentaBasicsDTO>) {
    setActive(newCst.id);
    setTimeout(() => {
      const element = document.getElementById(`${prefixes.cst_list}${newCst.id}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'end'
        });
      }
    }, PARAMETER.refreshTimeout);
  }

  function createCst() {
    const targetType = activeCst?.cst_type ?? CstType.BASE;
    const data: ICreateConstituentaDTO = {
      insert_after: activeCst?.id ?? null,
      crucial: false,
      cst_type: targetType,
      alias: generateAlias(targetType, schema),
      term_raw: '',
      definition_formal: '',
      definition_raw: '',
      convention: '',
      term_forms: []
    };
    showCreateCst({ schema: schema, onCreate: onCreateCst, initial: data });
  }

  function cloneCst() {
    if (!activeCst) {
      return;
    }
    void createConstituenta({
      itemID: schema.id,
      data: {
        insert_after: activeCst.id,
        crucial: activeCst.crucial,
        cst_type: activeCst.cst_type,
        alias: generateAlias(activeCst.cst_type, schema),
        term_raw: activeCst.term_raw,
        definition_formal: activeCst.definition_formal,
        definition_raw: activeCst.definition_raw,
        convention: activeCst.convention,
        term_forms: activeCst.term_forms
      }
    }).then(onCreateCst);
  }

  function promptDeleteCst() {
    if (!activeCst) {
      return;
    }
    showDeleteCst({
      schema: schema,
      selected: [activeCst.id],
      afterDelete: resetActive
    });
  }

  function moveUp() {
    if (!activeCst) {
      return;
    }
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (activeCst.id !== cst.id) {
        return prev;
      } else if (prev === -1) {
        return index;
      }
      return Math.min(prev, index);
    }, -1);
    const target = Math.max(0, currentIndex - 1);
    void moveConstituents({
      itemID: schema.id,
      data: {
        items: [activeCst.id],
        move_to: target
      }
    });
  }

  function moveDown() {
    if (!activeCst) {
      return;
    }
    let count = 0;
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (activeCst.id !== cst.id) {
        return prev;
      } else {
        count += 1;
        if (prev === -1) {
          return index;
        }
        return Math.max(prev, index);
      }
    }, -1);
    const target = Math.min(schema.items.length - 1, currentIndex - count + 2);
    void moveConstituents({
      itemID: schema.id,
      data: {
        items: [activeCst.id],
        move_to: target
      }
    });
  }

  function handleShowTypeGraph() {
    const typeInfo = schema.items
      .filter(item => !!item.parse)
      .map(item => ({
        alias: item.alias,
        result: item.parse!.typification,
        args: item.parse!.args
      }));
    showTypeGraph({ items: typeInfo });
  }

  function handleShowTermGraph() {
    showTermGraph({ schema: schema });
  }

  function handleReindex() {
    menuSchema.hide();
    void resetAliases({ itemID: schema.id });
  }

  function handleRestoreOrder() {
    menuSchema.hide();
    void restoreOrder({ itemID: schema.id });
  }

  return (
    <div className={cn('flex gap-0.5', className)}>
      <div ref={menuSchema.ref} onBlur={menuSchema.handleBlur} className='flex relative items-center'>
        <MiniButton
          title='Редактирование концептуальной схемы'
          hideTitle={menuSchema.isOpen}
          icon={<IconRSForm size='1rem' className='icon-primary' />}
          onClick={menuSchema.toggle}
        />
        <Dropdown isOpen={menuSchema.isOpen} margin='mt-0.5'>
          <DropdownButton
            text='Упорядочить список'
            titleHtml='Упорядочить список, исходя из <br/>логики типов и связей конституент'
            aria-label='Упорядочить список, исходя из логики типов и связей конституент'
            icon={<IconSortList size='1rem' className='icon-primary' />}
            onClick={handleRestoreOrder}
            disabled={!isMutable || isProcessing}
          />
          <DropdownButton
            text='Порядковые имена'
            titleHtml='Присвоить порядковые имена <br/>и обновить выражения'
            aria-label='Присвоить порядковые имена и обновить выражения'
            icon={<IconGenerateNames size='1rem' className='icon-primary' />}
            onClick={handleReindex}
            disabled={!isMutable || isProcessing}
          />
          <DropdownButton
            title='Перейти к концептуальной схеме'
            text='Открыть КС'
            icon={<IconRSForm size='1rem' className='icon-primary' />}
            onClick={navigateRSForm}
          />
        </Dropdown>
      </div>
      <MiniButton
        title='Редактировать конституенту'
        icon={<IconEdit size='1rem' className='icon-primary' />}
        onClick={onEditActive}
        disabled={!isMutable || isProcessing || !activeCst}
      />
      <MiniButton
        title='Создать конституенту'
        icon={<IconNewItem size='1rem' className='icon-green' />}
        onClick={createCst}
        disabled={!isMutable || isProcessing}
      />
      <MiniButton
        title='Клонировать конституенту'
        icon={<IconClone size='1rem' className='icon-green' />}
        onClick={cloneCst}
        disabled={!isMutable || !activeCst || isProcessing}
      />

      <MiniButton
        title='Удалить выделенную конституенту'
        onClick={promptDeleteCst}
        icon={<IconDestroy size='1rem' className='icon-red' />}
        disabled={!isMutable || !activeCst || isProcessing || activeCst?.is_inherited}
      />

      <MiniButton
        title='Переместить вверх'
        icon={<IconMoveUp size='1rem' className='icon-primary' />}
        onClick={moveUp}
        disabled={!isMutable || !activeCst || isProcessing || schema.items.length < 2 || hasSearch}
      />
      <MiniButton
        title='Переместить вниз'
        icon={<IconMoveDown size='1rem' className='icon-primary' />}
        onClick={moveDown}
        disabled={!isMutable || !activeCst || isProcessing || schema.items.length < 2 || hasSearch}
      />

      <MiniButton
        icon={<IconTree size='1rem' className='hover:text-primary' />}
        title='Граф термов'
        onClick={handleShowTermGraph}
      />
      <MiniButton
        icon={<IconTypeGraph size='1rem' className='hover:text-primary' />}
        title='Граф ступеней'
        onClick={handleShowTypeGraph}
      />

      <BadgeHelp topic={HelpTopic.UI_OSS_SIDEBAR} size='1rem' contentClass='sm:max-w-100' offset={4} />
    </div>
  );
}
