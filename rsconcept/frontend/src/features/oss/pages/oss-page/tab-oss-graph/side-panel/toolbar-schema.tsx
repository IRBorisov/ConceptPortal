'use client';

import { type Constituenta, CstType, type RSForm } from '@rsconcept/domain/library';
import { generateAlias } from '@rsconcept/domain/library/rsform-api';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type ConstituentaBasicsDTO, type CreateConstituentaDTO } from '@/features/rsform/backend/types';
import { useCreateConstituenta } from '@/features/rsform/backend/use-create-constituenta';
import { useDeleteConstituents } from '@/features/rsform/backend/use-delete-constituents';
import { useMutatingRSForm } from '@/features/rsform/backend/use-mutating-rsform';
import { useResetAliases } from '@/features/rsform/backend/use-reset-aliases';
import { useRestoreOrder } from '@/features/rsform/backend/use-restore-order';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconClone,
  IconDestroy,
  IconEdit,
  IconGenerateNames,
  IconNewItem,
  IconRSForm,
  IconSortList,
  IconTree,
  IconTypeGraph
} from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER, prefixes } from '@/utils/constants';

interface ToolbarSchemaProps {
  schema: RSForm;
  isMutable: boolean;
  activeCst: Constituenta | null;
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
  const tx = useTx();
  const { elementRef, isOpen, handleBlur, toggle, hide } = useDropdown();
  const router = useConceptNavigation();
  const isProcessing = useMutatingRSForm();

  const showCreateCst = useDialogsStore(state => state.showCreateCst);
  const showDeleteCst = useDialogsStore(state => state.showDeleteCst);
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);
  const showTermGraph = useDialogsStore(state => state.showShowTermGraph);
  const { createConstituenta } = useCreateConstituenta();
  const { deleteConstituents } = useDeleteConstituents();
  const { resetAliases } = useResetAliases();
  const { restoreOrder } = useRestoreOrder();

  function onCreateCst(newCst: ConstituentaBasicsDTO) {
    setActive(newCst.id);
    setTimeout(function scrollToCreatedConstituenta() {
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
    const data: CreateConstituentaDTO = {
      insert_after: activeCst?.id ?? null,
      crucial: false,
      cst_type: targetType,
      alias: generateAlias(targetType, schema),
      term_raw: '',
      typification_manual: '',
      value_is_property: false,
      definition_formal: '',
      definition_raw: '',
      convention: '',
      term_forms: []
    };
    showCreateCst({
      schema: schema,
      onCreate: value =>
        void createConstituenta({ itemID: schema.id, data: value }).then(response => onCreateCst(response.new_cst)),
      initial: data
    });
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
        typification_manual: activeCst.typification_manual,
        value_is_property: activeCst.value_is_property,
        convention: activeCst.convention,
        term_forms: activeCst.term_forms
      }
    }).then(response => onCreateCst(response.new_cst));
  }

  function promptDeleteCst() {
    if (!activeCst) {
      return;
    }
    showDeleteCst({
      schema: schema,
      selected: [activeCst.id],
      onDelete: deleted => {
        void deleteConstituents({
          itemID: schema.id,
          data: { items: deleted }
        }).then(resetActive);
      }
    });
  }

  function handleShowTypeGraph() {
    const typeInfo = schema.items
      .filter(item => item.effectiveType !== null)
      .map(item => ({
        alias: item.alias,
        type: item.effectiveType!
      }));
    showTypeGraph({ items: typeInfo });
  }

  function handleShowTermGraph() {
    showTermGraph({ schema });
  }

  function handleReindex() {
    hide();
    void resetAliases({ itemID: schema.id });
  }

  function handleRestoreOrder() {
    hide();
    void restoreOrder({ itemID: schema.id });
  }

  function handleOpenSchema(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    event.stopPropagation();
    router.gotoRSForm(schema.id, undefined, event.ctrlKey || event.metaKey);
  }

  return (
    <div className={cn('flex gap-0.5', className)}>
      <div ref={elementRef} onBlur={handleBlur} className='flex relative items-center'>
        <MiniButton
          title={tx('tx.schema.edit')}
          hideTitle={isOpen}
          icon={<IconRSForm size='1rem' className='icon-primary' />}
          onClick={toggle}
        />
        <Dropdown isOpen={isOpen} margin='mt-0.5'>
          <DropdownButton
            text={tx('tx.schema.order.restore')}
            title={tx('tx.schema.order.restore.hint')}
            icon={<IconSortList size='1rem' className='icon-primary' />}
            onClick={handleRestoreOrder}
            disabled={!isMutable || isProcessing}
          />
          <DropdownButton
            text={tx('tx.schema.order.rename')}
            title={tx('tx.schema.order.rename.hint')}
            icon={<IconGenerateNames size='1rem' className='icon-primary' />}
            onClick={handleReindex}
            disabled={!isMutable || isProcessing}
          />
          <DropdownButton
            title={tx('tx.schema.goto.hint')}
            text={tx('tx.schema.goto')}
            icon={<IconRSForm size='1rem' className='icon-primary' />}
            onClick={handleOpenSchema}
          />
        </Dropdown>
      </div>
      <MiniButton
        title={tx('tx.cst.edit')}
        icon={<IconEdit size='1rem' className='icon-primary' />}
        onClick={onEditActive}
        disabled={!isMutable || isProcessing || !activeCst}
      />
      <MiniButton
        title={tx('tx.cst.create')}
        icon={<IconNewItem size='1rem' className='icon-green' />}
        onClick={createCst}
        disabled={!isMutable || isProcessing}
      />
      <MiniButton
        title={tx('tx.cst.clone')}
        icon={<IconClone size='1rem' className='icon-green' />}
        onClick={cloneCst}
        disabled={!isMutable || !activeCst || isProcessing}
      />

      <MiniButton
        title={tx('tx.general.selection.selected.delete')}
        onClick={promptDeleteCst}
        icon={<IconDestroy size='1rem' className='icon-red' />}
        disabled={!isMutable || !activeCst || isProcessing || activeCst?.is_inherited}
      />

      <MiniButton
        icon={<IconTree size='1rem' className='hover:text-primary' />}
        title={tx('tx.termGraph')}
        onClick={handleShowTermGraph}
      />
      <MiniButton
        icon={<IconTypeGraph size='1rem' className='hover:text-primary' />}
        title={tx('tx.typeGraph')}
        onClick={handleShowTypeGraph}
      />

      <BadgeHelp topic={HelpTopic.UI_OSS_SIDEBAR} size='1rem' contentClass='sm:max-w-100' offset={4} />
    </div>
  );
}
