import { urls, useConceptNavigation } from '@/app';
import { type IConstituenta, type IRSForm } from '@/features/rsform';
import { CstType, type IConstituentaBasicsDTO, type ICreateConstituentaDTO } from '@/features/rsform/backend/types';
import { useCreateConstituenta } from '@/features/rsform/backend/use-create-constituenta';
import { useMoveConstituents } from '@/features/rsform/backend/use-move-constituents';
import { useMutatingRSForm } from '@/features/rsform/backend/use-mutating-rsform';
import { generateAlias } from '@/features/rsform/models/rsform-api';
import { useCstSearchStore } from '@/features/rsform/stores/cst-search';

import { MiniButton } from '@/components/control';
import {
  IconClone,
  IconDestroy,
  IconEdit2,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconRSForm,
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
    const typeInfo = schema.items.map(item => ({
      alias: item.alias,
      result: item.parse.typification,
      args: item.parse.args
    }));
    showTypeGraph({ items: typeInfo });
  }

  function handleShowTermGraph() {
    showTermGraph({ schema: schema });
  }

  return (
    <div className={cn('flex gap-0.5', className)}>
      <MiniButton
        title='Перейти к концептуальной схеме'
        icon={<IconRSForm size='1rem' className='icon-primary' />}
        onClick={navigateRSForm}
      />

      <MiniButton
        title='Редактировать конституенту'
        icon={<IconEdit2 size='1rem' className='icon-primary' />}
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
    </div>
  );
}
