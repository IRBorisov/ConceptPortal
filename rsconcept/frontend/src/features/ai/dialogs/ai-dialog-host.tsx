'use client';

import React, { Suspense } from 'react';

import { ModalLoader } from '@/components/modal';

import { AiDialogType, useAiDialogsStore } from './ai-dialog-store';

const DlgAIPromptDialog = React.lazy(() =>
  import('./dlg-ai-prompt').then(module => ({ default: module.DlgAIPromptDialog }))
);
const DlgCreatePromptTemplate = React.lazy(() =>
  import('./dlg-create-prompt-template').then(module => ({ default: module.DlgCreatePromptTemplate }))
);

export function AiDialogHost() {
  const active = useAiDialogsStore(state => state.active);

  if (active === null) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoader />}>
      {(() => {
        switch (active) {
          case AiDialogType.AI_PROMPT:
            return <DlgAIPromptDialog />;
          case AiDialogType.CREATE_PROMPT_TEMPLATE:
            return <DlgCreatePromptTemplate />;
        }
      })()}
    </Suspense>
  );
}
