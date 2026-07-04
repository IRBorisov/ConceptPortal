'use client';

import { useEffect, useEffectEvent, useState } from 'react';

import { useTx } from '@/i18n';
import { type Constituenta } from '@rsconcept/domain/library';
import { calculateSchemaStats, isSchemaIssue } from '@rsconcept/domain/library/rsform-api';

import { useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';
import { type ConstituentaBasicsDTO } from '@/features/rsform';
import { useClearAttributions } from '@/features/rsform/backend/use-clear-attributions';
import { useCreateAttribution } from '@/features/rsform/backend/use-create-attribution';
import { useCreateConstituentsBatch } from '@/features/rsform/backend/use-create-constituents-batch';
import { useDeleteAttribution } from '@/features/rsform/backend/use-delete-attribution';
import { useMoveConstituents } from '@/features/rsform/backend/use-move-constituents';
import { useMutatingRSForm } from '@/features/rsform/backend/use-mutating-rsform';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { useUpdateConstituenta } from '@/features/rsform/backend/use-update-constituenta';
import { MiniRSFormStats } from '@/features/rsform/components/mini-rsform-stats';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { useRsformDialogsStore } from '@/features/rsform/dialogs/rsform-dialog-store';
import { hasActiveCstFilter,useCstSearchStore } from '@/features/rsform/stores/cst-search';
import { buildCloneConstituentsBatch } from '@/features/rsform/utils/build-clone-batch';

import { MiniButton } from '@/components/control';
import { type DataTableRowDrop } from '@/components/data-table';
import { IconMoveDown, IconMoveUp } from '@/components/icons';
import { useFitHeight } from '@/stores/app-layout';
import { PARAMETER, prefixes } from '@/utils/constants';

import { ToolbarSchema } from './toolbar-schema';

interface ViewSchemaProps {
  schemaID: number;
  isMutable: boolean;
}

export function ViewSchema({ schemaID, isMutable }: ViewSchemaProps) {
  const tx = useTx();
  const { schema } = useRSForm({ itemID: schemaID });
  const [activeID, setActiveID] = useState<number | null>(null);
  const activeCst = activeID ? (schema.cstByID.get(activeID) ?? null) : null;
  const showEditCst = useRsformDialogsStore(state => state.showEditCst);
  const router = useConceptNavigation();
  const { findPredecessor } = useFindPredecessor();
  const { updateConstituenta } = useUpdateConstituenta();
  const { createAttribution } = useCreateAttribution();
  const { deleteAttribution } = useDeleteAttribution();
  const { clearAttributions } = useClearAttributions();
  const { moveConstituents } = useMoveConstituents();
  const { createConstituentsBatch } = useCreateConstituentsBatch();
  const isProcessing = useMutatingRSForm();
  const setCurrentSchema = useAIStore(state => state.setSchema);
  const onSetSchema = useEffectEvent(setCurrentSchema);
  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);
  const hasActiveFilter = hasActiveCstFilter(query, filter);
  const stats = calculateSchemaStats(schema);

  const listHeight = useFitHeight('14.5rem', '10rem');

  useEffect(
    function syncGlobalSchema() {
      onSetSchema(schema);
      return () => onSetSchema(null);
    },
    [schema]
  );

  function handleEditCst(cst: Constituenta) {
    showEditCst({
      schema: schema,
      target: cst,
      onEdit: data => {
        void updateConstituenta({ itemID: schema.id, data });
      },
      onEditSource: () => {
        void findPredecessor(cst.id).then(reference => router.gotoCstEdit(reference.schema, reference.id));
      },
      onAddAttribution: item =>
        void createAttribution({
          itemID: schema.id,
          data: { container: cst.id, attribute: item.id }
        }),
      onRemoveAttribution: item =>
        void deleteAttribution({
          itemID: schema.id,
          data: { container: cst.id, attribute: item.id }
        }),
      onClearAttributions: () =>
        void clearAttributions({
          itemID: schema.id,
          data: { target: cst.id }
        })
    });
  }

  function handleMoveUp() {
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

  function handleMoveDown() {
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

  function onCreateCst(newCst: ConstituentaBasicsDTO) {
    setActiveID(newCst.id);
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

  async function cloneConstituentsFromList(sources: Constituenta[], insertAfter: number | null) {
    const response = await createConstituentsBatch({
      itemID: schema.id,
      data: buildCloneConstituentsBatch(
        schema,
        sources.map(cst => cst.id),
        insertAfter
      )
    });
    const lastCst = response.cst_list[response.cst_list.length - 1];
    if (lastCst) {
      onCreateCst(lastCst);
    }
  }

  function handleRowsDropped(event: DataTableRowDrop<Constituenta>) {
    if (event.isClone) {
      void cloneConstituentsFromList(event.draggedRows, event.afterRow?.id ?? null);
      return;
    }
    const selected = event.draggedRows.map(cst => cst.id);
    const remaining = schema.items.filter(cst => !selected.includes(cst.id));
    const afterCst = event.afterRow;
    const afterIndex = afterCst === null ? -1 : remaining.findIndex(cst => cst.id === afterCst.id);
    if (afterCst !== null && afterIndex === -1) {
      return;
    }
    void moveConstituents({
      itemID: schema.id,
      data: {
        items: selected,
        move_to: afterIndex + 1
      }
    });
  }

  const canReorderConstituents = isMutable && !isProcessing && schema.items.length > 1 && !hasActiveFilter;

  return (
    <div className='grid h-full relative cc-fade-in mt-5' style={{ gridTemplateRows: '1fr auto' }}>
      <ToolbarSchema
        className='absolute -top-6.5 left-1'
        schema={schema}
        activeCst={activeCst}
        isMutable={isMutable}
        onEditActive={() => handleEditCst(activeCst!)}
        setActive={setActiveID}
        resetActive={() => setActiveID(null)}
      />

      <ViewConstituents
        noBorder
        className='border-y rounded-none'
        schema={schema}
        activeCst={activeCst}
        isSchemaIssue={isSchemaIssue}
        onActivate={cst => setActiveID(cst.id)}
        enableRowReordering={canReorderConstituents}
        onRowsDropped={handleRowsDropped}
        maxListHeight={listHeight}
        stopSearchKeyPropagation
        onDoubleClick={isMutable ? handleEditCst : undefined}
        sidebarActions={
          isMutable ? (
            <div className='flex pl-1'>
              <MiniButton
                title={tx('tx.general.moveUp')}
                className='px-0'
                icon={<IconMoveUp size='1.1rem' className='hover:icon-primary text-muted-foreground' />}
                onClick={handleMoveUp}
                disabled={!activeCst || !canReorderConstituents}
              />
              <MiniButton
                title={tx('tx.general.moveDown')}
                className='px-0'
                icon={<IconMoveDown size='1.1rem' className='hover:icon-primary text-muted-foreground' />}
                onClick={handleMoveDown}
                disabled={!activeCst || !canReorderConstituents}
              />
            </div>
          ) : null
        }
      />

      <MiniRSFormStats className='pr-4 py-2 -ml-4' stats={stats} />
    </div>
  );
}
