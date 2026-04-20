'use client';

import { useEffect, useEffectEvent, useState } from 'react';

import { type Constituenta } from '@/domain/library';
import { calculateSchemaStats, isProblematic } from '@/domain/library/rsform-api';

import { useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';
import { useClearAttributions } from '@/features/rsform/backend/use-clear-attributions';
import { useCreateAttribution } from '@/features/rsform/backend/use-create-attribution';
import { useDeleteAttribution } from '@/features/rsform/backend/use-delete-attribution';
import { useMoveConstituents } from '@/features/rsform/backend/use-move-constituents';
import { useMutatingRSForm } from '@/features/rsform/backend/use-mutating-rsform';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { useUpdateConstituenta } from '@/features/rsform/backend/use-update-constituenta';
import { MiniRSFormStats } from '@/features/rsform/components/mini-rsform-stats';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { useCstSearchStore } from '@/features/rsform/stores/cst-search';

import { MiniButton } from '@/components/control';
import { IconMoveDown, IconMoveUp } from '@/components/icons';
import { useFitHeight } from '@/stores/app-layout';
import { useDialogsStore } from '@/stores/dialogs';

import { ToolbarSchema } from './toolbar-schema';

interface ViewSchemaProps {
  schemaID: number;
  isMutable: boolean;
}

export function ViewSchema({ schemaID, isMutable }: ViewSchemaProps) {
  const { schema } = useRSForm({ itemID: schemaID });
  const [activeID, setActiveID] = useState<number | null>(null);
  const activeCst = activeID ? (schema.cstByID.get(activeID) ?? null) : null;
  const showEditCst = useDialogsStore(state => state.showEditCst);
  const router = useConceptNavigation();
  const { findPredecessor } = useFindPredecessor();
  const { updateConstituenta } = useUpdateConstituenta();
  const { createAttribution } = useCreateAttribution();
  const { deleteAttribution } = useDeleteAttribution();
  const { clearAttributions } = useClearAttributions();
  const { moveConstituents } = useMoveConstituents();
  const isProcessing = useMutatingRSForm();
  const setCurrentSchema = useAIStore(state => state.setSchema);
  const onSetSchema = useEffectEvent(setCurrentSchema);
  const searchText = useCstSearchStore(state => state.query);
  const hasSearch = searchText.length > 0;
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
        isProblematic={isProblematic}
        onActivate={cst => setActiveID(cst.id)}
        maxListHeight={listHeight}
        onDoubleClick={isMutable ? handleEditCst : undefined}
        sidebarActions={
          isMutable ? (
            <div className='flex pl-1'>
              <MiniButton
                title='Переместить вверх'
                className='px-0'
                icon={<IconMoveUp size='1.1rem' className='hover:icon-primary text-muted-foreground' />}
                onClick={handleMoveUp}
                disabled={!activeCst || isProcessing || schema.items.length < 2 || hasSearch}
              />
              <MiniButton
                title='Переместить вниз'
                className='px-0'
                icon={<IconMoveDown size='1.1rem' className='hover:icon-primary text-muted-foreground' />}
                onClick={handleMoveDown}
                disabled={!activeCst || isProcessing || schema.items.length < 2 || hasSearch}
              />
            </div>
          ) : null
        }
      />

      <MiniRSFormStats className='pr-4 py-2 -ml-4' stats={stats} />
    </div>
  );
}
