'use client';

import { ModelEditContext } from '@/features/rsmodel/pages/rsmodel-page/model-edit-context';

import { notImplemented } from '@/utils/utils';

import { useSandboxBundle } from './bundle-context';

export function SandboxModelState({ children }: React.PropsWithChildren) {
  const { model, schema, engine } = useSandboxBundle();

  return (
    <ModelEditContext
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
    </ModelEditContext>
  );
}
