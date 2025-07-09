import { useState } from 'react';

import { type IConstituenta } from '@/features/rsform';
import { useRSFormSuspense } from '@/features/rsform/backend/use-rsform';
import { RSFormStats } from '@/features/rsform/components/rsform-stats';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';

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

  const listHeight = useFitHeight('14.5rem', '10rem');

  function handleEditCst(cst: IConstituenta) {
    showEditCst({ schema: schema, target: cst });
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

      <RSFormStats className='pr-4 py-2 ml-[-1rem]' stats={schema.stats} />
    </div>
  );
}
