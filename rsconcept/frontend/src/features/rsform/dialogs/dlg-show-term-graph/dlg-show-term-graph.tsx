'use client';

import { ReactFlowProvider } from '@xyflow/react';

import { useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { IconRSForm } from '@/components/icons';
import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { useRSFormSuspense } from '../../backend/use-rsform';

import { TGReadonlyFlow } from './tg-readonly-flow';

export interface DlgShowTermGraphProps {
  schemaID: number;
}

export function DlgShowTermGraph() {
  const { schemaID } = useDialogsStore(state => state.props as DlgShowTermGraphProps);
  const { schema } = useRSFormSuspense({ itemID: schemaID });
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const router = useConceptNavigation();

  function handleOpenSchema(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    event.stopPropagation();
    hideDialog();
    router.gotoTermGraph(schema.id, event.ctrlKey || event.metaKey);
  }

  return (
    <ModalView className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]' fullScreen header='Граф термов'>
      <MiniButton
        title='Открыть концептуальную схему'
        noPadding
        className='absolute z-pop top-2 left-2'
        icon={<IconRSForm size='1.25rem' className='text-primary' />}
        onClick={handleOpenSchema}
      />
      <ReactFlowProvider>
        <TGReadonlyFlow schema={schema} />
      </ReactFlowProvider>
    </ModalView>
  );
}
