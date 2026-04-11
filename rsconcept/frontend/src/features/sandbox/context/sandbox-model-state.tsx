'use client';

import { RSModelContext } from '@/features/rsmodel/pages/rsmodel-page/rsmodel-context';

import { notImplemented } from '@/utils/utils';

import { useSandboxBundle } from './bundle-context';


export function SandboxModelState({ children }: React.PropsWithChildren) {
  const { model, schema, engine } = useSandboxBundle();

  return (
    <RSModelContext
      value={{
        model,
        schema,
        isMutable: true,
        isOwned: true,
        engine,
        deleteModel: notImplemented
      }}
    >
      {children}
    </RSModelContext>
  );
}
