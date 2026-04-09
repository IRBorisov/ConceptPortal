'use client';

import { useEffect, useEffectEvent, useState } from 'react';

import { useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';
import { type Constituenta } from '@/features/rsform';
import { useClearAttributions } from '@/features/rsform/backend/use-clear-attributions';
import { useCreateAttribution } from '@/features/rsform/backend/use-create-attribution';
import { useDeleteAttribution } from '@/features/rsform/backend/use-delete-attribution';
import { useRSForm } from '@/features/rsform/backend/use-rsform';
import { useUpdateConstituenta } from '@/features/rsform/backend/use-update-constituenta';
import { CardRSFormStats } from '@/features/rsform/components/rsform-stats';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { calculateSchemaStats } from '@/features/rsform/models/rsform-api';

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
  const activeCst = activeID ? schema.cstByID.get(activeID) ?? null : null;
  const showEditCst = useDialogsStore(state => state.showEditCst);
  const router = useConceptNavigation();
  const { findPredecessor } = useFindPredecessor();
  const { updateConstituenta } = useUpdateConstituenta();
  const { createAttribution } = useCreateAttribution();
  const { deleteAttribution } = useDeleteAttribution();
  const { clearAttributions } = useClearAttributions();
  const setCurrentSchema = useAIStore(state => state.setSchema);
  const onSetSchema = useEffectEvent(setCurrentSchema);
  const stats = calculateSchemaStats(schema);

  const listHeight = useFitHeight('14.5rem', '10rem');

  useEffect(function syncGlobalSchema() {
    onSetSchema(schema);
    return () => onSetSchema(null);
  }, [schema]);

  function handleEditCst(cst: Constituenta) {
    showEditCst({
      schema: schema,
      target: cst,
      onEdit: data => {
        void updateConstituenta({ itemID: schema.id, data });
      },
      onEditSource: () => {
        void findPredecessor(cst.id).then(reference =>
          router.gotoCstEdit(reference.schema, reference.id)
        );
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
        dense
        noBorder
        className='border-y rounded-none'
        schema={schema}
        activeCst={activeCst}
        onActivate={cst => setActiveID(cst.id)}
        maxListHeight={listHeight}
        onDoubleClick={isMutable ? handleEditCst : undefined}
      />

      <CardRSFormStats className='pr-4 py-2 -ml-4' stats={stats} />
    </div>
  );
}
