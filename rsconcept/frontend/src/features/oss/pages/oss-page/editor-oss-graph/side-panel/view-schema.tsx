import { useState } from 'react';

import { useRSFormSuspense } from '@/features/rsform/backend/use-rsform';
import { RSFormStats } from '@/features/rsform/components/rsform-stats';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';

import { useFitHeight } from '@/stores/app-layout';

import { ToolbarConstituents } from './toolbar-constituents';

interface ViewSchemaProps {
  schemaID: number;
}

export function ViewSchema({ schemaID }: ViewSchemaProps) {
  const { schema } = useRSFormSuspense({ itemID: schemaID });
  const [activeID, setActiveID] = useState<number | null>(null);
  const activeCst = activeID ? schema.cstByID.get(activeID) ?? null : null;

  const listHeight = useFitHeight('14.5rem', '10rem');

  return (
    <div className='grid h-full relative cc-fade-in' style={{ gridTemplateRows: '1fr auto' }}>
      <ToolbarConstituents
        className='absolute -top-7 left-1'
        schema={schema}
        activeCst={activeCst}
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
      />

      <RSFormStats className='pr-4 py-2 ml-[-1rem]' stats={schema.stats} />
    </div>
  );
}
