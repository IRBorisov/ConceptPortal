'use client';

import { useEffect, useState } from 'react';

import { useAIStore } from '@/features/ai/stores/ai-context';
import { type Constituenta } from '@/features/rsform';
import { useRSFormSuspense } from '@/features/rsform/backend/use-rsform';
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
  const { schema } = useRSFormSuspense({ itemID: schemaID });
  const [activeID, setActiveID] = useState<number | null>(null);
  const activeCst = activeID ? schema.cstByID.get(activeID) ?? null : null;
  const showEditCst = useDialogsStore(state => state.showEditCst);
  const setCurrentSchema = useAIStore(state => state.setSchema);
  const stats = calculateSchemaStats(schema);

  const listHeight = useFitHeight('14.5rem', '10rem');

  useEffect(() => {
    setCurrentSchema(schema);
    return () => setCurrentSchema(null);
  }, [schema, setCurrentSchema]);

  function handleEditCst(cst: Constituenta) {
    showEditCst({ schemaID: schema.id, targetID: cst.id });
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
